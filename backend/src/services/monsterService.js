function getMonstersByZone(zone) {

  const monsters = {
    'Goblin Forest': [
      {
        id: 1,
        name: 'Goblin',
        race: 'Goblin',
        spriteKey: 'goblin',
        level: 1,
        maxHp: 40,
        hp: 40,
        damage: 7,
        agroRange: 5,
        attackRange: 1,
        attackCooldown: 1600,
        lastAttackAt: 0,
        x: 10,
        y: 5
      },
      {
        id: 2,
        name: 'Goblin Warrior',
        race: 'Goblin',
        spriteKey: 'goblin',
        level: 2,
        maxHp: 60,
        hp: 60,
        damage: 10,
        agroRange: 6,
        attackRange: 1,
        attackCooldown: 1800,
        lastAttackAt: 0,
        x: 12,
        y: 8
      },
      {
        id: 3,
        name: 'Orc Scout',
        race: 'Orc',
        spriteKey: 'orc',
        level: 4,
        maxHp: 100,
        hp: 100,
        damage: 16,
        agroRange: 6,
        attackRange: 1,
        attackCooldown: 1900,
        lastAttackAt: 0,
        x: 14,
        y: 5
      },
      {
        id: 4,
        name: 'Elf Ranger',
        race: 'Elf',
        spriteKey: 'elf',
        level: 3,
        maxHp: 75,
        hp: 75,
        damage: 13,
        agroRange: 7,
        attackRange: 1,
        attackCooldown: 1500,
        lastAttackAt: 0,
        x: 4,
        y: 10
      },
      {
        id: 5,
        name: 'Skeleton Guard',
        race: 'Skeleton',
        spriteKey: 'skeleton',
        level: 3,
        maxHp: 85,
        hp: 85,
        damage: 14,
        agroRange: 6,
        attackRange: 1,
        attackCooldown: 1700,
        lastAttackAt: 0,
        x: 8,
        y: 12
      },
      {
        id: 6,
        name: 'Demon Imp',
        race: 'Demon',
        spriteKey: 'demon',
        level: 7,
        maxHp: 160,
        hp: 160,
        damage: 24,
        agroRange: 8,
        attackRange: 1,
        attackCooldown: 2200,
        lastAttackAt: 0,
        x: 16,
        y: 10
      }
    ],

    'Orc Camp': [
      {
        id: 7,
        name: 'Orc',
        race: 'Orc',
        spriteKey: 'orc',
        level: 5,
        maxHp: 120,
        hp: 120,
        damage: 18,
        agroRange: 7,
        attackRange: 1,
        attackCooldown: 2000,
        lastAttackAt: 0,
        x: 15,
        y: 10
      },
      {
        id: 8,
        name: 'Orc Brute',
        race: 'Orc',
        spriteKey: 'orc',
        level: 6,
        maxHp: 150,
        hp: 150,
        damage: 22,
        agroRange: 7,
        attackRange: 1,
        attackCooldown: 2100,
        lastAttackAt: 0,
        x: 13,
        y: 7
      }
    ],

    'Elf Grove': [
      {
        id: 9,
        name: 'Elf Ranger',
        race: 'Elf',
        spriteKey: 'elf',
        level: 3,
        maxHp: 75,
        hp: 75,
        damage: 13,
        agroRange: 7,
        attackRange: 1,
        attackCooldown: 1500,
        lastAttackAt: 0,
        x: 10,
        y: 8
      }
    ],

    'Skeleton Crypt': [
      {
        id: 10,
        name: 'Skeleton Guard',
        race: 'Skeleton',
        spriteKey: 'skeleton',
        level: 3,
        maxHp: 85,
        hp: 85,
        damage: 14,
        agroRange: 6,
        attackRange: 1,
        attackCooldown: 1700,
        lastAttackAt: 0,
        x: 11,
        y: 9
      }
    ],

    'Demon Ruins': [
      {
        id: 11,
        name: 'Demon',
        race: 'Demon',
        spriteKey: 'demon',
        level: 8,
        maxHp: 190,
        hp: 190,
        damage: 28,
        agroRange: 8,
        attackRange: 1,
        attackCooldown: 2300,
        lastAttackAt: 0,
        x: 14,
        y: 9
      }
    ]
  };

  return monsters[zone] || [];
}

module.exports = {
  getMonstersByZone
};
