import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import Database from 'better-sqlite3';

interface Lesson {
    id: string;
    grade: number;
    module: number;
    unit: number;
    lesson: number;
    title: string;
    standards: string[];
    learningTargets: string[];
    materials: string[];
    vocabulary: string[];
    ellSupport: string;
    agenda: string;
    filepath: string;
}

const HTML_DIR = '/Users/zakiyawilliams/Downloads/el-curriculum-takehome/lessons';
const OUTPUT_DIR = './output';
const DB_PATH = './output/curriculum.db';

function parseLesson(filepath: string): Lesson | null {
    const html = fs.readFileSync(filepath, 'utf-8');
    const $ = cheerio.load(html);

    if (!html.includes('learning_targets')) return null;

    const title = $('h1').first().text().trim();

    const standards: string[] = [];
    $('a.ccss-ela, abbr.ccss-ela').each((_, el) => {
        const text = $(el).text().trim();
        if (text && !standards.includes(text)) standards.push(text);
    });

    const learningTargets: string[] = [];
    $('[id$="-learning_targets"] li p').each((_, el) => {
        learningTargets.push($(el).text().trim());
    });

    const materials: string[] = [];
    $('[id$="-teacher_materials"] li p, [id$="-student_materials"] li p').each((_, el) => {
        materials.push($(el).text().trim());
    });

    const vocabulary: string[] = [];
    $('[id$="-vocabulary"] li').each((_, el) => {
        vocabulary.push($(el).text().trim());
    });

    const ellSupport = $('[id$="-supporting_ells"]').text().trim().slice(0, 500);
    const agenda = $('[id$="-agenda"]').text().trim().slice(0, 1000);

    const filename = path.basename(filepath);
    const match = filename.match(/grade-(\d+)-module-(\d+)-unit-(\d+)-lesson-(\d+)/);

    if (!match) return null;

    const grade = parseInt(match[1]);
    const module = parseInt(match[2]);
    const unit = parseInt(match[3]);
    const lesson = parseInt(match[4]);
    const id = `g${grade}-m${module}-u${unit}-l${lesson}`;

    return { id, grade, module, unit, lesson, title, standards, learningTargets, materials, vocabulary, ellSupport, agenda, filepath };
}

function createDatabase(lessons: Lesson[]): void {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const db = new Database(DB_PATH);

    db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      grade INTEGER,
      module INTEGER,
      unit INTEGER,
      lesson INTEGER,
      title TEXT,
      standards TEXT,
      learning_targets TEXT,
      materials TEXT,
      vocabulary TEXT,
      ell_support TEXT,
      agenda TEXT,
      filepath TEXT
    )
  `);

    const insert = db.prepare(`
    INSERT OR REPLACE INTO lessons VALUES (
      @id, @grade, @module, @unit, @lesson, @title,
      @standards, @learning_targets, @materials,
      @vocabulary, @ell_support, @agenda, @filepath
    )
  `);

    for (const lesson of lessons) {
        insert.run({
            id: lesson.id,
            grade: lesson.grade,
            module: lesson.module,
            unit: lesson.unit,
            lesson: lesson.lesson,
            title: lesson.title,
            standards: JSON.stringify(lesson.standards),
            learning_targets: JSON.stringify(lesson.learningTargets),
            materials: JSON.stringify(lesson.materials),
            vocabulary: JSON.stringify(lesson.vocabulary),
            ell_support: lesson.ellSupport,
            agenda: lesson.agenda,
            filepath: lesson.filepath
        });
    }

    db.close();
    console.log(`✅ Database created with ${lessons.length} lessons`);
}

function main(): void {
    console.log('🔍 Scanning for HTML files...');

    const files: string[] = [];

    function scanDir(dir: string): void {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                scanDir(fullPath);
            } else if (entry.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }

    scanDir(HTML_DIR);
    console.log(`📁 Found ${files.length} HTML files`);
    console.log('First file found:', files[0]);

    const lessons: Lesson[] = [];
    for (const file of files) {
        const lesson = parseLesson(file);
        if (lesson) {
            lessons.push(lesson);
            writeMarkdown(lesson);
        }
    }
    console.log(`📚 Parsed ${lessons.length} lessons`);

    createDatabase(lessons);
}

main();


function writeMarkdown(lesson: Lesson): void {
    const dir = `./output/lessons/grade-${lesson.grade}/module-${lesson.module}/unit-${lesson.unit}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filepath = `${dir}/lesson-${lesson.lesson}.md`;

    const content = `---
  id: ${lesson.id}
  grade: ${lesson.grade}
  module: ${lesson.module}
  unit: ${lesson.unit}
  lesson: ${lesson.lesson}
  title: "${lesson.title}"
  standards: ${JSON.stringify(lesson.standards)}
  ---
  
  # ${lesson.title}
  
  ## Learning Targets
  ${lesson.learningTargets.map(t => `- ${t}`).join('\n')}
  
  ## Standards
  ${lesson.standards.join(', ')}
  
  ## Agenda
  ${lesson.agenda}
  
  ## Materials
  ${lesson.materials.map(m => `- ${m}`).join('\n')}
  
  ## Vocabulary
  ${lesson.vocabulary.join('\n')}
  
  ## ELL Support
  ${lesson.ellSupport}
  `;

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`Written: ${filepath}`);
}