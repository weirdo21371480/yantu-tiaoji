import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { keyword, subject, location, degree, sort, page = 1, limit = 20 } = req.query;
  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  let where = ['status = ?'];
  let params = ['active'];

  if (keyword) {
    where.push('(school_name LIKE ? OR subject LIKE ? OR department LIKE ? OR description LIKE ? OR location LIKE ?)');
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw, kw, kw);
  }
  if (subject && subject !== '全部') {
    where.push('subject = ?');
    params.push(subject);
  }
  if (location && location !== '全部') {
    where.push('location = ?');
    params.push(location);
  }
  if (degree && degree !== '全部') {
    where.push('degree = ?');
    params.push(degree);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  let orderBy = 'ORDER BY publish_date DESC';
  switch (sort) {
    case 'deadline': orderBy = 'ORDER BY deadline ASC'; break;
    case 'score_asc': orderBy = 'ORDER BY score_requirement ASC'; break;
    case 'score_desc': orderBy = 'ORDER BY score_requirement DESC'; break;
    case 'vacancies': orderBy = 'ORDER BY vacancies DESC'; break;
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM listings ${whereClause}`).get(...params).c;
  const items = db.prepare(`SELECT * FROM listings ${whereClause} ${orderBy} LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

  const parsed = items.map((item) => ({
    ...item,
    requirements: JSON.parse(item.requirements || '[]'),
    isHot: !!item.is_hot,
  }));

  res.json({
    items: parsed,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

router.get('/hot', (_req, res) => {
  const items = db.prepare('SELECT * FROM listings WHERE status = ? AND is_hot = 1 ORDER BY publish_date DESC LIMIT 4').all('active');
  res.json(items.map((item) => ({
    ...item,
    requirements: JSON.parse(item.requirements || '[]'),
    isHot: true,
  })));
});

router.get('/latest', (_req, res) => {
  const items = db.prepare('SELECT * FROM listings WHERE status = ? ORDER BY publish_date DESC LIMIT 6').all('active');
  res.json(items.map((item) => ({
    ...item,
    requirements: JSON.parse(item.requirements || '[]'),
    isHot: !!item.is_hot,
  })));
});

router.get('/stats', (_req, res) => {
  const totalListings = db.prepare('SELECT COUNT(*) as c FROM listings WHERE status = ?').get('active').c;
  const totalSchools = db.prepare('SELECT COUNT(*) as c FROM schools').get().c;
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  res.json({ totalListings, totalSchools, totalUsers, successRate: 68.5 });
});

router.get('/subjects', (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT subject FROM listings WHERE status = ? ORDER BY subject').all('active');
  res.json(rows.map((r) => r.subject));
});

router.get('/locations', (_req, res) => {
  const rows = db.prepare('SELECT DISTINCT location FROM listings WHERE status = ? ORDER BY location').all('active');
  res.json(rows.map((r) => r.location));
});

router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: '调剂信息不存在' });
  res.json({
    ...item,
    requirements: JSON.parse(item.requirements || '[]'),
    isHot: !!item.is_hot,
  });
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  const { school_id, department, subject, degree, vacancies, score_requirement, english_requirement, math_requirement, professional_requirement, contact, phone, email, description, requirements, deadline, is_hot } = req.body;

  const school = db.prepare('SELECT name, location FROM schools WHERE id = ?').get(school_id);
  if (!school) return res.status(400).json({ error: '院校不存在' });

  const result = db.prepare(`
    INSERT INTO listings (school_id, school_name, department, subject, degree, location, vacancies,
      score_requirement, english_requirement, math_requirement, professional_requirement,
      contact, phone, email, description, requirements, publish_date, deadline, status, is_hot)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), ?, 'active', ?)
  `).run(school_id, school.name, department, subject, degree, school.location, vacancies, score_requirement, english_requirement, math_requirement, professional_requirement, contact, phone, email, description, JSON.stringify(requirements || []), deadline, is_hot ? 1 : 0);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.post('/:id/apply', authenticate, (req, res) => {
  const listingId = parseInt(req.params.id);
  const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND status = ?').get(listingId, 'active');
  if (!listing) return res.status(404).json({ error: '调剂信息不存在或已关闭' });

  try {
    db.prepare('INSERT INTO applications (user_id, listing_id, message) VALUES (?, ?, ?)').run(req.user.id, listingId, req.body.message || null);
    res.status(201).json({ message: '申请提交成功' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: '您已申请过该调剂信息' });
    }
    throw err;
  }
});

router.get('/:id/application', authenticate, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE user_id = ? AND listing_id = ?').get(req.user.id, req.params.id);
  res.json(app || null);
});

export default router;
