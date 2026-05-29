const express = require('express');
const router = express.Router();

const {
  createCharacter,
  deleteCharacter,
  getCharacter,
  listCharacters,
  updateCharacter
} = require('../controllers/characterController');
const {
  requireAuth
} = require('../middlewares/authMiddleware');

router.get('/', requireAuth, listCharacters);
router.post('/', requireAuth, createCharacter);
router.get('/:characterId', requireAuth, getCharacter);
router.put('/:characterId', requireAuth, updateCharacter);
router.delete('/:characterId', requireAuth, deleteCharacter);

module.exports = router;
