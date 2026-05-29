const { pool } = require('../database/connection');

const DEFAULT_EQUIPMENT = {
  weapon: null,
  armor: null,
  accessory: null
};

function parseStoredJson(value, fallbackValue) {

  if (!value) {
    return fallbackValue;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallbackValue;
  }
}

function mapCharacter(row) {

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    characterClass: row.character_class,
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
    gold: row.gold,
    inventory: parseStoredJson(
      row.inventory_json,
      []
    ),
    equipment: {
      ...DEFAULT_EQUIPMENT,
      ...parseStoredJson(
        row.equipment_json,
        DEFAULT_EQUIPMENT
      )
    },
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

function validateCharacterClass(characterClass) {

  const normalizedClass =
    characterClass?.trim().toLowerCase();
  const allowedClasses = [
    'warrior',
    'mage',
    'archer'
  ];

  if (!allowedClasses.includes(normalizedClass)) {
    const error = new Error('Classe do personagem invalida.');
    error.status = 400;
    throw error;
  }

  return normalizedClass;
}

function getClassBaseStats(characterClass) {

  const statsByClass = {
    warrior: {
      hp: 120,
      maxHp: 120,
      mana: 35,
      maxMana: 35,
      strength: 8,
      intelligence: 3,
      dexterity: 5
    },
    mage: {
      hp: 80,
      maxHp: 80,
      mana: 90,
      maxMana: 90,
      strength: 3,
      intelligence: 9,
      dexterity: 4
    },
    archer: {
      hp: 95,
      maxHp: 95,
      mana: 55,
      maxMana: 55,
      strength: 5,
      intelligence: 4,
      dexterity: 9
    }
  };

  return statsByClass[characterClass];
}

function getStarterInventory(characterClass) {

  const startersByClass = {
    warrior: [
      {
        itemId: 'small-health-potion',
        quantity: 3
      },
      {
        itemId: 'small-mana-potion',
        quantity: 1
      }
    ],
    mage: [
      {
        itemId: 'small-health-potion',
        quantity: 2
      },
      {
        itemId: 'small-mana-potion',
        quantity: 3
      }
    ],
    archer: [
      {
        itemId: 'small-health-potion',
        quantity: 2
      },
      {
        itemId: 'small-mana-potion',
        quantity: 2
      }
    ]
  };

  return startersByClass[characterClass] || [];
}

function getStarterEquipment(characterClass) {

  const startersByClass = {
    warrior: {
      weapon: 'training-sword',
      armor: 'leather-tunic',
      accessory: null
    },
    mage: {
      weapon: 'apprentice-staff',
      armor: 'cloth-robe',
      accessory: 'focus-charm'
    },
    archer: {
      weapon: 'hunter-bow',
      armor: 'leather-tunic',
      accessory: null
    }
  };

  return startersByClass[characterClass] || DEFAULT_EQUIPMENT;
}

function normalizeInventory(inventory) {

  if (!Array.isArray(inventory)) {
    return [];
  }

  return inventory
    .filter(item => item && item.itemId)
    .map(item => ({
      itemId: String(item.itemId),
      quantity: Math.max(
        1,
        Number(item.quantity) || 1
      )
    }));
}

function normalizeEquipment(equipment) {

  if (!equipment || typeof equipment !== 'object') {
    return {
      ...DEFAULT_EQUIPMENT
    };
  }

  return {
    weapon: equipment.weapon || null,
    armor: equipment.armor || null,
    accessory: equipment.accessory || null
  };
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

async function createCharacterForUser(userId, name, characterClass = 'warrior') {

  const characterName = validateCharacterName(name);
  const selectedClass =
    validateCharacterClass(characterClass);
  const baseStats =
    getClassBaseStats(selectedClass);
  const starterInventory = JSON.stringify(
    getStarterInventory(selectedClass)
  );
  const starterEquipment = JSON.stringify(
    getStarterEquipment(selectedClass)
  );

  try {
    const [result] = await pool.execute(
      `
        INSERT INTO characters (
          user_id,
          name,
          character_class,
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
          gold,
          inventory_json,
          equipment_json,
          current_zone,
          x,
          y
        )
        VALUES (
          :userId,
          :name,
          :characterClass,
          1,
          0,
          :hp,
          :maxHp,
          :mana,
          :maxMana,
          :strength,
          :intelligence,
          :dexterity,
          0,
          0,
          :inventoryJson,
          :equipmentJson,
          'Goblin Forest',
          5,
          5
        )
      `,
      {
        userId,
        name: characterName,
        characterClass: selectedClass,
        inventoryJson: starterInventory,
        equipmentJson: starterEquipment,
        ...baseStats
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
    gold: normalize(character.gold),
    inventoryJson:
      character.inventory === undefined
        ? null
        : JSON.stringify(
          normalizeInventory(character.inventory)
        ),
    equipmentJson:
      character.equipment === undefined
        ? null
        : JSON.stringify(
          normalizeEquipment(character.equipment)
        ),
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
          gold = COALESCE(:gold, gold),
          inventory_json = COALESCE(:inventoryJson, inventory_json),
          equipment_json = COALESCE(:equipmentJson, equipment_json),
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
