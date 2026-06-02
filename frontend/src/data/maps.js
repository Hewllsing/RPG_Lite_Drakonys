import { mapAssets } from './gameAssets';
import { MONSTER_TYPES } from './monsters';

const W = 'wall';
const WD = 'wallDungeon';
const C = 'wallCastle';
const G = 'grass';
const DG = 'darkGrass';
const D = 'dirt';
const R = 'road';
const S = 'stoneFloor';
const WO = 'woodFloor';
const T = 'tree';
const DT = 'deadTree';
const B = 'bush';
const K = 'rock';
const WA = 'water';
const P = 'poisonWater';
const L = 'lava';
const BR = 'bridge';
const IN = 'dungeonEntrance';
const OUT = 'dungeonExit';

export const BLOCKED_TILES = [
  'wall',
  'wallStone',
  'wallCastle',
  'wallDungeon',
  'tree',
  'deadTree',
  'bush',
  'rock',
  'water',
  'poisonWater',
  'lava'
];

const LARGE_ZONE_WIDTH = 80;
const LARGE_ZONE_HEIGHT = 45;
const FARM_SPOTS = [
  [12, 8],
  [32, 10],
  [62, 9],
  [48, 26],
  [22, 31],
  [59, 34],
  [12, 34],
  [68, 39]
];

const GOBLIN_FOREST_WIDTH = LARGE_ZONE_WIDTH;
const GOBLIN_FOREST_HEIGHT = LARGE_ZONE_HEIGHT;

function createFilledMap(width, height, tile) {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => tile)
  );
}

function setTile(map, x, y, tile) {
  if (
    y < 0 ||
    y >= map.length ||
    x < 0 ||
    x >= map[y].length
  ) {
    return;
  }

  map[y][x] = tile;
}

function fillRect(map, startX, startY, width, height, tile) {
  for (let y = startY; y < startY + height; y++) {
    for (let x = startX; x < startX + width; x++) {
      setTile(map, x, y, tile);
    }
  }
}

function clearFarmSpot(map, centerX, centerY, tile = G) {
  fillRect(map, centerX - 3, centerY - 2, 7, 5, tile);
}

function clearFarmSpots(map, tile) {
  FARM_SPOTS.forEach(([x, y]) =>
    clearFarmSpot(map, x, y, tile)
  );
}

function createBorder(map, width, height, tile) {
  fillRect(map, 0, 0, width, 1, tile);
  fillRect(map, 0, height - 1, width, 1, tile);
  fillRect(map, 0, 0, 1, height, tile);
  fillRect(map, width - 1, 0, 1, height, tile);
}

function isFarmSpotArea(x, y) {
  return FARM_SPOTS.some(([spotX, spotY]) =>
    Math.abs(x - spotX) <= 4 &&
    Math.abs(y - spotY) <= 3
  );
}

function isMainRouteArea(x, y) {
  return (
    (x >= 36 && x <= 43) ||
    (y >= 20 && y <= 26) ||
    (x >= 7 && x <= 11 && y >= 24) ||
    (x >= 62 && x <= 66 && y >= 8)
  );
}

function canDecorate(x, y) {
  return !isMainRouteArea(x, y) && !isFarmSpotArea(x, y);
}

function addRouteNetwork(map, tile = R) {
  fillRect(map, 38, 1, 4, 43, tile);
  fillRect(map, 1, 22, 78, 3, tile);
  fillRect(map, 8, 24, 3, 19, tile);
  fillRect(map, 63, 8, 3, 35, tile);
}

function createEliteMonster(type, x, y) {
  const template = MONSTER_TYPES[type];

  return {
    type,
    x,
    y,
    elite: true,
    name: `Elite ${template.name}`,
    maxHp: Math.round(template.maxHp * 3),
    damage: Math.round(template.damage * 3),
    xp: Math.round(template.xp * 3),
    gold: Math.round(template.gold * 3),
    agroRange: Math.max(template.agroRange, 8),
    attackCooldown: Math.max(1200, template.attackCooldown - 250)
  };
}

