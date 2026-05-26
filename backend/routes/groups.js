const express = require('express');
const router = express.Router();

const GROUPS = [
  { id: 1, name: "1-guruh · Boshlang'ich", monthly_fee: 450000 },
  { id: 2, name: "2-guruh · O'rta",        monthly_fee: 500000 },
  { id: 3, name: "3-guruh · Yuqori",       monthly_fee: 600000 },
];

router.get('/', (req, res) => res.json(GROUPS));

module.exports = router;
