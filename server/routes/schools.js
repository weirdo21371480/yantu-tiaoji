import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { keyword, location, category } = req.query;

  let where = [];
  let params = [];

  if (keyword) {
    where.push('(s.name LIKE ? OR s.location LIKE ? OR s.description LIKE ?)');
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw);
  }
  if (location && location !== '全部') {
    where.push('s.location = ?');
    params.push(location);
  }
  if (category && category !== '全部') {
    where.push('s.category = ?');
    params.push(category);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const schools = db.prepare(`SELECT s.* FROM schools s ${whereClause} ORDER BY s.id`).all(...params);

  const deptStmt = db.prepare('SELECT name FROM departments WHERE school_id = ?');
  const result = schools.map((s) => ({
    ...s,
    departments: deptStmt.all(s.id).map((d) => d.name),
  }));

  res.json(result);
});

router.get('/:id', (req, res) => {
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.id);
  if (!school) return res.status(404).json({ error: '院校不存在' });

  const departments = db.prepare('SELECT name FROM departments WHERE school_id = ?').all(school.id).map((d) => d.name);

  res.json({ ...school, departments });
});

export default router;