function createFarmRouteMonsters(spotTypes, eliteTypes) {
  const offsets = [
    [-2, -1],
    [0, -1],
    [2, 0],
    [-1, 2]
  ];
  const normalMonsters = FARM_SPOTS.flatMap(([spotX, spotY], spotIndex) =>
    spotTypes[spotIndex % spotTypes.length].map((type, index) => ({
      type,
      x: spotX + offsets[index][0],
      y: spotY + offsets[index][1]
    }))
  );
  const eliteMonsters = FARM_SPOTS.map(([x, y], index) =>
    createEliteMonster(
      eliteTypes[index % eliteTypes.length],
      x,
      y
    )
  );

  return [
    ...normalMonsters,
    ...eliteMonsters
  ];
}

function createGoblinForestMap() {
  const map = createFilledMap(
    GOBLIN_FOREST_WIDTH,
    GOBLIN_FOREST_HEIGHT,
    G
  );

  fillRect(map, 0, 0, GOBLIN_FOREST_WIDTH, 1, W);
  fillRect(map, 0, GOBLIN_FOREST_HEIGHT - 1, GOBLIN_FOREST_WIDTH, 1, W);
  fillRect(map, 0, 0, 1, GOBLIN_FOREST_HEIGHT, W);
  fillRect(map, GOBLIN_FOREST_WIDTH - 1, 0, 1, GOBLIN_FOREST_HEIGHT, W);

  // Estradas principais criam rotas de farm e ligam os portais.
  fillRect(map, 38, 1, 4, 43, R);
  fillRect(map, 1, 22, 78, 3, R);
  fillRect(map, 8, 24, 3, 19, R);
  fillRect(map, 8, 37, 31, 3, R);

  // Rio grande com pontes passaveis em pontos de rota.
  for (let y = 4; y <= 34; y++) {
    const curve = Math.floor(Math.sin(y / 4) * 3);
    fillRect(map, 22 + curve, y, 5, 1, WA);
  }
  fillRect(map, 27, 12, 31, 4, WA);
  fillRect(map, 38, 12, 4, 4, BR);
  fillRect(map, 19, 22, 6, 3, BR);
  fillRect(map, 8, 37, 3, 3, BR);

  // Ruinas e paredes pequenas para quebrar linha de visao e navegação.
  fillRect(map, 54, 30, 10, 1, W);
  fillRect(map, 54, 30, 1, 7, W);
  fillRect(map, 63, 30, 1, 7, W);
  fillRect(map, 54, 36, 10, 1, W);
  fillRect(map, 58, 36, 2, 1, G);
  fillRect(map, 12, 27, 8, 1, W);
  fillRect(map, 12, 27, 1, 6, W);
  fillRect(map, 19, 27, 1, 6, W);
  fillRect(map, 15, 32, 2, 1, G);

  for (let y = 3; y < GOBLIN_FOREST_HEIGHT - 3; y += 4) {
    for (let x = 4; x < GOBLIN_FOREST_WIDTH - 4; x += 5) {
      if (
        (x >= 36 && x <= 43) ||
        (y >= 20 && y <= 26) ||
        (x >= 20 && x <= 30 && y <= 35)
      ) {
        continue;
      }

      const tile = (x + y) % 11 === 0
        ? K
        : (x + y) % 7 === 0
          ? B
          : T;

      setTile(map, x, y, tile);
    }
  }

  [
    [12, 8],
    [32, 10],
    [62, 9],
    [48, 26],
    [22, 31],
    [59, 34],
    [12, 34],
    [68, 39]
  ].forEach(([x, y]) => clearFarmSpot(map, x, y));

  setTile(map, 39, 1, OUT);
  setTile(map, 78, 22, OUT);
  setTile(map, 2, 42, OUT);

  return map;
}

