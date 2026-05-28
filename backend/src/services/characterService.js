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
    y: row.y
  };
}

async function createCharacterForUser(userId, username) {

  const characterName =
    username ||
    `Hero ${userId}`;

  await pool.execute(
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
}

async function getCharacterByUserId(userId) {

  const [characters] = await pool.execute(
    `
      SELECT *
      FROM characters
      WHERE user_id = :userId
      LIMIT 1
    `,
    {
      userId
    }
  );

  return characters[0]
    ? mapCharacter(characters[0])
    : null;
}

async function getOrCreateCharacterByUserId(userId, username) {

  const existingCharacter =
    await getCharacterByUserId(userId);

  if (existingCharacter) {
    return existingCharacter;
  }

  await createCharacterForUser(userId, username);

  return getCharacterByUserId(userId);
}

async function updateCharacterByUserId(userId, character) {

  function normalize(value) {
    return value === undefined
      ? null
      : value;
  }

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
    `,
    {
      userId,
      ...allowedData
    }
  );

  return getCharacterByUserId(userId);
}

module.exports = {
  createCharacterForUser,
  getOrCreateCharacterByUserId,
  updateCharacterByUserId
};
