import { npcAssets } from './gameAssets';

export const NPC_DEFINITIONS = {
  blacksmith: {
    id: 'blacksmith',
    name: 'Blacksmith',
    role: 'Forge & upgrades',
    dialogue: 'My forge is ready. Bring ore, crystals, and patience.',
    actionLabel: 'Equipamento',
    assets: npcAssets.blacksmith
  },
  merchant: {
    id: 'merchant',
    name: 'Merchant',
    role: 'Supplies',
    dialogue: 'Coins talk. Potions, arrows, blades... I have enough for a brave fool.',
    actionLabel: 'Loja',
    assets: npcAssets.merchant
  },
  healer: {
    id: 'healer',
    name: 'Healer',
    role: 'Sanctuary',
    dialogue: 'Rest, wanderer. The dark takes enough from the living.',
    actionLabel: 'Curar',
    assets: npcAssets.healer
  },
  questMaster: {
    id: 'questMaster',
    name: 'Quest Master',
    role: 'Contracts',
    dialogue: 'The roads are full of work for someone who can hold a blade.',
    actionLabel: 'Quests',
    assets: npcAssets.questMaster
  },
  trainer: {
    id: 'trainer',
    name: 'Trainer',
    role: 'Classes & skills',
    dialogue: 'Strength without timing is noise. Learn the rhythm of your class.',
    actionLabel: 'Treino',
    assets: npcAssets.trainer
  },
  guard: {
    id: 'guard',
    name: 'Guard',
    role: 'Zone guidance',
    dialogue: 'Stay on the road. The woods listen, and the crypt remembers.',
    actionLabel: 'Informacao',
    assets: npcAssets.guard
  }
};

export function createNpc(type, x, y) {
  const npc = NPC_DEFINITIONS[type];

  return {
    ...npc,
    type,
    x,
    y
  };
}
