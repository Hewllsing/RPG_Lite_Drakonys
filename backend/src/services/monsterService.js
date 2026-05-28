function getMonstersByZone(zone) {

  const monsters = {
    'Goblin Forest': [
      {
        id: 1,
        name: 'Goblin',
        race: 'Goblin',
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
      }
    ],

    'Orc Camp': [
      {
        id: 3,
        name: 'Orc',
        race: 'Orc',
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
      }
    ]
  };

  return monsters[zone] || [];
}

module.exports = {
  getMonstersByZone
};
