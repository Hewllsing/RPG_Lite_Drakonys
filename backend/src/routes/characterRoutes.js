const express = require('express');
const router = express.Router();

const {
  getCharacter
} = require('../controllers/characterController');

router.get('/', getCharacter);

module.exports = router;