function createGoblinForestMonsters() {
  const eliteStats = {
    goblin: {
      name: 'Elite Goblin',
      maxHp: 270,
      damage: 18,
      xp: 60,
      gold: 12
    },
    goblinArcher: {
      name: 'Elite Goblin Archer',
      maxHp: 228,
      damage: 21,
      xp: 75,
      gold: 15
    },
    goblinShaman: {
      name: 'Elite Goblin Shaman',
      maxHp: 312,
      damage: 27,
      xp: 105,
      gold: 21
    }
  };
  const elite = (type, x, y) => ({
    type,
    x,
    y,
    elite: true,
    agroRange: 8,
    attackCooldown: 1250,
    ...eliteStats[type]
  });

  return [
    // Menos criaturas por spot reduz custo de IA/render sem esvaziar as rotas.
    { type: 'goblin', x: 10, y: 7 },
    { type: 'goblin', x: 12, y: 7 },
    { type: 'goblinArcher', x: 14, y: 8 },
    { type: 'goblinShaman', x: 13, y: 10 },

    { type: 'goblinArcher', x: 30, y: 9 },
    { type: 'goblinArcher', x: 32, y: 9 },
    { type: 'goblin', x: 34, y: 10 },
    { type: 'goblinShaman', x: 31, y: 11 },

    { type: 'goblin', x: 60, y: 8 },
    { type: 'goblin', x: 62, y: 8 },
    { type: 'goblinArcher', x: 64, y: 9 },
    { type: 'goblinShaman', x: 61, y: 10 },

    { type: 'goblin', x: 46, y: 25 },
    { type: 'goblin', x: 48, y: 25 },
    { type: 'goblinArcher', x: 50, y: 26 },
    { type: 'goblinShaman', x: 47, y: 27 },

    { type: 'goblin', x: 20, y: 30 },
    { type: 'goblin', x: 22, y: 30 },
    { type: 'goblinArcher', x: 24, y: 31 },
    { type: 'goblinShaman', x: 21, y: 32 },

    { type: 'goblin', x: 57, y: 33 },
    { type: 'goblinArcher', x: 59, y: 33 },
    { type: 'goblin', x: 61, y: 34 },
    { type: 'goblinShaman', x: 58, y: 35 },

    { type: 'goblin', x: 10, y: 33 },
    { type: 'goblinArcher', x: 12, y: 33 },
    { type: 'goblin', x: 14, y: 34 },
    { type: 'goblinShaman', x: 11, y: 35 },

    { type: 'goblinArcher', x: 66, y: 38 },
    { type: 'goblin', x: 68, y: 38 },
    { type: 'goblinShaman', x: 70, y: 39 },
    { type: 'goblin', x: 67, y: 40 },

    elite('goblin', 12, 8),
    elite('goblinArcher', 32, 10),
    elite('goblinShaman', 62, 9),
    elite('goblin', 48, 26),
    elite('goblinArcher', 22, 31),
    elite('goblinShaman', 59, 34),
    elite('goblin', 12, 34),
    elite('goblinArcher', 68, 39)
  ];
}

function createOrcCampMap() {
  const map = createFilledMap(
    LARGE_ZONE_WIDTH,
    LARGE_ZONE_HEIGHT,
    D
  );

  createBorder(map, LARGE_ZONE_WIDTH, LARGE_ZONE_HEIGHT, C);
  addRouteNetwork(map, R);

  // Acampamentos e paliçadas criam spots fechados sem bloquear as rotas.
  [
    [9, 5],
    [29, 7],
    [59, 6],
    [45, 23],
    [19, 28],
    [56, 31],
    [9, 31],
    [65, 36]
  ].forEach(([x, y]) => {
    fillRect(map, x, y, 7, 4, WO);
    fillRect(map, x, y, 7, 1, C);
    fillRect(map, x, y + 3, 7, 1, C);
  });

  for (let y = 4; y < LARGE_ZONE_HEIGHT - 4; y += 4) {
    for (let x = 5; x < LARGE_ZONE_WIDTH - 5; x += 6) {
      if (!canDecorate(x, y)) {
        continue;
      }

      setTile(
        map,
        x,
        y,
        (x + y) % 5 === 0 ? C : K
      );
    }
  }

  clearFarmSpots(map, D);
  setTile(map, 1, 22, OUT);
  setTile(map, 78, 6, OUT);

  return map;
}

