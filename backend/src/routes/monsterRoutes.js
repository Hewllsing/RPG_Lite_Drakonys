const express = require('express');

const router = express.Router();

const {
  getMonsters
} = require('../controllers/monsterController');

router.get('/', getMonsters);

module.exports = router;