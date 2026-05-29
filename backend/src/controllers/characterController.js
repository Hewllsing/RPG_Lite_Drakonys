const {
  createCharacterForUser,
  deleteCharacterByIdForUser,
  getCharacterByIdForUser,
  listCharactersByUserId,
  updateCharacterByIdForUser
} = require('../services/characterService');

function getCharacterId(req) {
  return Number(req.params.characterId);
}

function sendError(res, error, fallbackMessage) {
  res.status(error.status || 500).json({
    message: error.message || fallbackMessage
  });
}

async function listCharacters(req, res) {

  try {
    const characters =
      await listCharactersByUserId(req.user.id);

    res.json(characters);
  } catch (error) {
    sendError(res, error, 'Erro ao carregar personagens.');
  }
}

async function createCharacter(req, res) {

  try {
    const character =
      await createCharacterForUser(
        req.user.id,
        req.body.name,
        req.body.characterClass
      );

    res.status(201).json(character);
  } catch (error) {
    sendError(res, error, 'Erro ao criar personagem.');
  }
}

async function getCharacter(req, res) {

  try {
    const character =
      await getCharacterByIdForUser(
        req.user.id,
        getCharacterId(req)
      );

    if (!character) {
      return res.status(404).json({
        message: 'Personagem nao encontrado.'
      });
    }

    return res.json(character);
  } catch (error) {
    return sendError(res, error, 'Erro ao carregar personagem.');
  }
}

async function updateCharacter(req, res) {

  try {
    const character =
      await updateCharacterByIdForUser(
        req.user.id,
        getCharacterId(req),
        req.body
      );

    if (!character) {
      return res.status(404).json({
        message: 'Personagem nao encontrado.'
      });
    }

    return res.json(character);
  } catch (error) {
    return sendError(res, error, 'Erro ao guardar personagem.');
  }
}

async function deleteCharacter(req, res) {

  try {
    const character =
      await deleteCharacterByIdForUser(
        req.user.id,
        getCharacterId(req),
        req.body.confirmationName
      );

    res.json({
      deleted: true,
      character
    });
  } catch (error) {
    sendError(res, error, 'Erro ao deletar personagem.');
  }
}

module.exports = {
  createCharacter,
  deleteCharacter,
  getCharacter,
  listCharacters,
  updateCharacter
};
