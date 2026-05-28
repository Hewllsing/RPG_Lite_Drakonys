const {
  getOrCreateCharacterByUserId,
  updateCharacterByUserId
} = require('../services/characterService');

async function getCharacter(req, res) {

  try {
    const character =
      await getOrCreateCharacterByUserId(
        req.user.id,
        req.user.user
      );

    res.json(character);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao carregar personagem.'
    });
  }
}

async function updateCharacter(req, res) {

  try {
    const character =
      await updateCharacterByUserId(
        req.user.id,
        req.body
      );

    res.json(character);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao guardar personagem.'
    });
  }
}

module.exports = {
  getCharacter,
  updateCharacter
};
