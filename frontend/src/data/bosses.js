export const BOSS_TYPES = {
  goblinKing: { name: 'Goblin King', spriteKey: 'goblinKing', level: 5, maxHp: 320, damage: 20, xp: 180, gold: 80, attackRange: 1, agroRange: 8, attackCooldown: 1500, drops: ['goldCoin', 'goblinTotem', 'ironSword'] },
  orcWarlord: { name: 'Orc Warlord', spriteKey: 'orcWarlord', level: 8, maxHp: 520, damage: 30, xp: 300, gold: 140, attackRange: 1, agroRange: 8, attackCooldown: 1500, drops: ['goldCoin', 'ironSword', 'commonChest'] },
  ancientElf: { name: 'Ancient Elf', spriteKey: 'ancientElf', level: 10, maxHp: 460, damage: 36, xp: 360, gold: 160, attackRange: 4, agroRange: 9, attackCooldown: 1900, drops: ['goldCoin', 'crystal', 'bow'] },
  lichKing: { name: 'Lich King', spriteKey: 'lichKing', level: 12, maxHp: 620, damage: 42, xp: 480, gold: 220, attackRange: 4, agroRange: 9, attackCooldown: 2100, drops: ['goldCoin', 'crystal', 'staff'] },
  demonLord: { name: 'Demon Lord', spriteKey: 'demonLord', level: 15, maxHp: 900, damage: 55, xp: 760, gold: 400, attackRange: 2, agroRange: 10, attackCooldown: 1800, drops: ['goldCoin', 'demonKey', 'demonEssence'] }
};

export function createBoss(type, x, y) {
  const template = BOSS_TYPES[type];

  return {
    ...template,
    id: `boss-${type}`,
    typeKey: type,
    x,
    y,
    spawnX: x,
    spawnY: y,
    hp: template.maxHp,
    maxHp: template.maxHp,
    isBoss: true,
    moving: false,
    attacking: false,
    dead: false,
    animationFrame: 0,
    lastAttackAt: 0
  };
}