function createElfWoodsMap() {
  const map = createFilledMap(
    LARGE_ZONE_WIDTH,
    LARGE_ZONE_HEIGHT,
    DG
  );

  createBorder(map, LARGE_ZONE_WIDTH, LARGE_ZONE_HEIGHT, W);
  addRouteNetwork(map, R);

  for (let y = 5; y <= 38; y++) {
    const curve = Math.floor(Math.sin(y / 5) * 4);
    fillRect(map, 23 + curve, y, 4, 1, P);
  }
  fillRect(map, 28, 12, 28, 3, P);
  fillRect(map, 38, 12, 4, 3, BR);
  fillRect(map, 19, 22, 7, 3, BR);
  fillRect(map, 63, 33, 3, 5, BR);

  for (let y = 3; y < LARGE_ZONE_HEIGHT - 3; y += 4) {
    for (let x = 4; x < LARGE_ZONE_WIDTH - 4; x += 5) {
      if (!canDecorate(x, y)) {
        continue;
      }

      const tile = (x + y) % 9 === 0
        ? K
        : (x + y) % 4 === 0
          ? B
          : T;

      setTile(map, x, y, tile);
    }
  }

  clearFarmSpots(map, DG);
  setTile(map, 1, 22, OUT);
  setTile(map, 78, 38, OUT);

  return map;
}

function createUndeadCryptMap() {
  const map = createFilledMap(
    LARGE_ZONE_WIDTH,
    LARGE_ZONE_HEIGHT,
    S
  );

  createBorder(map, LARGE_ZONE_WIDTH, LARGE_ZONE_HEIGHT, WD);
  addRouteNetwork(map, S);

  for (let y = 5; y < LARGE_ZONE_HEIGHT - 5; y += 6) {
    fillRect(map, 5, y, 21, 1, WD);
    fillRect(map, 32, y + 2, 19, 1, WD);
    fillRect(map, 57, y, 17, 1, WD);

    setTile(map, 12, y, S);
    setTile(map, 40, y + 2, S);
    setTile(map, 64, y, S);
  }

  for (let x = 14; x < LARGE_ZONE_WIDTH - 10; x += 12) {
    fillRect(map, x, 6, 1, 11, WD);
    fillRect(map, x, 28, 1, 10, WD);
    setTile(map, x, 22, S);
    setTile(map, x, 34, S);
  }

  [
    [54, 30, 10, 1],
    [54, 30, 1, 7],
    [63, 30, 1, 7],
    [12, 27, 8, 1],
    [12, 27, 1, 6],
    [19, 27, 1, 6]
  ].forEach(([x, y, width, height]) =>
    fillRect(map, x, y, width, height, WD)
  );

  clearFarmSpots(map, S);
  setTile(map, 1, 22, OUT);
  setTile(map, 78, 22, IN);

  return map;
}

function createDemonGateMap() {
  const map = createFilledMap(
    LARGE_ZONE_WIDTH,
    LARGE_ZONE_HEIGHT,
    S
  );

  createBorder(map, LARGE_ZONE_WIDTH, LARGE_ZONE_HEIGHT, WD);
  addRouteNetwork(map, S);

  for (let y = 4; y <= 39; y++) {
    const curve = Math.floor(Math.sin(y / 4) * 3);
    fillRect(map, 21 + curve, y, 5, 1, L);
    fillRect(map, 55 - curve, y, 4, 1, L);
  }
  fillRect(map, 27, 13, 29, 4, L);
  fillRect(map, 37, 13, 5, 4, BR);
  fillRect(map, 19, 22, 7, 3, BR);
  fillRect(map, 55, 22, 7, 3, BR);
  fillRect(map, 63, 36, 3, 5, BR);

  for (let y = 4; y < LARGE_ZONE_HEIGHT - 4; y += 5) {
    for (let x = 5; x < LARGE_ZONE_WIDTH - 5; x += 6) {
      if (!canDecorate(x, y)) {
        continue;
      }

      setTile(
        map,
        x,
        y,
        (x + y) % 6 === 0 ? L : WD
      );
    }
  }

  clearFarmSpots(map, S);
  setTile(map, 1, 38, OUT);
  setTile(map, 78, 22, IN);

  return map;
}

