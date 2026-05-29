export const MONSTER_TYPES = {
  goblin: { name: 'Goblin', spriteKey: 'goblin', type: 'beast', level: 1, maxHp: 45, damage: 6, xp: 20, gold: 4, agroRange: 5, attackRange: 1, attackCooldown: 1500, drops: ['goldCoin', 'healthPotion'] },
  goblinArcher: { name: 'Goblin Archer', spriteKey: 'goblinArcher', type: 'ranged', level: 2, maxHp: 38, damage: 7, xp: 25, gold: 5, agroRange: 6, attackRange: 3, attackCooldown: 1700, drops: ['goldCoin', 'bow'] },
  goblinShaman: { name: 'Goblin Shaman', spriteKey: 'goblinShaman', type: 'caster', level: 3, maxHp: 52, damage: 9, xp: 35, gold: 7, agroRange: 6, attackRange: 3, attackCooldown: 1900, drops: ['goldCoin', 'goblinTotem', 'manaPotion'] },
  orc: { name: 'Orc', spriteKey: 'orc', type: 'brute', level: 4, maxHp: 80, damage: 12, xp: 45, gold: 10, agroRange: 5, attackRange: 1, attackCooldown: 1600, drops: ['goldCoin', 'ironSword'] },
  orcWarrior: { name: 'Orc Warrior', spriteKey: 'orcWarrior', type: 'brute', level: 5, maxHp: 110, damage: 15, xp: 60, gold: 14, agroRange: 5, attackRange: 1, attackCooldown: 1700, drops: ['goldCoin', 'commonChest'] },
  orcBerserker: { name: 'Orc Berserker', spriteKey: 'orcBerserker', type: 'elite', level: 6, maxHp: 135, damage: 19, xp: 80, gold: 18, agroRange: 6, attackRange: 1, attackCooldown: 1300, drops: ['goldCoin', 'healthPotion'] },
  elf: { name: 'Elf', spriteKey: 'elf', type: 'ranged', level: 5, maxHp: 75, damage: 14, xp: 55, gold: 13, agroRange: 6, attackRange: 3, attackCooldown: 1600, drops: ['goldCoin', 'bow'] },
  darkElf: { name: 'Dark Elf', spriteKey: 'darkElf', type: 'assassin', level: 7, maxHp: 98, damage: 18, xp: 85, gold: 18, agroRange: 7, attackRange: 1, attackCooldown: 1200, drops: ['goldCoin', 'crystal'] },
  elfMage: { name: 'Elf Mage', spriteKey: 'elfMage', type: 'caster', level: 8, maxHp: 92, damage: 22, xp: 95, gold: 22, agroRange: 7, attackRange: 4, attackCooldown: 2100, drops: ['goldCoin', 'staff', 'crystal'] },
  skeleton: { name: 'Skeleton', spriteKey: 'skeleton', type: 'undead', level: 6, maxHp: 95, damage: 16, xp: 70, gold: 10, agroRange: 5, attackRange: 1, attackCooldown: 1600, drops: ['goldCoin'] },
  zombie: { name: 'Zombie', spriteKey: 'zombie', type: 'undead', level: 6, maxHp: 125, damage: 14, xp: 68, gold: 9, agroRange: 4, attackRange: 1, attackCooldown: 2000, drops: ['goldCoin', 'healthPotion'] },
  ghost: { name: 'Ghost', spriteKey: 'ghost', type: 'undead', level: 8, maxHp: 88, damage: 24, xp: 100, gold: 18, agroRange: 7, attackRange: 3, attackCooldown: 1900, drops: ['goldCoin', 'crystal'] },
  demon: { name: 'Demon', spriteKey: 'demon', type: 'demon', level: 10, maxHp: 170, damage: 28, xp: 140, gold: 35, agroRange: 7, attackRange: 1, attackCooldown: 1500, drops: ['goldCoin', 'demonEssence'] },
  demonKnight: { name: 'Demon Knight', spriteKey: 'demonKnight', type: 'demon', level: 12, maxHp: 235, damage: 34, xp: 190, gold: 45, agroRange: 7, attackRange: 1, attackCooldown: 1600, drops: ['goldCoin', 'demonKey', 'demonEssence'] },
  demonMage: { name: 'Demon Mage', spriteKey: 'demonMage', type: 'demon', level: 12, maxHp: 170, damage: 38, xp: 200, gold: 48, agroRange: 8, attackRange: 4, attackCooldown: 2200, drops: ['goldCoin', 'demonEssence', 'staff'] }
};

export function createMonster(type, x, y, idSuffix = '') {
  const template = MONSTER_TYPES[type];

  return {
    ...template,
    id: `${type}-${x}-${y}-${idSuffix || Math.random().toString(36).slice(2)}`,
    typeKey: type,
    x,
    y,
    hp: template.maxHp,
    maxHp: template.maxHp,
    moving: false,
    attacking: false,
    dead: false,
    animationFrame: 0,
    lastAttackAt: 0
  };
}
