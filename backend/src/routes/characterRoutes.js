const express = require('express');
const router = express.Router();

const {
  getCharacter,
  updateCharacter
} = require('../controllers/characterController');
const {
  requireAuth
} = require('../middlewares/authMiddleware');

router.get('/', requireAuth, getCharacter);
router.put('/', requireAuth, updateCharacter);

module.exports = router;
