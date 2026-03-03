# EL Education Curriculum Agent

A TypeScript pipeline that transforms 1,327 raw HTML lesson files from the EL Education K-8 English Language Arts curriculum into a structured, queryable environment for AI coding agents.

# The Problem
The raw curriculum data was a set of HTML files scraped from a publisher's 
website. Each file contained navigation chrome, headers, footers, and 
sidebars mixed in with the actual lesson content. This format is not useful 
to an AI agent.

# The Solution
A parser that strips the noise and extracts clean, structured data from each 
lesson, then stores it in two agent friendly formats:

1. SQLite database - for precise, fast structured queries
2. Markdown files - for rich, readable lesson content

# What It Extracts
From each of the 1,190 lesson pages:
- Grade, module, unit, and lesson number
- Lesson title
- CCSS standards (focus and supporting)
- Daily learning targets
- Materials (teacher and student)
- Vocabulary (academic and domain specific)
- ELL support notes
- Lesson agenda

# Tech Stack
- TypeScript
- [Cheerio](https://cheerio.js.org/) — HTML parsing
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — SQLite database
- Node.js v22

# How It Works

# 1. HTML Parsing
Each lesson file has consistent `section` IDs like `learning_targets`, 
`standards`, `materials`, and `supporting_ells`. Cheerio selects these 
directly using CSS-style attribute selectors.

Grade, module, unit, and lesson numbers are extracted from the filename 
using a regex.

# 2. SQLite Database
All 1,190 lessons are stored in a single `lessons` table. Arrays like 
standards and materials are stored as JSON strings.

Example queries an agent can run:
Find all Grade 3 lessons covering a specific standard
* SELECT title, module, unit, lesson 
* FROM lessons 
* WHERE grade=3 AND standards LIKE '%RL.3.1%';

Get materials for a specific lesson
* SELECT materials FROM lessons 
* WHERE grade=6 AND module=1 AND unit=2 AND lesson=3;

Compare vocabulary across grade bands
* SELECT grade, vocabulary FROM lessons 
* WHERE module=1 AND unit=1 AND lesson=1
* ORDER BY grade;

# 3. Markdown Files
One Markdown file per lesson, organized by grade/module/unit. Each file 
has YAML frontmatter for metadata and human readable sections for all 
lesson content.
```
output/lessons/
  grade-{1-8}/
    module-{1-4}/
      unit-{1-3}/
        lesson-{N}.md
```

# Getting Started
```bash
# Install dependencies
npm install

# Point the parser at your HTML files
# Edit HTML_DIR in parse.ts to your local path

# Run the parser
npx tsx parse.ts
```

Output will be generated in the `output/` folder.

# Results
- 1,327 HTML files scanned
- 1,190 lessons successfully parsed
- 1 SQLite database generated
- 1,190 Markdown files generated

# Tradeoffs
Structured data over vector embeddings, I chose SQLite plus Markdown 
over a vector database. This approach works entirely locally with no 
external APIs, gives the agent precise structured lookups, and is 
immediately usable by any AI coding agent (Claude Code, Cursor, etc.) 
without additional setup.

# Known gap — 137 combined lessons (e.g. "Lesson 7-8") use a different 
filename pattern and were not parsed. Expanding the filename regex would 
capture these.