function createOrcCampMonsters() {
  return createFarmRouteMonsters(
    [
      ['orc', 'orc', 'orcWarrior', 'orcBerserker'],
      ['orcWarrior', 'orc', 'orc', 'orcBerserker'],
      ['orc', 'orcWarrior', 'orcBerserker', 'orc'],
      ['orcBerserker', 'orc', 'orcWarrior', 'orc'],
      ['orc', 'orc', 'orcWarrior', 'orcBerserker'],
      ['orcWarrior', 'orcBerserker', 'orc', 'orc'],
      ['orc', 'orcWarrior', 'orc', 'orcBerserker'],
      ['orcBerserker', 'orcWarrior', 'orc', 'orc']
    ],
    ['orc', 'orcWarrior', 'orcBerserker']
  );
}

function createElfWoodsMonsters() {
  return createFarmRouteMonsters(
    [
      ['elf', 'elf', 'darkElf', 'elfMage'],
      ['darkElf', 'elf', 'elf', 'elfMage'],
      ['elf', 'darkElf', 'elfMage', 'elf'],
      ['elfMage', 'elf', 'darkElf', 'elf'],
      ['elf', 'elf', 'darkElf', 'elfMage'],
      ['darkElf', 'elfMage', 'elf', 'elf'],
      ['elf', 'darkElf', 'elf', 'elfMage'],
      ['elfMage', 'darkElf', 'elf', 'elf']
    ],
    ['elf', 'darkElf', 'elfMage']
  );
}

function createUndeadCryptMonsters() {
  return createFarmRouteMonsters(
    [
      ['skeleton', 'skeleton', 'zombie', 'ghost'],
      ['zombie', 'skeleton', 'skeleton', 'ghost'],
      ['skeleton', 'zombie', 'ghost', 'skeleton'],
      ['ghost', 'skeleton', 'zombie', 'skeleton'],
      ['skeleton', 'skeleton', 'zombie', 'ghost'],
      ['zombie', 'ghost', 'skeleton', 'skeleton'],
      ['skeleton', 'zombie', 'skeleton', 'ghost'],
      ['ghost', 'zombie', 'skeleton', 'skeleton']
    ],
    ['skeleton', 'zombie', 'ghost']
  );
}

function createDemonGateMonsters() {
  return createFarmRouteMonsters(
    [
      ['demon', 'demon', 'demonKnight', 'demonMage'],
      ['demonKnight', 'demon', 'demon', 'demonMage'],
      ['demon', 'demonKnight', 'demonMage', 'demon'],
      ['demonMage', 'demon', 'demonKnight', 'demon'],
      ['demon', 'demon', 'demonKnight', 'demonMage'],
      ['demonKnight', 'demonMage', 'demon', 'demon'],
      ['demon', 'demonKnight', 'demon', 'demonMage'],
      ['demonMage', 'demonKnight', 'demon', 'demon']
    ],
    ['demon', 'demonKnight', 'demonMage']
  );
}

