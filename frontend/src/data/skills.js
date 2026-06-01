import { skillIcons } from './gameAssets';

export const SKILL_DEFINITIONS = [
  {
    id: 'slash',
    key: '1',
    icon: skillIcons.slash,
    name: 'Slash',
    manaCost: 0,
    cooldown: 0,
    range: 1,
    tooltip: 'Ataque fisico rapido com a arma equipada.'
  },
  {
    id: 'fireball',
    key: '2',
    icon: skillIcons.fireball,
    name: 'Fireball',
    manaCost: 18,
    cooldown: 2800,
    range: 5,
    tooltip: 'Projeta fogo arcano contra o target.'
  },
  {
    id: 'powerShot',
    key: '3',
    icon: skillIcons.powerShot,
    name: 'Power Shot',
    manaCost: 16,
    cooldown: 3600,
    range: 5,
    tooltip: 'Disparo preciso que escala com destreza.'
  },
  {
    id: 'heal',
    key: '4',
    icon: skillIcons.heal,
    name: 'Heal',
    manaCost: 20,
    cooldown: 6000,
    tooltip: 'Recupera vida imediatamente.'
  },
  {
    id: 'shadowStep',
    key: 'Q',
    icon: skillIcons.shadowStep,
    name: 'Shadow Step',
    manaCost: 12,
    cooldown: 4200,
    range: 3,
    tooltip: 'Avanca nas sombras na direcao atual.'
  },
  {
    id: 'curse',
    key: 'E',
    icon: skillIcons.curse,
    name: 'Curse',
    manaCost: 24,
    cooldown: 9000,
    range: 4,
    tooltip: 'Enfraquece e fere o target com magia sombria.'
  }
];
