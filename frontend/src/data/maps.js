import { mapAssets } from './gameAssets';

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

const GOBLIN_FOREST_WIDTH = 80;
const GOBLIN_FOREST_HEIGHT = 45;

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

function clearFarmSpot(map, centerX, centerY) {
  fillRect(map, centerX - 3, centerY - 2, 7, 5, G);
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
  fillRect(map, 24, 22, 5, 3, BR);
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
      maxHp: 135,
      damage: 18,
      xp: 60,
      gold: 12
    },
    goblinArcher: {
      name: 'Elite Goblin Archer',
      maxHp: 114,
      damage: 21,
      xp: 75,
      gold: 15
    },
    goblinShaman: {
      name: 'Elite Goblin Shaman',
      maxHp: 156,
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
    { type: 'goblin', x: 10, y: 7 },
    { type: 'goblin', x: 12, y: 7 },
    { type: 'goblinArcher', x: 14, y: 8 },
    { type: 'goblin', x: 11, y: 9 },
    { type: 'goblinShaman', x: 13, y: 10 },
    { type: 'goblin', x: 15, y: 10 },

    { type: 'goblinArcher', x: 30, y: 9 },
    { type: 'goblinArcher', x: 32, y: 9 },
    { type: 'goblin', x: 34, y: 10 },
    { type: 'goblinShaman', x: 31, y: 11 },
    { type: 'goblin', x: 33, y: 12 },
    { type: 'goblinArcher', x: 35, y: 12 },

    { type: 'goblin', x: 60, y: 8 },
    { type: 'goblin', x: 62, y: 8 },
    { type: 'goblinArcher', x: 64, y: 9 },
    { type: 'goblinShaman', x: 61, y: 10 },
    { type: 'goblin', x: 63, y: 11 },
    { type: 'goblinArcher', x: 65, y: 11 },

    { type: 'goblin', x: 46, y: 25 },
    { type: 'goblin', x: 48, y: 25 },
    { type: 'goblinArcher', x: 50, y: 26 },
    { type: 'goblinShaman', x: 47, y: 27 },
    { type: 'goblin', x: 49, y: 28 },
    { type: 'goblinArcher', x: 51, y: 28 },

    { type: 'goblin', x: 20, y: 30 },
    { type: 'goblin', x: 22, y: 30 },
    { type: 'goblinArcher', x: 24, y: 31 },
    { type: 'goblinShaman', x: 21, y: 32 },
    { type: 'goblin', x: 23, y: 33 },
    { type: 'goblinArcher', x: 25, y: 33 },

    { type: 'goblin', x: 57, y: 33 },
    { type: 'goblinArcher', x: 59, y: 33 },
    { type: 'goblin', x: 61, y: 34 },
    { type: 'goblinShaman', x: 58, y: 35 },
    { type: 'goblinArcher', x: 60, y: 35 },
    { type: 'goblin', x: 62, y: 35 },

    { type: 'goblin', x: 10, y: 33 },
    { type: 'goblinArcher', x: 12, y: 33 },
    { type: 'goblin', x: 14, y: 34 },
    { type: 'goblinShaman', x: 11, y: 35 },
    { type: 'goblinArcher', x: 13, y: 36 },
    { type: 'goblin', x: 15, y: 36 },

    { type: 'goblinArcher', x: 66, y: 38 },
    { type: 'goblin', x: 68, y: 38 },
    { type: 'goblinShaman', x: 70, y: 39 },
    { type: 'goblin', x: 67, y: 40 },
    { type: 'goblinArcher', x: 69, y: 41 },
    { type: 'goblin', x: 71, y: 41 },

    elite('goblin', 12, 8),
    elite('goblinArcher', 32, 10),
    elite('goblinShaman', 62, 9),
    elite('goblin', 48, 26),
    elite('goblinArcher', 22, 31),
    elite('goblinShaman', 59, 34),
    elite('goblin', 12, 34),
    elite('goblinArcher', 68, 39),
    elite('goblinShaman', 18, 36),
    elite('goblin', 53, 25),
    elite('goblinArcher', 72, 37),
    elite('goblinShaman', 40, 20)
  ];
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
    map: [
      [C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C],
      [C,D,D,D,K,D,D,R,R,R,D,D,K,D,D,D,D,D,D,C],
      [C,D,WO,WO,D,D,D,R,R,R,D,D,D,D,WO,WO,D,D,D,C],
      [C,D,WO,WO,D,K,D,R,R,R,D,K,D,D,WO,WO,D,K,D,C],
      [C,D,D,D,D,D,D,R,R,R,D,D,D,D,D,D,D,D,D,C],
      [C,D,K,D,D,WO,D,D,D,D,D,WO,D,D,K,D,D,D,D,C],
      [C,D,D,D,D,WO,D,K,D,D,D,WO,D,D,D,D,D,K,D,C],
      [C,D,D,R,R,R,R,R,R,R,R,R,R,R,R,D,D,D,D,C],
      [C,D,K,D,D,D,D,D,D,K,D,D,D,D,R,D,K,D,D,C],
      [C,D,D,D,WO,WO,D,D,D,D,D,WO,WO,D,R,D,D,D,D,C],
      [C,D,D,D,WO,WO,D,K,D,D,D,WO,WO,D,R,D,K,D,D,C],
      [C,D,K,D,D,D,D,D,D,D,D,D,D,D,R,D,D,D,D,C],
      [C,D,D,D,K,D,D,D,D,K,D,D,D,D,R,R,R,R,D,C],
      [C,D,D,D,D,D,D,D,D,D,D,D,K,D,D,D,D,D,D,C],
      [C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C,C]
    ],
    playerStart: { x: 2, y: 12 },
    portals: [
      { x: 1, y: 12, to: 'goblinForest', color: 'blue', label: 'Goblin Forest' },
      { x: 18, y: 2, to: 'undeadCrypt', color: 'purple', label: 'Undead Crypt' }
    ],
    npcs: [
      { type: 'questMaster', x: 4, y: 5 },
      { type: 'blacksmith', x: 5, y: 5 },
      { type: 'trainer', x: 7, y: 6 },
      { type: 'guard', x: 2, y: 2 }
    ],
    monsters: [
      { type: 'orc', x: 11, y: 4 },
      { type: 'orcWarrior', x: 14, y: 7 },
      { type: 'orcBerserker', x: 12, y: 10 },
      { type: 'orc', x: 17, y: 12 }
    ],
    boss: { type: 'orcWarlord', x: 16, y: 3 },
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
    map: [
      [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
      [W,DG,DG,DG,T,DG,DG,R,R,R,DG,DG,T,DG,DG,DG,DG,DG,DG,W],
      [W,DG,T,DG,T,DG,K,R,R,R,DG,K,T,DG,DG,T,DG,DG,DG,W],
      [W,DG,DG,DG,DG,DG,DG,R,R,R,DG,DG,DG,DG,DG,T,DG,K,DG,W],
      [W,DG,DG,K,T,DG,DG,R,R,R,DG,DG,T,T,DG,DG,DG,DG,DG,W],
      [W,DG,DG,DG,T,DG,P,BR,BR,BR,P,DG,DG,DG,DG,K,DG,DG,DG,W],
      [W,DG,T,DG,DG,DG,P,P,P,BR,P,DG,K,DG,T,DG,DG,DG,DG,W],
      [W,DG,DG,DG,T,DG,DG,R,R,R,DG,DG,DG,DG,T,DG,DG,T,DG,W],
      [W,DG,K,DG,DG,DG,DG,R,R,R,DG,DG,K,DG,DG,DG,DG,DG,DG,W],
      [W,DG,DG,DG,T,T,DG,R,R,R,DG,DG,T,T,DG,DG,K,DG,DG,W],
      [W,DG,DG,DG,DG,DG,DG,R,R,R,DG,DG,DG,DG,DG,DG,DG,DG,DG,W],
      [W,DG,T,DG,K,DG,DG,R,R,R,DG,DG,DG,K,DG,DG,T,DG,DG,W],
      [W,DG,DG,DG,DG,DG,DG,R,R,R,DG,DG,DG,DG,DG,DG,DG,DG,DG,W],
      [W,DG,DG,T,DG,DG,DG,R,R,R,DG,DG,DG,DG,T,DG,DG,DG,DG,W],
      [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W]
    ],
    playerStart: { x: 3, y: 12 },
    portals: [
      { x: 1, y: 13, to: 'goblinForest', color: 'purple', label: 'Goblin Forest' },
      { x: 18, y: 13, to: 'demonGate', color: 'red', label: 'Demon Gate' }
    ],
    npcs: [
      { type: 'healer', x: 5, y: 4 },
      { type: 'questMaster', x: 7, y: 4 }
    ],
    monsters: [
      { type: 'elf', x: 12, y: 3 },
      { type: 'darkElf', x: 15, y: 7 },
      { type: 'elfMage', x: 13, y: 10 },
      { type: 'darkElf', x: 17, y: 11 }
    ],
    boss: { type: 'ancientElf', x: 16, y: 4 },
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
    map: [
      [WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD],
      [WD,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,WD],
      [WD,S,WD,WD,S,WD,WD,S,WD,WD,S,WD,WD,S,WD,WD,S,WD,S,WD],
      [WD,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,WD,S,WD],
      [WD,S,WD,S,WD,WD,S,WD,WD,S,WD,WD,S,WD,WD,S,S,WD,S,WD],
      [WD,S,WD,S,S,S,S,S,S,S,S,S,S,S,S,S,WD,WD,S,WD],
      [WD,S,WD,WD,WD,S,WD,WD,S,WD,WD,S,WD,WD,S,S,S,S,S,WD],
      [WD,S,S,S,S,S,S,S,S,S,S,S,S,S,S,WD,WD,WD,S,WD],
      [WD,S,WD,WD,S,WD,WD,S,WD,WD,S,WD,WD,S,S,S,S,S,S,WD],
      [WD,S,S,S,S,S,S,S,S,S,S,S,S,S,WD,WD,S,WD,S,WD],
      [WD,S,WD,S,WD,WD,S,WD,WD,S,WD,WD,S,S,S,S,S,WD,S,WD],
      [WD,S,WD,S,S,S,S,S,S,S,S,S,S,WD,WD,S,S,WD,S,WD],
      [WD,S,S,S,WD,WD,S,WD,WD,S,WD,WD,S,S,S,S,S,S,S,WD],
      [WD,OUT,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,IN,WD],
      [WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD]
    ],
    playerStart: { x: 2, y: 13 },
    portals: [
      { x: 1, y: 13, to: 'orcCamp', color: 'purple', label: 'Orc Camp' },
      { x: 18, y: 13, to: 'demonGate', color: 'red', label: 'Demon Gate' }
    ],
    npcs: [
      { type: 'questMaster', x: 4, y: 12 },
      { type: 'guard', x: 3, y: 12 }
    ],
    monsters: [
      { type: 'skeleton', x: 8, y: 3 },
      { type: 'zombie', x: 13, y: 6 },
      { type: 'ghost', x: 11, y: 10 },
      { type: 'skeleton', x: 16, y: 12 }
    ],
    boss: { type: 'lichKing', x: 16, y: 2 },
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
    map: [
      [WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD],
      [WD,S,S,S,L,L,S,S,S,S,S,S,L,L,S,S,S,S,S,WD],
      [WD,S,WD,S,L,S,S,WD,WD,S,WD,S,S,L,S,WD,WD,S,S,WD],
      [WD,S,S,S,L,S,S,S,S,S,S,S,S,L,S,S,S,S,S,WD],
      [WD,S,WD,S,L,L,S,WD,WD,S,WD,S,L,L,S,WD,S,WD,S,WD],
      [WD,S,WD,S,S,S,S,S,S,S,S,S,S,S,S,WD,S,WD,S,WD],
      [WD,S,WD,WD,WD,S,WD,WD,S,L,L,S,WD,WD,S,S,S,S,S,WD],
      [WD,S,S,S,S,S,S,S,S,L,L,S,S,S,S,WD,WD,WD,S,WD],
      [WD,S,WD,WD,S,WD,WD,S,S,S,S,S,WD,S,S,S,S,S,S,WD],
      [WD,S,S,S,S,S,S,S,L,L,L,L,S,S,WD,WD,S,WD,S,WD],
      [WD,S,WD,S,WD,WD,S,S,S,L,L,S,S,S,S,S,S,WD,S,WD],
      [WD,S,WD,S,S,S,S,WD,S,S,S,S,S,WD,WD,S,S,WD,S,WD],
      [WD,S,S,S,WD,WD,S,WD,S,WD,WD,S,S,S,S,S,S,S,S,WD],
      [WD,OUT,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,IN,WD],
      [WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD,WD]
    ],
    playerStart: { x: 2, y: 13 },
    portals: [
      { x: 1, y: 13, to: 'elfWoods', color: 'red', label: 'Elf Woods' },
      { x: 18, y: 13, to: 'undeadCrypt', color: 'purple', label: 'Undead Crypt' }
    ],
    npcs: [
      { type: 'questMaster', x: 4, y: 12 },
      { type: 'guard', x: 3, y: 12 }
    ],
    monsters: [
      { type: 'demon', x: 9, y: 4 },
      { type: 'demonKnight', x: 14, y: 6 },
      { type: 'demonMage', x: 11, y: 10 },
      { type: 'demon', x: 16, y: 12 }
    ],
    boss: { type: 'demonLord', x: 16, y: 2 },
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
