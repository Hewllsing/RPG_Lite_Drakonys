const express = require('express');

const router = express.Router();

const {
  getMonsters
} = require('../controllers/monsterController');
const {
  requireAuth
} = require('../middlewares/authMiddleware');

router.get('/', requireAuth, getMonsters);

module.exports = router;
