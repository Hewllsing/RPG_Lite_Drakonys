import { npcAssets } from './gameAssets';

export const NPC_DEFINITIONS = {
  blacksmith: {
    id: 'blacksmith',
    name: 'Blacksmith',
    role: 'Forja e melhorias',
    dialogue: 'A forja esta acesa. Traz minerio, cristais e paciencia.',
    actionLabel: 'Equipamento',
    assets: npcAssets.blacksmith
  },
  merchant: {
    id: 'merchant',
    name: 'Merchant',
    role: 'Suprimentos',
    dialogue: 'Moedas falam alto. Pocoes, laminas, arcos, cajados... tenho mercadoria para todos os tipos de coragem.',
    actionLabel: 'Loja',
    assets: npcAssets.merchant
  },
  healer: {
    id: 'healer',
    name: 'Healer',
    role: 'Santuario',
    dialogue: 'Descansa, viajante. A escuridao ja leva demais dos vivos.',
    actionLabel: 'Curar',
    assets: npcAssets.healer
  },
  questMaster: {
    id: 'questMaster',
    name: 'Quest Master',
    role: 'Contratos',
    dialogue: 'As estradas estao cheias de trabalho para quem sabe segurar uma arma.',
    actionLabel: 'Quests',
    assets: npcAssets.questMaster
  },
  trainer: {
    id: 'trainer',
    name: 'Trainer',
    role: 'Classes e skills',
    dialogue: 'Forca sem tempo certo e so barulho. Aprende o ritmo da tua classe.',
    actionLabel: 'Treino',
    assets: npcAssets.trainer
  },
  guard: {
    id: 'guard',
    name: 'Guard',
    role: 'Orientacao',
    dialogue: 'Fica na estrada. A floresta escuta, e a cripta lembra.',
    actionLabel: 'Informacao',
    assets: npcAssets.guard
  },
  storageChest: {
    id: 'storageChest',
    name: 'Bau da Casa',
    role: 'Armazem pessoal',
    dialogue: 'Este bau fica na tua casa. Guarda aqui o que nao queres carregar na mochila.',
    actionLabel: 'Abrir bau',
    assets: npcAssets.merchant
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
