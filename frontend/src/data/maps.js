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
    map: [
      [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
      [W,G,G,G,T,G,G,G,R,R,G,G,G,T,G,G,G,G,G,W],
      [W,G,T,G,T,G,B,G,R,R,G,B,G,T,G,K,G,G,G,W],
      [W,G,T,G,G,G,G,G,R,R,G,G,G,G,G,G,G,T,G,W],
      [W,G,G,G,K,G,G,G,R,R,G,G,T,T,G,G,G,T,G,W],
      [W,G,B,G,G,G,WA,BR,BR,BR,WA,G,G,G,G,G,G,G,G,W],
      [W,G,G,G,T,G,WA,WA,WA,BR,WA,G,K,G,T,G,G,G,G,W],
      [W,G,G,G,T,G,G,G,R,R,G,G,G,G,T,G,G,B,G,W],
      [W,G,K,G,G,G,G,G,R,R,G,G,B,G,G,G,G,G,G,W],
      [W,G,G,G,T,T,G,G,R,R,G,G,T,T,G,G,K,G,G,W],
      [W,G,G,G,G,G,G,G,R,R,G,G,G,G,G,G,G,G,G,W],
      [W,G,T,G,K,G,B,G,R,R,G,B,G,K,G,G,T,G,G,W],
      [W,G,G,G,G,G,G,G,R,R,G,G,G,G,G,G,G,G,G,W],
      [W,G,G,T,G,G,G,G,R,R,G,G,G,G,T,G,G,G,G,W],
      [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W]
    ],
    playerStart: { x: 5, y: 5 },
    portals: [
      { x: 9, y: 1, to: 'starterTown', color: 'blue', label: 'Initial City' },
      { x: 18, y: 10, to: 'orcCamp', color: 'blue', label: 'Orc Camp' },
      { x: 2, y: 13, to: 'elfWoods', color: 'purple', label: 'Elf Woods' }
    ],
    npcs: [
      { type: 'questMaster', x: 4, y: 3 },
      { type: 'healer', x: 6, y: 3 },
      { type: 'merchant', x: 5, y: 4 },
      { type: 'guard', x: 8, y: 4 }
    ],
    monsters: [
      { type: 'goblin', x: 11, y: 3 },
      { type: 'goblinArcher', x: 14, y: 5 },
      { type: 'goblinShaman', x: 13, y: 9 },
      { type: 'goblin', x: 16, y: 11 }
    ],
    boss: { type: 'goblinKing', x: 16, y: 3 },
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
