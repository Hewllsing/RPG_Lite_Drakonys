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
  const dexterity = getNumber(player.dexterity);
  const level = getNumber(player.level) || 1;
  const monsterDefense =
    getMonsterDefense(monster, profile.damageType);
  const primaryValue =
    getNumber(player[profile.primaryAttribute]);
  const secondaryValue =
    getNumber(player[profile.secondaryAttribute]);
  const accuracyChance = Math.min(
    0.98,
    0.76 + dexterity * 0.012 + level * 0.003 + profile.accuracyBonus
  );
  const criticalChance = Math.min(
    0.45,
    0.04 + dexterity * 0.015 + profile.criticalBonus
  );
  const hit = Math.random() <= accuracyChance;
  const dodged =
    hit && Math.random() < monsterDefense.evasion;
  const critical =
    hit && !dodged && Math.random() <= criticalChance;
  const rawDamage = Math.floor(
    profile.baseDamage +
      primaryValue * profile.primaryScale +
      secondaryValue * profile.secondaryScale +
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
      range: profile.range
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
    range: profile.range
  };
}

function attackMonster(player, monster) {
  const profile = getWeaponProfile(player);
  const distance = getDistance(player, monster);

  if (distance > profile.range) {
    return {
      damage: 0,
      monster,
      hit: false,
      dodged: false,
      critical: false,
      killed: false,
      xpGained: 0,
      outOfRange: true,
      range: profile.range,
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
