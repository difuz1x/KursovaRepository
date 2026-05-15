import Database from 'better-sqlite3';

const db = new Database('./tasks.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS statuses (
    id       INTEGER PRIMARY KEY,
    name     TEXT    NOT NULL UNIQUE,
    label_ua TEXT    NOT NULL,
    color    TEXT    NOT NULL DEFAULT '#6B7280'
  );
  CREATE TABLE IF NOT EXISTS priorities (
    id       INTEGER PRIMARY KEY,
    name     TEXT    NOT NULL UNIQUE,
    label_ua TEXT    NOT NULL,
    level    INTEGER NOT NULL,
    color    TEXT    NOT NULL DEFAULT '#6B7280'
  );
  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    color      TEXT    NOT NULL DEFAULT '#6B7280',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id                TEXT    PRIMARY KEY,
    title             TEXT    NOT NULL,
    description       TEXT,
    priority_id       INTEGER NOT NULL DEFAULT 2
                      REFERENCES priorities(id) ON DELETE RESTRICT,
    status_id         INTEGER NOT NULL DEFAULT 1
                      REFERENCES statuses(id)   ON DELETE RESTRICT,
    category_id       INTEGER
                      REFERENCES categories(id) ON DELETE SET NULL,
    due_date          TEXT,
    estimated_minutes INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_status_id   ON tasks(status_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority_id ON tasks(priority_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
`);

const seed = db.prepare('SELECT COUNT(*) as c FROM statuses').get();
if (seed.c === 0) {
  db.exec(`
    INSERT INTO statuses  VALUES (1,'pending',    'Не виконано','#6B7280');
    INSERT INTO statuses  VALUES (2,'in_progress','В процесі',  '#3B82F6');
    INSERT INTO statuses  VALUES (3,'completed',  'Виконано',   '#10B981');
    INSERT INTO priorities VALUES (1,'low',   'Низький', 1,'#60A5FA');
    INSERT INTO priorities VALUES (2,'medium','Середній',2,'#FACC15');
    INSERT INTO priorities VALUES (3,'high',  'Високий', 3,'#F87171');
    INSERT INTO categories(name,color) VALUES ('Навчання','#818CF8');
    INSERT INTO categories(name,color) VALUES ('Побут',   '#34D399');
    INSERT INTO categories(name,color) VALUES ('Робота',  '#FB923C');
    INSERT INTO categories(name,color) VALUES ('Особисте','#F472B6');
  `);
}

export { db };
export const type = 'sqlite';