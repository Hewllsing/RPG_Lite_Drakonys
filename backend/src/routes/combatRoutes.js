const express = require('express');

const router = express.Router();

const {
  attack
} = require('../controllers/combatController');

router.post('/attack', attack);

module.exports = router;