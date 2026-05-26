const express = require('express');
const router = express.Router();

// Hozircha bo'sh — to'lovlar qo'shilganda to'ldiriladi
router.get('/', (req, res) => res.json([]));

module.exports = router;
