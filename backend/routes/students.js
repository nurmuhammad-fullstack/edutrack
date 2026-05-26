const express = require('express');
const router = express.Router();
const db = require('../db');
const { notifyStudent } = require('../bot');

// GET /api/students
router.get('/', (req, res) => {
  const { status } = req.query;
  const students = status ? db.getStudentsByStatus(status) : db.getAllStudents();
  res.json(students);
});

// GET /api/students/me?telegram_id=...
router.get('/me', (req, res) => {
  const { telegram_id } = req.query;
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id kerak' });
  const student = db.getStudentByTelegramId(telegram_id);
  res.json(student || null);
});

// POST /api/students
router.post('/', (req, res) => {
  // frontend full_name/group_id/telegram_id yuboradi
  const telegramId = req.body.telegram_id ?? req.body.telegramId;
  const full_name  = req.body.full_name ?? req.body.name;
  const phone      = req.body.phone;
  const group_id   = req.body.group_id ?? req.body.group;

  if (!telegramId || !full_name || !phone) {
    return res.status(400).json({ error: 'telegram_id, full_name, phone majburiy' });
  }
  const existing = db.getStudentByTelegramId(telegramId);
  if (existing) return res.json(existing);

  const student = db.createStudent({ telegramId: String(telegramId), full_name, phone, group_id });
  res.status(201).json(student);
});

// PATCH /api/students/:id/confirm
router.patch('/:id/confirm', async (req, res) => {
  const student = db.updateStudentStatus(req.params.id, 'active');
  if (!student) return res.status(404).json({ error: 'Topilmadi' });
  await notifyStudent(student.telegramId, 'active');
  res.json(student);
});

// PATCH /api/students/:id/reject
router.patch('/:id/reject', async (req, res) => {
  const student = db.updateStudentStatus(req.params.id, 'rejected');
  if (!student) return res.status(404).json({ error: 'Topilmadi' });
  await notifyStudent(student.telegramId, 'rejected');
  res.json(student);
});

module.exports = router;
