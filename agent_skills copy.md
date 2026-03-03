# EL Education K-8 Curriculum Agent Skills

## What's Available
You have access to 1,190 parsed lessons from the EL Education K-8 
English Language Arts curriculum, covering Grades 1-8.

## Two Ways to Access Data

### 1. SQLite Database (`output/curriculum.db`)
Use this for precise, structured queries.

**Table: lessons**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique ID e.g. g6-m1-u1-l1 |
| grade | INTEGER | Grade level 1-8 |
| module | INTEGER | Module number 1-4 |
| unit | INTEGER | Unit number 1-3 |
| lesson | INTEGER | Lesson number |
| title | TEXT | Full lesson title |
| standards | TEXT | JSON array of CCSS codes |
| learning_targets | TEXT | JSON array of targets |
| materials | TEXT | JSON array of materials |
| vocabulary | TEXT | JSON array of vocab terms |
| ell_support | TEXT | ELL support notes |
| agenda | TEXT | Lesson agenda |
| filepath | TEXT | Path to Markdown file |

**Example queries:**
```sql
-- Get learning targets for a specific lesson
SELECT learning_targets FROM lessons 
WHERE grade=6 AND module=1 AND unit=2 AND lesson=3;

-- Find all Grade 3 lessons covering a standard
SELECT title, grade, module, unit, lesson 
FROM lessons 
WHERE standards LIKE '%RL.3.1%';

-- Get materials for tomorrow's lesson
SELECT materials FROM lessons 
WHERE grade=5 AND module=2 AND unit=1 AND lesson=4;
```

### 2. Markdown Files (`output/lessons/`)
Use these to read full lesson content.

**Structure:**
```
output/lessons/
  grade-{1-8}/
    module-{1-4}/
      unit-{1-3}/
        lesson-{N}.md
```

**Example:** `output/lessons/grade-6/module-1/unit-1/lesson-1.md`

Each file has YAML frontmatter with metadata, followed by sections for 
Learning Targets, Standards, Agenda, Materials, Vocabulary, and ELL Support.

## Example Questions You Can Answer

- "What are the learning targets for Grade 6, Module 1, Unit 2, Lesson 3?"
  → Query the database or read the Markdown file directly

- "Which Grade 3 lessons cover standard RL.3.1?"
  → Query: SELECT title FROM lessons WHERE grade=3 AND standards LIKE '%RL.3.1%'

- "What materials do I need for tomorrow's lesson?"
  → Read the materials field from the relevant Markdown file

- "Compare how vocabulary is taught across grade bands"
  → Query vocabulary fields across multiple grade levels and summarize patterns