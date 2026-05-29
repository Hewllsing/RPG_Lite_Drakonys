export const QUEST_DEFINITIONS = {
  defeatGoblins: {
    id: 'defeatGoblins',
    title: 'Derrotar 5 Goblins',
    zone: 'goblinForest',
    description: 'Reduza a patrulha goblin que assombra a floresta.',
    objectiveType: 'kill',
    targetTypes: ['goblin', 'goblinArcher', 'goblinShaman'],
    required: 5,
    reward: '80 XP, 25 gold',
    status: 'available'
  },
  defeatGoblinKing: {
    id: 'defeatGoblinKing',
    title: 'Derrotar o Goblin King',
    zone: 'goblinForest',
    description: 'A coroa podre da floresta precisa cair.',
    objectiveType: 'kill',
    targetTypes: ['goblinKing'],
    required: 1,
    reward: 'Totem raro, 180 XP',
    status: 'available'
  },
  speakHealer: {
    id: 'speakHealer',
    title: 'Falar com o Healer',
    zone: 'goblinForest',
    description: 'Procure o healer e aprenda onde recuperar recursos.',
    objectiveType: 'talk',
    targetTypes: ['healer'],
    required: 1,
    reward: '2 potions',
    status: 'available'
  },
  collectDemonKey: {
    id: 'collectDemonKey',
    title: 'Recolher Demon Key',
    zone: 'demonGate',
    description: 'Uma chave infernal abre os portoes internos.',
    objectiveType: 'collect',
    targetTypes: ['demonKey'],
    required: 1,
    reward: 'Acesso ao boss final',
    status: 'available'
  },
  exploreDemonGate: {
    id: 'exploreDemonGate',
    title: 'Explorar Demon Gate',
    zone: 'demonGate',
    description: 'Atravesse o portal vermelho e sobreviva ao primeiro passo.',
    objectiveType: 'explore',
    targetTypes: ['demonGate'],
    required: 1,
    reward: '120 XP',
    status: 'available'
  }
};

export function createQuestState() {
  return Object.values(QUEST_DEFINITIONS).map(quest => ({
    ...quest,
    progress: 0
  }));
}
