const WEAPON_PROFILES = {
  warrior: {
    weaponType: 'sword',
    damageType: 'physical',
    range: 1,
    baseDamage: 6,
    primaryAttribute: 'strength',
    primaryScale: 2,
    secondaryAttribute: 'dexterity',
    secondaryScale: 0.4,
    accuracyBonus: 0,
    criticalBonus: 0
  },
  mage: {
    weaponType: 'staff',
    damageType: 'magical',
    range: 3,
    baseDamage: 5,
    primaryAttribute: 'intelligence',
    primaryScale: 2.2,
    secondaryAttribute: 'dexterity',
    secondaryScale: 0.25,
    accuracyBonus: 0.02,
    criticalBonus: 0
  },
  archer: {
    weaponType: 'bow',
    damageType: 'physical',
    range: 4,
    baseDamage: 4,
    primaryAttribute: 'dexterity',
    primaryScale: 1.7,
    secondaryAttribute: 'strength',
    secondaryScale: 0.8,
    accuracyBonus: 0.05,
    criticalBonus: 0.05
  }
};

const DEFAULT_EQUIPMENT = {
  weapon: null,
  armor: null,
  accessory: null
};

const ITEM_DEFINITIONS = {
  'training-sword': {
    bonuses: {
      strength: 1
    }
  },
  'apprentice-staff': {
    bonuses: {
      intelligence: 2,
      magicDamage: 2
    }
  },
  'hunter-bow': {
    bonuses: {
      dexterity: 2,
      attackRange: 1
    }
  },
  'leather-tunic': {
    bonuses: {
      armor: 2,
      maxHp: 8
    }
  },
  'cloth-robe': {
    bonuses: {
      maxMana: 12,
      cooldownReduction: 4
    }
  },
  'focus-charm': {
    bonuses: {
      intelligence: 1,
      maxMana: 6
    }
  },
  'rusty-dagger': {
    bonuses: {
      dexterity: 1,
      criticalChance: 3
    }
  },
  'scout-badge': {
    bonuses: {
      dexterity: 1,
      evasion: 4
    }
  },
  'brute-pauldron': {
    bonuses: {
      armor: 4,
      strength: 1,
      maxHp: 12
    }
  },
  'infernal-shard': {
    bonuses: {
      intelligence: 2,
      magicDamage: 3
    }
  },
  'demonic-ember': {
    bonuses: {
      criticalChance: 5,
      strength: 1,
      intelligence: 1
    }
  }
};

const RACE_DEFENSES = {
  demon: {
    armor: 4,
    magicResistance: 3,
    evasion: 0.02
  },
  elf: {
    armor: 1,
    magicResistance: 2,
    evasion: 0.08
  },
  goblin: {
    armor: 0,
    magicResistance: 0,
    evasion: 0.04
  },
  orc: {
    armor: 3,
    magicResistance: 1,
    evasion: 0.01
  },
  skeleton: {
    armor: 2,
    magicResistance: 2,
    evasion: 0.02
  }
};

function getNumber(value) {
  return Number(value) || 0;
}

function getWeaponProfile(player) {
  const characterClass =
    player.characterClass || player.character_class || 'warrior';

  return WEAPON_PROFILES[characterClass] || WEAPON_PROFILES.warrior;
}

function normalizeEquipment(player) {
  const equipment =
    player?.equipment && typeof player.equipment === 'object'
      ? player.equipment
      : DEFAULT_EQUIPMENT;

  return {
    weapon: equipment.weapon || null,
    armor: equipment.armor || null,
    accessory: equipment.accessory || null
  };
}

function getEquipmentBonus(player, stat) {
  const equipment =
    normalizeEquipment(player);

  return Object.values(equipment).reduce((total, itemId) => {
    if (!itemId) {
      return total;
    }

    return total + (
      getNumber(
        ITEM_DEFINITIONS[itemId]?.bonuses?.[stat]
      )
    );
  }, 0);
}

function getEffectiveAttribute(player, attribute) {
  return getNumber(player[attribute]) +
    getEquipmentBonus(player, attribute);
}

