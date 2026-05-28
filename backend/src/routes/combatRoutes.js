const express = require('express');

const router = express.Router();

const {
    attack
} = require('../controllers/combatController');
const {
    requireAuth
} = require('../middlewares/authMiddleware');

router.post('/attack', requireAuth, attack);

module.exports = router;
