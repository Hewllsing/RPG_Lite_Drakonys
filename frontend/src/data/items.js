import { itemAssets, rarityFrames } from './gameAssets';

export const ITEM_DEFINITIONS = {
  goldCoin: {
    id: 'goldCoin',
    name: 'Gold Coin',
    type: 'currency',
    rarity: 'common',
    value: 1,
    icon: itemAssets.goldCoin,
    frame: rarityFrames.common
  },
  healthPotion: {
    id: 'healthPotion',
    name: 'Health Potion',
    type: 'consumable',
    rarity: 'common',
    value: 45,
    icon: itemAssets.healthPotion,
    frame: rarityFrames.common
  },
  manaPotion: {
    id: 'manaPotion',
    name: 'Mana Potion',
    type: 'consumable',
    rarity: 'common',
    value: 50,
    icon: itemAssets.manaPotion,
    frame: rarityFrames.common
  },
  ironSword: {
    id: 'ironSword',
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'rare',
    value: 420,
    icon: itemAssets.ironSword,
    frame: rarityFrames.rare
  },
  staff: {
    id: 'staff',
    name: 'Apprentice Staff',
    type: 'weapon',
    rarity: 'rare',
    value: 460,
    icon: itemAssets.staff,
    frame: rarityFrames.rare
  },
  bow: {
    id: 'bow',
    name: 'Hunter Bow',
    type: 'weapon',
    rarity: 'rare',
    value: 440,
    icon: itemAssets.bow,
    frame: rarityFrames.rare
  },
  commonChest: {
    id: 'commonChest',
    name: 'Worn Chestplate',
    type: 'armor',
    rarity: 'common',
    value: 280,
    icon: itemAssets.commonChest,
    frame: rarityFrames.common
  },
  goblinTotem: {
    id: 'goblinTotem',
    name: 'Goblin Totem',
    type: 'quest',
    rarity: 'rare',
    value: 180,
    icon: itemAssets.goblinTotem,
    frame: rarityFrames.rare
  },
  demonKey: {
    id: 'demonKey',
    name: 'Demon Key',
    type: 'quest',
    rarity: 'epic',
    value: 900,
    icon: itemAssets.demonKey,
    frame: rarityFrames.epic
  },
  crystal: {
    id: 'crystal',
    name: 'Magic Crystal',
    type: 'material',
    rarity: 'rare',
    value: 240,
    icon: itemAssets.crystal,
    frame: rarityFrames.rare
  },
  demonEssence: {
    id: 'demonEssence',
    name: 'Demon Essence',
    type: 'material',
    rarity: 'legendary',
    value: 1200,
    icon: itemAssets.demonEssence,
    frame: rarityFrames.legendary
  }
};

export const STARTER_INVENTORY = [
  { itemId: 'healthPotion', quantity: 3 },
  { itemId: 'manaPotion', quantity: 2 },
  { itemId: 'goldCoin', quantity: 25 },
  { itemId: 'ironSword', quantity: 1 },
  { itemId: 'commonChest', quantity: 1 }
];