export const ZONES = {
  starterTown: {
    key: 'starterTown',
    name: 'Initial City',
    theme: 'Safe stone refuge',
    assets: mapAssets.goblinForest,
    map: [
      [C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C],
      [C,S,S,S,S,S,S,S,S,R,R,S,S,S,S,S,S,S,S,C],
      [C,S,T,S,K,S,S,S,S,R,R,S,S,S,K,S,T,S,S,C],
      [C,S,S,S,S,S,S,S,S,R,R,S,S,S,S,S,S,S,S,C],
      [C,S,S,S,WO,WO,WO,WO,WO,WO,WO,WO,WO,S,S,S,S,S,S,C],
      [C,S,S,S,WO,WO,WO,WO,WO,WO,WO,WO,WO,S,S,S,S,S,S,C],
      [C,S,S,S,WO,WO,WO,WO,WO,WO,WO,WO,WO,S,S,S,S,S,S,C],
      [C,S,S,S,WO,WO,WO,WO,WO,WO,WO,WO,WO,S,S,S,S,S,S,C],
      [C,S,S,S,S,S,S,S,S,R,R,S,S,S,S,S,S,S,S,C],
      [C,S,S,S,S,S,S,S,S,R,R,S,S,S,S,S,S,S,S,C],
      [C,S,T,S,S,S,K,S,S,R,R,S,S,K,S,S,S,T,S,C],
      [C,S,S,S,S,S,S,S,S,R,R,S,S,S,S,S,S,S,S,C],
      [C,S,S,S,S,S,S,S,S,R,R,S,S,S,S,S,S,S,S,C],
      [C,S,S,S,S,S,S,S,S,R,R,S,S,S,S,S,S,S,OUT,C],
      [C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C]
    ],
    playerStart: { x: 9, y: 8 },
    safeZone: true,
    portals: [
      { x: 18, y: 13, to: 'goblinForest', color: 'blue', label: 'Goblin Forest' }
    ],
    npcs: [
      { type: 'merchant', x: 6, y: 5 },
      { type: 'healer', x: 8, y: 5 },
      { type: 'questMaster', x: 10, y: 5 },
      { type: 'trainer', x: 12, y: 5 },
      { type: 'blacksmith', x: 6, y: 7 },
      { type: 'guard', x: 12, y: 7 },
      { type: 'storageChest', x: 9, y: 6 }
    ],
    monsters: [],
    quests: ['reachLevel5']
  },
  goblinForest: {
    key: 'goblinForest',
    name: 'Goblin Forest',
    theme: 'Misty greenwood',
    assets: mapAssets.goblinForest,
    map: createGoblinForestMap(),
    playerStart: { x: 39, y: 5 },
    portals: [
      { x: 39, y: 1, to: 'starterTown', color: 'blue', label: 'Initial City' },
      { x: 78, y: 22, to: 'orcCamp', color: 'blue', label: 'Orc Camp' },
      { x: 2, y: 42, to: 'elfWoods', color: 'purple', label: 'Elf Woods' }
    ],
    npcs: [
      { type: 'questMaster', x: 35, y: 5 },
      { type: 'healer', x: 37, y: 5 },
      { type: 'merchant', x: 35, y: 7 },
      { type: 'guard', x: 42, y: 6 }
    ],
    monsters: createGoblinForestMonsters(),
    boss: {
      type: 'goblinKing',
      x: 40,
      y: 22,
      name: 'Goblin King',
      visualScale: 1.42,
      aura: 'boss-large'
    },
    quests: [
      'defeatGoblins',
      'defeatGoblinArchers',
      'collectGoblinTotems',
      'defeatGoblinKing',
      'speakHealer'
    ]
  },
  orcCamp: {
    key: 'orcCamp',
    name: 'Orc Camp',
    theme: 'War tents and scorched dirt',
    assets: mapAssets.orcCamp,
    map: createOrcCampMap(),
    playerStart: { x: 3, y: 22 },
    portals: [
      { x: 1, y: 22, to: 'goblinForest', color: 'blue', label: 'Goblin Forest' },
      { x: 78, y: 6, to: 'undeadCrypt', color: 'purple', label: 'Undead Crypt' }
    ],
    npcs: [
      { type: 'questMaster', x: 6, y: 18 },
      { type: 'blacksmith', x: 8, y: 18 },
      { type: 'trainer', x: 6, y: 20 },
      { type: 'guard', x: 10, y: 20 }
    ],
    monsters: createOrcCampMonsters(),
    boss: {
      type: 'orcWarlord',
      x: 40,
      y: 22,
      name: 'Orc Warlord',
      visualScale: 1.42,
      aura: 'boss-large'
    },
    quests: [
      'defeatOrcs',
      'defeatOrcBerserkers',
      'defeatOrcWarlord',
      'exploreOrcCamp'
    ]
  },
  elfWoods: {
    key: 'elfWoods',
    name: 'Elf Woods',
    theme: 'Ancient violet canopy',
    assets: mapAssets.elfWoods,
    map: createElfWoodsMap(),
    playerStart: { x: 3, y: 22 },
    portals: [
      { x: 1, y: 22, to: 'goblinForest', color: 'purple', label: 'Goblin Forest' },
      { x: 78, y: 38, to: 'demonGate', color: 'red', label: 'Demon Gate' }
    ],
    npcs: [
      { type: 'healer', x: 6, y: 18 },
      { type: 'questMaster', x: 8, y: 18 },
      { type: 'trainer', x: 6, y: 20 },
      { type: 'guard', x: 10, y: 20 }
    ],
    monsters: createElfWoodsMonsters(),
    boss: {
      type: 'ancientElf',
      x: 40,
      y: 22,
      name: 'Ancient Elf',
      visualScale: 1.42,
      aura: 'boss-large'
    },
    quests: [
      'defeatElves',
      'defeatElfMages',
      'exploreElfWoods',
      'defeatAncientElf'
    ]
  },
  undeadCrypt: {
    key: 'undeadCrypt',
    name: 'Undead Crypt',
    theme: 'Stone halls and old bones',
    assets: mapAssets.undeadCrypt,
    map: createUndeadCryptMap(),
    playerStart: { x: 3, y: 22 },
    portals: [
      { x: 1, y: 22, to: 'orcCamp', color: 'purple', label: 'Orc Camp' },
      { x: 78, y: 22, to: 'demonGate', color: 'red', label: 'Demon Gate' }
    ],
    npcs: [
      { type: 'questMaster', x: 6, y: 20 },
      { type: 'guard', x: 8, y: 20 },
      { type: 'healer', x: 6, y: 24 }
    ],
    monsters: createUndeadCryptMonsters(),
    boss: {
      type: 'lichKing',
      x: 40,
      y: 22,
      name: 'Lich King',
      visualScale: 1.42,
      aura: 'boss-large'
    },
    quests: [
      'defeatSkeletons',
      'defeatZombies',
      'defeatGhosts',
      'exploreUndeadCrypt',
      'defeatLichKing'
    ]
  },
  demonGate: {
    key: 'demonGate',
    name: 'Demon Gate',
    theme: 'Ash, lava and infernal stone',
    assets: mapAssets.demonGate,
    map: createDemonGateMap(),
    playerStart: { x: 3, y: 38 },
    portals: [
      { x: 1, y: 38, to: 'elfWoods', color: 'red', label: 'Elf Woods' },
      { x: 78, y: 22, to: 'undeadCrypt', color: 'purple', label: 'Undead Crypt' }
    ],
    npcs: [
      { type: 'questMaster', x: 6, y: 36 },
      { type: 'guard', x: 8, y: 36 },
      { type: 'healer', x: 6, y: 40 }
    ],
    monsters: createDemonGateMonsters(),
    boss: {
      type: 'demonLord',
      x: 40,
      y: 22,
      name: 'Demon Lord',
      visualScale: 1.5,
      aura: 'boss-large'
    },
    quests: [
      'collectDemonKey',
      'defeatDemons',
      'defeatDemonMages',
      'exploreDemonGate',
      'defeatDemonLord'
    ]
  }
};

export function getZoneKeyByName(name) {
  return Object.values(ZONES).find(zone => zone.name === name)?.key || 'starterTown';
}
