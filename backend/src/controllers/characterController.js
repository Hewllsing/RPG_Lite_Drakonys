const {
  getCharacterData
} = require('../services/characterService');

function getCharacter(req, res) {
  const character = getCharacterData();

  res.json(character);
}

module.exports = {
  getCharacter
};