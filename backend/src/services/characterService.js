const { pool } = require('../database/connection');

function mapCharacter(row) {

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    level: row.level,
    xp: row.xp,
    hp: row.hp,
    maxHp: row.max_hp,
    mana: row.mana,
    maxMana: row.max_mana,
    strength: row.strength,
    intelligence: row.intelligence,
    dexterity: row.dexterity,
    attributePoints: row.attribute_points,
    currentZone: row.current_zone,
    x: row.x,
    y: row.y,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalize(value) {
  return value === undefined
    ? null
    : value;
}

function validateCharacterName(name) {

  const characterName = name?.trim();

  if (!characterName) {
    const error = new Error('Nome do personagem e obrigatorio.');
    error.status = 400;
    throw error;
  }

  if (characterName.length > 60) {
    const error = new Error('Nome do personagem deve ter no maximo 60 caracteres.');
    error.status = 400;
    throw error;
  }

  return characterName;
}

async function listCharactersByUserId(userId) {

  const [characters] = await pool.execute(
    `
      SELECT *
      FROM characters
      WHERE user_id = :userId
      ORDER BY updated_at DESC, id DESC
    `,
    {
      userId
    }
  );

  return characters.map(mapCharacter);
}

async function createCharacterForUser(userId, name) {

  const characterName = validateCharacterName(name);

  try {
    const [result] = await pool.execute(
      `
        INSERT INTO characters (
          user_id,
          name,
          level,
          xp,
          hp,
          max_hp,
          mana,
          max_mana,
          strength,
          intelligence,
          dexterity,
          attribute_points,
          current_zone,
          x,
          y
        )
        VALUES (
          :userId,
          :name,
          1,
          0,
          100,
          100,
          50,
          50,
          5,
          5,
          5,
          0,
          'Goblin Forest',
          5,
          5
        )
      `,
      {
        userId,
        name: characterName
      }
    );

    return getCharacterByIdForUser(userId, result.insertId);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('Ja existe um personagem com esse nome.');
      duplicateError.status = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function getCharacterByIdForUser(userId, characterId) {

  const [characters] = await pool.execute(
    `
      SELECT *
      FROM characters
      WHERE user_id = :userId
        AND id = :characterId
      LIMIT 1
    `,
    {
      userId,
      characterId
    }
  );

  return characters[0]
    ? mapCharacter(characters[0])
    : null;
}

async function updateCharacterByIdForUser(userId, characterId, character) {

  const allowedData = {
    name: normalize(character.name),
    level: normalize(character.level),
    xp: normalize(character.xp),
    hp: normalize(character.hp),
    maxHp: normalize(character.maxHp),
    mana: normalize(character.mana),
    maxMana: normalize(character.maxMana),
    strength: normalize(character.strength),
    intelligence: normalize(character.intelligence),
    dexterity: normalize(character.dexterity),
    attributePoints: normalize(character.attributePoints),
    currentZone: normalize(character.currentZone),
    x: normalize(character.x),
    y: normalize(character.y)
  };

  if (allowedData.name !== null) {
    allowedData.name = validateCharacterName(allowedData.name);
  }

  try {
    await pool.execute(
      `
        UPDATE characters
        SET
          name = COALESCE(:name, name),
          level = COALESCE(:level, level),
          xp = COALESCE(:xp, xp),
          hp = COALESCE(:hp, hp),
          max_hp = COALESCE(:maxHp, max_hp),
          mana = COALESCE(:mana, mana),
          max_mana = COALESCE(:maxMana, max_mana),
          strength = COALESCE(:strength, strength),
          intelligence = COALESCE(:intelligence, intelligence),
          dexterity = COALESCE(:dexterity, dexterity),
          attribute_points = COALESCE(:attributePoints, attribute_points),
          current_zone = COALESCE(:currentZone, current_zone),
          x = COALESCE(:x, x),
          y = COALESCE(:y, y)
        WHERE user_id = :userId
          AND id = :characterId
      `,
      {
        userId,
        characterId,
        ...allowedData
      }
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('Ja existe um personagem com esse nome.');
      duplicateError.status = 409;
      throw duplicateError;
    }

    throw error;
  }

  return getCharacterByIdForUser(userId, characterId);
}

async function deleteCharacterByIdForUser(userId, characterId, confirmationName) {

  const character =
    await getCharacterByIdForUser(userId, characterId);

  if (!character) {
    const error = new Error('Personagem nao encontrado.');
    error.status = 404;
    throw error;
  }

  if (confirmationName !== character.name) {
    const error = new Error('O nome de confirmacao nao corresponde ao personagem.');
    error.status = 400;
    throw error;
  }

  await pool.execute(
    `
      DELETE FROM characters
      WHERE user_id = :userId
        AND id = :characterId
    `,
    {
      userId,
      characterId
    }
  );

  return character;
}

module.exports = {
  createCharacterForUser,
  deleteCharacterByIdForUser,
  getCharacterByIdForUser,
  listCharactersByUserId,
  updateCharacterByIdForUser
};
