export const BOSS_TYPES = {
  goblinKing: { name: 'Goblin King', spriteKey: 'goblinKing', level: 5, maxHp: 640, damage: 20, xp: 180, gold: 80, attackRange: 1, agroRange: 8, attackCooldown: 1500, drops: ['goldCoin', 'goblinTotem', 'ironSword'] },
  orcWarlord: { name: 'Orc Warlord', spriteKey: 'orcWarlord', level: 8, maxHp: 1040, damage: 30, xp: 300, gold: 140, attackRange: 1, agroRange: 8, attackCooldown: 1500, drops: ['goldCoin', 'ironSword', 'commonChest'] },
  ancientElf: { name: 'Ancient Elf', spriteKey: 'ancientElf', level: 10, maxHp: 920, damage: 36, xp: 360, gold: 160, attackRange: 4, agroRange: 9, attackCooldown: 1900, drops: ['goldCoin', 'crystal', 'bow'] },
  lichKing: { name: 'Lich King', spriteKey: 'lichKing', level: 12, maxHp: 1240, damage: 42, xp: 480, gold: 220, attackRange: 4, agroRange: 9, attackCooldown: 2100, drops: ['goldCoin', 'crystal', 'staff'] },
  demonLord: { name: 'Demon Lord', spriteKey: 'demonLord', level: 15, maxHp: 1800, damage: 55, xp: 760, gold: 400, attackRange: 2, agroRange: 10, attackCooldown: 1800, drops: ['goldCoin', 'demonKey', 'demonEssence'] }
};

export function createBoss(type, x, y, overrides = {}) {
  const template = BOSS_TYPES[type];
  const {
    type: ignoredType,
    x: ignoredX,
    y: ignoredY,
    ...customStats
  } = overrides;
  const bossStats = {
    ...template,
    ...customStats
  };

  return {
    ...bossStats,
    id: `boss-${type}`,
    typeKey: type,
    x,
    y,
    spawnX: x,
    spawnY: y,
    hp: bossStats.maxHp,
    maxHp: bossStats.maxHp,
    isBoss: true,
    moving: false,
    attacking: false,
    dead: false,
    animationFrame: 0,
    lastAttackAt: 0
  };
}
