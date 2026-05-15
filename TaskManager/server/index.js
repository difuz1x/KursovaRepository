import express from 'express';
import cors    from 'cors';
import { db }  from './db.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const Q = {
  all: (sql, params = []) => db.prepare(sql).all(...params),
  get: (sql, params = []) => db.prepare(sql).get(...params),
  run: (sql, params = []) => db.prepare(sql).run(...params),
};

const TASKS_SELECT = `
  SELECT
    t.id, t.title, t.description,
    t.due_date          AS dueDate,
    t.estimated_minutes AS estimatedMinutes,
    t.created_at        AS createdAt,
    t.priority_id       AS priorityId,
    t.status_id         AS statusId,
    t.category_id       AS categoryId,
    p.label_ua          AS priorityLabel,
    p.level             AS priorityLevel,
    p.color             AS priorityColor,
    s.label_ua          AS statusLabel,
    s.color             AS statusColor,
    c.name              AS categoryName,
    c.color             AS categoryColor
  FROM tasks t
  LEFT JOIN priorities p ON t.priority_id = p.id
  LEFT JOIN statuses   s ON t.status_id   = s.id
  LEFT JOIN categories c ON t.category_id = c.id
`;

// ── Tasks ──────────────────────────────────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  try {
    res.json(Q.all(TASKS_SELECT + 'ORDER BY t.created_at ASC'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tasks', (req, res) => {
  const { id, title, description, priorityId, statusId,
          categoryId, dueDate, estimatedMinutes, createdAt } = req.body;
  try {
    Q.run(
      `INSERT INTO tasks
       (id,title,description,priority_id,status_id,category_id,due_date,estimated_minutes,created_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, title, description ?? null, priorityId ?? 2, statusId ?? 1,
       categoryId ?? null, dueDate ?? null, estimatedMinutes ?? 0,
       createdAt ?? new Date().toISOString()]
    );
    res.status(201).json(Q.get(TASKS_SELECT + 'WHERE t.id = ?', [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, priorityId, statusId,
          categoryId, dueDate, estimatedMinutes } = req.body;
  try {
    Q.run(
      `UPDATE tasks SET title=?,description=?,priority_id=?,status_id=?,
       category_id=?,due_date=?,estimated_minutes=? WHERE id=?`,
      [title, description ?? null, priorityId, statusId,
       categoryId ?? null, dueDate ?? null, estimatedMinutes, id]
    );
    res.json(Q.get(TASKS_SELECT + 'WHERE t.id = ?', [id]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    Q.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/tasks', (req, res) => {
  try {
    Q.run('DELETE FROM tasks');
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Довідники ──────────────────────────────────────────────────────────────
app.get('/api/statuses',   (_, res) => res.json(Q.all('SELECT * FROM statuses ORDER BY id')));
app.get('/api/priorities', (_, res) => res.json(Q.all('SELECT * FROM priorities ORDER BY level')));
app.get('/api/categories', (_, res) => res.json(Q.all('SELECT * FROM categories ORDER BY name')));

app.post('/api/categories', (req, res) => {
  const { name, color } = req.body;
  try {
    const r = Q.run('INSERT INTO categories(name,color) VALUES(?,?)', [name, color ?? '#6B7280']);
    res.status(201).json({ id: r.lastInsertRowid, name, color });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    Q.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(3001, () => console.log('API → http://localhost:3001'));