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

// POST /api/students
router.post('/', (req, res) => {
  const { telegramId, name, phone, group } = req.body;
  if (!telegramId || !name || !phone) {
    return res.status(400).json({ error: 'telegramId, name, phone majburiy' });
  }
  const existing = db.getStudentByTelegramId(telegramId);
  if (existing) {
    return res.json(existing);
  }
  const student = db.createStudent({ telegramId, name, phone, group });
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