function getAttackRange(player, profile) {
  return profile.range +
    getEquipmentBonus(player, 'attackRange');
}

function getDistance(attacker, target) {
  return Math.max(
    Math.abs(getNumber(attacker.x) - getNumber(target.x)),
    Math.abs(getNumber(attacker.y) - getNumber(target.y))
  );
}

function getMonsterDefense(monster, damageType) {
  const race =
    monster.spriteKey ||
    monster.race?.toLowerCase() ||
    'goblin';
  const raceDefense =
    RACE_DEFENSES[race] || RACE_DEFENSES.goblin;
  const level = getNumber(monster.level) || 1;

  // Defesa dos monstros e derivada de level + raca por enquanto.
  return {
    mitigation:
      damageType === 'magical'
        ? Math.floor(level * 0.4) + raceDefense.magicResistance
        : Math.floor(level * 0.6) + raceDefense.armor,
    evasion: Math.min(
      0.28,
      0.03 + level * 0.005 + raceDefense.evasion
    )
  };
}

function calculateAttack(player, monster) {
  const profile = getWeaponProfile(player);
  const dexterity =
    getEffectiveAttribute(player, 'dexterity');
  const level = getNumber(player.level) || 1;
  const monsterDefense =
    getMonsterDefense(monster, profile.damageType);
  const primaryValue =
    getEffectiveAttribute(player, profile.primaryAttribute);
  const secondaryValue =
    getEffectiveAttribute(player, profile.secondaryAttribute);
  const accuracyChance = Math.min(
    0.98,
    0.76 +
      dexterity * 0.012 +
      level * 0.003 +
      profile.accuracyBonus +
      getEquipmentBonus(player, 'accuracy') / 100
  );
  const criticalChance = Math.min(
    0.45,
    0.04 +
      dexterity * 0.015 +
      profile.criticalBonus +
      getEquipmentBonus(player, 'criticalChance') / 100
  );
  const magicDamageBonus =
    profile.damageType === 'magical'
      ? getEquipmentBonus(player, 'magicDamage')
      : 0;
  const hit = Math.random() <= accuracyChance;
  const dodged =
    hit && Math.random() < monsterDefense.evasion;
  const critical =
    hit && !dodged && Math.random() <= criticalChance;
  const rawDamage = Math.floor(
    profile.baseDamage +
      primaryValue * profile.primaryScale +
      secondaryValue * profile.secondaryScale +
      magicDamageBonus +
      level
  );

  if (!hit || dodged) {
    return {
      damage: 0,
      hit,
      dodged,
      critical,
      rawDamage,
      armor: monsterDefense.mitigation,
      accuracyChance,
      criticalChance,
      weaponType: profile.weaponType,
      damageType: profile.damageType,
      range: getAttackRange(player, profile)
    };
  }

  let damage =
    Math.max(1, rawDamage - monsterDefense.mitigation);

  if (critical) {
    damage = Math.floor(damage * 1.5);
  }

  return {
    damage,
    hit,
    dodged,
    critical,
    rawDamage,
    armor: monsterDefense.mitigation,
    accuracyChance,
    criticalChance,
    weaponType: profile.weaponType,
    damageType: profile.damageType,
    range: getAttackRange(player, profile)
  };
}

function attackMonster(player, monster) {
  const profile = getWeaponProfile(player);
  const range =
    getAttackRange(player, profile);
  const distance = getDistance(player, monster);

  if (distance > range) {
    return {
      damage: 0,
      monster,
      hit: false,
      dodged: false,
      critical: false,
      killed: false,
      xpGained: 0,
      outOfRange: true,
      range,
      weaponType: profile.weaponType,
      damageType: profile.damageType
    };
  }

  const attack = calculateAttack(player, monster);

  monster.hp = Math.max(0, monster.hp - attack.damage);

  const killed = monster.hp <= 0;
  const xpGained =
    killed
      ? monster.level * 20
      : 0;

  return {
    ...attack,
    monster,
    killed,
    xpGained,
    outOfRange: false
  };
}

module.exports = {
  attackMonster
};
