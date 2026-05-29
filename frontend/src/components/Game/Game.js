
import { ref, onMounted, onUnmounted } from 'vue';

import {
    getCharacter,
    saveCharacter
} from '../../services/characterService';
import { getMonsters } from '../../services/monsterService';
import { attackMonster as attackMonsterRequest } from '../../services/combatService';

/* PLAYER */

import playerIdleDown from '../../assets/player/player_idle_down.png';
import playerWalkDown1 from '../../assets/player/player_walk_down_1.png';
import playerWalkDown2 from '../../assets/player/player_walk_down_2.png';
import playerAttackDown from '../../assets/player/player_attack_down.png';

import playerIdleUp from '../../assets/player/player_idle_up.png';
import playerWalkUp1 from '../../assets/player/player_walk_up_1.png';
import playerWalkUp2 from '../../assets/player/player_walk_up_2.png';
import playerAttackUp from '../../assets/player/player_attack_up.png';

import playerIdleLeft from '../../assets/player/player_idle_left.png';
import playerWalkLeft1 from '../../assets/player/player_walk_left_1.png';
import playerWalkLeft2 from '../../assets/player/player_walk_left_2.png';
import playerAttackLeft from '../../assets/player/player_attack_left.png';

import playerIdleRight from '../../assets/player/player_idle_right.png';
import playerWalkRight1 from '../../assets/player/player_walk_right_1.png';
import playerWalkRight2 from '../../assets/player/player_walk_right_2.png';
import playerAttackRight from '../../assets/player/player_attack_right.png';

/* MONSTERS */

import demonAttack from '../../assets/monsters/demon_attack.png';
import demonIdle from '../../assets/monsters/demon_idle.png';
import demonWalk1 from '../../assets/monsters/demon_walk_1.png';
import demonWalk2 from '../../assets/monsters/demon_walk_2.png';

import elfAttack from '../../assets/monsters/elf_attack.png';
import elfIdle from '../../assets/monsters/elf_idle.png';
import elfWalk1 from '../../assets/monsters/elf_walk_1.png';
import elfWalk2 from '../../assets/monsters/elf_walk_2.png';

import goblinAttack from '../../assets/monsters/goblin_attack.png';
import goblinIdle from '../../assets/monsters/goblin_idle.png';
import goblinWalk1 from '../../assets/monsters/goblin_walk_1.png';
import goblinWalk2 from '../../assets/monsters/goblin_walk_2.png';

import orcAttack from '../../assets/monsters/orc_attack.png';
import orcIdle from '../../assets/monsters/orc_idle.png';
import orcWalk1 from '../../assets/monsters/orc_walk_1.png';
import orcWalk2 from '../../assets/monsters/orc_walk_2.png';

import skeletonAttack from '../../assets/monsters/skeleton_attack.png';
import skeletonIdle from '../../assets/monsters/skeleton_idle.png';
import skeletonWalk1 from '../../assets/monsters/skeleton_walk_1.png';
import skeletonWalk2 from '../../assets/monsters/skeleton_walk_2.png';

/* TILES */

import grassTile from '../../assets/tiles/grass.png';
import wallTile from '../../assets/tiles/wall.png';
import treeTile from '../../assets/tiles/tree.png';
import waterTile from '../../assets/tiles/water.png';

/* UI */

import hpBar from '../../assets/ui/bar_hp.png';
import mpBar from '../../assets/ui/bar_mp.png';
import xpBar from '../../assets/ui/bar_xp.png';

import skillSlot from '../../assets/ui/skill_slot.png';

/* SKILLS */

import skillAttack from '../../assets/skills/skill_basic_attack.png';
import skillFireball from '../../assets/skills/skill_fireball.png';
import skillHeal from '../../assets/skills/skill_heal.png';
import skillDash from '../../assets/skills/skill_dash.png';
import skillPowerStrike from '../../assets/skills/skill_power_strike.png';
import skillRegeneration from '../../assets/skills/skill_regeneration.png';
import skillUltimate from '../../assets/skills/skill_ultimate.png';

const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const PLAYER_START_POSITION = {
    x: 5,
    y: 5
};
const BLOCKED_TILES = [
    'wall',
    'tree',
    'water'
];
const PLAYER_MOVE_INTERVAL = 170;
const PLAYER_ATTACK_COOLDOWN = 900;
const MIN_PLAYER_ATTACK_COOLDOWN = 450;
const AUTO_COMBAT_INTERVAL = 180;
const ATTRIBUTE_POINTS_PER_LEVEL = 3;
const COMBAT_CLOCK_INTERVAL = 80;
const LOOT_LOG_LIMIT = 6;
const MONSTER_AI_INTERVAL = 420;
const WEAPON_PROFILES = {
    warrior: {
        weaponType: 'sword',
        weaponLabel: 'Espada',
        damageType: 'physical',
        damageLabel: 'Fisico',
        range: 1,
        baseDamage: 6,
        primaryAttribute: 'strength',
        primaryScale: 2,
        secondaryAttribute: 'dexterity',
        secondaryScale: 0.4,
        accuracyBonus: 0,
        criticalBonus: 0
    },
    mage: {
        weaponType: 'staff',
        weaponLabel: 'Cajado',
        damageType: 'magical',
        damageLabel: 'Magico',
        range: 3,
        baseDamage: 5,
        primaryAttribute: 'intelligence',
        primaryScale: 2.2,
        secondaryAttribute: 'dexterity',
        secondaryScale: 0.25,
        accuracyBonus: 2,
        criticalBonus: 0
    },
    archer: {
        weaponType: 'bow',
        weaponLabel: 'Arco',
        damageType: 'physical',
        damageLabel: 'Fisico',
        range: 4,
        baseDamage: 4,
        primaryAttribute: 'dexterity',
        primaryScale: 1.7,
        secondaryAttribute: 'strength',
        secondaryScale: 0.8,
        accuracyBonus: 5,
        criticalBonus: 5
    }
};
const ATTRIBUTE_GAIN_BY_POINT = {
    strength: {
        maxHp: 5
    },
    intelligence: {
        maxMana: 8
    },
    dexterity: {}
};
const SKILL_DEFINITIONS = [
    {
        id: 'basicAttack',
        key: '1',
        icon: skillAttack,
        name: 'Ataque',
        manaCost: 0,
        cooldown: 0
    },
    {
        id: 'fireball',
        key: '2',
        icon: skillFireball,
        name: 'Fireball',
        manaCost: 18,
        cooldown: 2800,
        range: 5
    },
    {
        id: 'heal',
        key: '3',
        icon: skillHeal,
        name: 'Heal',
        manaCost: 20,
        cooldown: 6000
    },
    {
        id: 'dash',
        key: '4',
        icon: skillDash,
        name: 'Dash',
        manaCost: 10,
        cooldown: 3500,
        range: 3
    },
    {
        id: 'powerStrike',
        key: 'Q',
        icon: skillPowerStrike,
        name: 'Power Strike',
        manaCost: 16,
        cooldown: 4200,
        range: 1
    },
    {
        id: 'regeneration',
        key: 'E',
        icon: skillRegeneration,
        name: 'Regeneration',
        manaCost: 26,
        cooldown: 14000
    },
    {
        id: 'ultimate',
        key: 'R',
        icon: skillUltimate,
        name: 'Ultimate',
        manaCost: 45,
        cooldown: 22000,
        range: 5,
        radius: 2
    }
];

const gameMap = [

    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'tree', 'tree', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'tree', 'tree', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'water', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],

    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']

];

export default {

    props: {
        characterId: {
            type: Number,
            required: true
        }
    },

    setup(props) {

        const tileSize = 40;

        const player = ref({
            name: 'Hero',
            x: PLAYER_START_POSITION.x,
            y: PLAYER_START_POSITION.y,
            level: 1,
            xp: 0,
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 50,
            gold: 0,
            characterClass: 'warrior',
            strength: 5,
            intelligence: 5,
            dexterity: 5,
            attributePoints: 0,
            direction: 'down',
            moving: false,
            attacking: false,
            animationFrame: 0,
            lastAttackAt: 0
        });

        const monsters = ref([]);

        const selectedTarget = ref(null);

        const floatingTexts = ref([]);
        const lootLog = ref([]);
        const skillEffects = ref([]);
        const combatClock = ref(Date.now());

        let animationInterval = null;
        let monsterAIInterval = null;
        let playerMovementInterval = null;
        let autoCombatInterval = null;
        let combatClockInterval = null;
        let playerAttackTimeout = null;
        let playerAttackInProgress = false;
        const regenerationIntervals = [];
        const pressedMovementKeys = new Set();

        const camera = ref({
            x: 0,
            y: 0
        });

        const tileImages = {
            grass: grassTile,
            wall: wallTile,
            tree: treeTile,
            water: waterTile
        };

        const skillBar = SKILL_DEFINITIONS;
        const skillCooldowns = ref(
            SKILL_DEFINITIONS.reduce((cooldowns, skill) => {
                cooldowns[skill.id] = 0;
                return cooldowns;
            }, {})
        );

        const playerSprites = {

            down: {
                idle: playerIdleDown,
                attack: playerAttackDown,
                walk: [
                    playerWalkDown1,
                    playerWalkDown2
                ]
            },

            up: {
                idle: playerIdleUp,
                attack: playerAttackUp,
                walk: [
                    playerWalkUp1,
                    playerWalkUp2
                ]
            },

            left: {
                idle: playerIdleLeft,
                attack: playerAttackLeft,
                walk: [
                    playerWalkLeft1,
                    playerWalkLeft2
                ]
            },

            right: {
                idle: playerIdleRight,
                attack: playerAttackRight,
                walk: [
                    playerWalkRight1,
                    playerWalkRight2
                ]
            }
        };

        const monsterSprites = {

            demon: {
                idle: demonIdle,
                attack: demonAttack,
                walk: [
                    demonWalk1,
                    demonWalk2
                ]
            },

            elf: {
                idle: elfIdle,
                attack: elfAttack,
                walk: [
                    elfWalk1,
                    elfWalk2
                ]
            },

            goblin: {
                idle: goblinIdle,
                attack: goblinAttack,
                walk: [
                    goblinWalk1,
                    goblinWalk2
                ]
            },

            orc: {
                idle: orcIdle,
                attack: orcAttack,
                walk: [
                    orcWalk1,
                    orcWalk2
                ]
            },

            skeleton: {
                idle: skeletonIdle,
                attack: skeletonAttack,
                walk: [
                    skeletonWalk1,
                    skeletonWalk2
                ]
            }
        };

        function getPlayerSprite() {

            const direction =
                playerSprites[player.value.direction];

            if (player.value.attacking) {
                return direction.attack;
            }

            if (!player.value.moving) {
                return direction.idle;
            }

            return direction.walk[
                player.value.animationFrame
            ];
        }

        function getMonsterSprite(monster) {

            const spriteKey =
                monster.spriteKey ||
                monster.race?.toLowerCase() ||
                'goblin';
            const sprites =
                monsterSprites[spriteKey] ||
                monsterSprites.goblin;

            if (monster.attacking) {
                return sprites.attack;
            }

            if (monster.moving) {
                return sprites.walk[
                    monster.animationFrame || 0
                ];
            }

            return sprites.idle;
        }

        function updateCamera() {

            camera.value.x =
                player.value.x * tileSize - 400;

            camera.value.y =
                player.value.y * tileSize - 300;

            if (camera.value.x < 0) {
                camera.value.x = 0;
            }

            if (camera.value.y < 0) {
                camera.value.y = 0;
            }
        }

        function persistCharacter() {

            saveCharacter(props.characterId, player.value).catch(() => {
                console.log('Nao foi possivel guardar o personagem.');
            });
        }

        function getAvailableAttributePoints() {

            return Number(player.value.attributePoints) || 0;
        }

        function getCharacterClass() {

            return player.value.characterClass || 'warrior';
        }

        function getWeaponProfile() {

            return (
                WEAPON_PROFILES[getCharacterClass()] ||
                WEAPON_PROFILES.warrior
            );
        }

        function getWeaponLabel() {

            return getWeaponProfile().weaponLabel;
        }

        function getDamageTypeLabel() {

            return getWeaponProfile().damageLabel;
        }

        function getBasicAttackRange() {

            return getWeaponProfile().range;
        }

        function getPlayerArmor() {

            return Math.floor(
                (Number(player.value.strength) || 0) * 0.55 +
                    (Number(player.value.level) || 1) * 0.4
            );
        }

        function getPlayerCriticalChance() {

            return Math.min(
                45,
                4 +
                    (Number(player.value.dexterity) || 0) * 1.5 +
                    getWeaponProfile().criticalBonus
            );
        }

        function getPlayerAccuracy() {

            return Math.min(
                98,
                76 +
                    (Number(player.value.dexterity) || 0) * 1.2 +
                    (Number(player.value.level) || 1) * 0.3 +
                    getWeaponProfile().accuracyBonus
            );
        }

        function getPlayerEvasionChance() {

            return Math.min(
                35,
                Math.floor(
                    3 +
                        (Number(player.value.dexterity) || 0) * 1.4 +
                        (Number(player.value.level) || 1) * 0.2
                )
            );
        }

        function getPlayerMagicDamage() {

            return 6 + (Number(player.value.intelligence) || 0) * 2;
        }

        function getSkillCooldownReduction() {

            return Math.min(
                35,
                (Number(player.value.intelligence) || 0) * 2
            );
        }

        function getPlayerAttackCooldown() {

            return Math.max(
                MIN_PLAYER_ATTACK_COOLDOWN,
                PLAYER_ATTACK_COOLDOWN -
                    (Number(player.value.dexterity) || 0) * 20
            );
        }

        function getPercent(currentValue, maxValue) {

            const current = Number(currentValue) || 0;
            const max = Number(maxValue) || 1;

            return Math.max(
                0,
                Math.min(
                    100,
                    Math.round((current / max) * 100)
                )
            );
        }

        function getPlayerHpPercent() {

            return getPercent(
                player.value.hp,
                player.value.maxHp
            );
        }

        function getPlayerManaPercent() {

            return getPercent(
                player.value.mana,
                player.value.maxMana
            );
        }

        function getXpRequiredForNextLevel() {

            return (Number(player.value.level) || 1) * 100;
        }

        function getPlayerXpPercent() {

            return getPercent(
                player.value.xp,
                getXpRequiredForNextLevel()
            );
        }

        function getBasicAttackDamagePreview() {

            const profile = getWeaponProfile();
            const primaryValue =
                Number(player.value[profile.primaryAttribute]) || 0;
            const secondaryValue =
                Number(player.value[profile.secondaryAttribute]) || 0;
            const baseDamage = Math.floor(
                profile.baseDamage +
                    primaryValue * profile.primaryScale +
                    secondaryValue * profile.secondaryScale +
                    (Number(player.value.level) || 1)
            );
            const criticalDamage =
                Math.floor(baseDamage * 1.5);

            return `${baseDamage}-${criticalDamage}`;
        }

        function getBasicAttackCooldownPercent() {

            const cooldown = getPlayerAttackCooldown();
            const lastAttackAt = player.value.lastAttackAt || 0;

            if (!lastAttackAt) {
                return 0;
            }

            const elapsed =
                combatClock.value - lastAttackAt;

            if (elapsed >= cooldown) {
                return 0;
            }

            return Math.ceil(
                ((cooldown - elapsed) / cooldown) * 100
            );
        }

        function getBasicAttackCooldownText() {

            const cooldown = getPlayerAttackCooldown();
            const lastAttackAt = player.value.lastAttackAt || 0;
            const remaining = Math.max(
                0,
                cooldown - (combatClock.value - lastAttackAt)
            );

            return (remaining / 1000).toFixed(1);
        }

        function getSkillCooldown(skill) {

            if (skill.id === 'basicAttack') {
                return getPlayerAttackCooldown();
            }

            return Math.max(
                800,
                skill.cooldown *
                    (1 - getSkillCooldownReduction() / 100)
            );
        }

        function getSkillLastUsedAt(skill) {

            if (skill.id === 'basicAttack') {
                return player.value.lastAttackAt || 0;
            }

            return skillCooldowns.value[skill.id] || 0;
        }

        function getSkillRemainingCooldown(skill) {

            const cooldown = getSkillCooldown(skill);
            const lastUsedAt = getSkillLastUsedAt(skill);

            if (!lastUsedAt) {
                return 0;
            }

            return Math.max(
                0,
                cooldown - (combatClock.value - lastUsedAt)
            );
        }

        function isSkillCoolingDown(skill) {

            return getSkillRemainingCooldown(skill) > 0;
        }

        function getSkillCooldownPercent(skill) {

            const remaining =
                getSkillRemainingCooldown(skill);

            if (remaining <= 0) {
                return 0;
            }

            return Math.ceil(
                (remaining / getSkillCooldown(skill)) * 100
            );
        }

        function getSkillCooldownText(skill) {

            const remaining =
                getSkillRemainingCooldown(skill);

            if (remaining <= 0) {
                return '';
            }

            return (remaining / 1000).toFixed(1);
        }

        function getSkillManaCost(skill) {

            return skill.manaCost || 0;
        }

        function canPaySkillMana(skill) {

            return player.value.mana >= getSkillManaCost(skill);
        }

        function markSkillUsed(skill) {

            if (skill.id === 'basicAttack') {
                return;
            }

            skillCooldowns.value[skill.id] = Date.now();
        }

        function getSkillByKey(key) {

            return skillBar.find(
                skill => skill.key.toLowerCase() === key
            );
        }

        function spendAttributePoint(attribute) {

            if (
                getAvailableAttributePoints() <= 0 ||
                !ATTRIBUTE_GAIN_BY_POINT[attribute]
            ) {
                return;
            }

            // Gasta um ponto e aplica os ganhos principais do atributo.
            player.value[attribute] =
                (Number(player.value[attribute]) || 0) + 1;
            player.value.attributePoints =
                getAvailableAttributePoints() - 1;

            if (attribute === 'strength') {
                player.value.maxHp +=
                    ATTRIBUTE_GAIN_BY_POINT.strength.maxHp;
                player.value.hp +=
                    ATTRIBUTE_GAIN_BY_POINT.strength.maxHp;
            }

            if (attribute === 'intelligence') {
                player.value.maxMana +=
                    ATTRIBUTE_GAIN_BY_POINT.intelligence.maxMana;
                player.value.mana +=
                    ATTRIBUTE_GAIN_BY_POINT.intelligence.maxMana;
            }

            persistCharacter();
        }

        function startAnimationLoop() {

            if (animationInterval) {
                return;
            }

            animationInterval = setInterval(() => {

                if (player.value.moving) {

                    player.value.animationFrame =
                        player.value.animationFrame === 0
                            ? 1
                            : 0;
                }

                monsters.value.forEach(monster => {

                    if (!monster.moving) {
                        return;
                    }

                    monster.animationFrame =
                        monster.animationFrame === 0
                            ? 1
                            : 0;
                });

            }, 180);
        }

        function startCombatClock() {

            if (combatClockInterval) {
                return;
            }

            combatClockInterval = setInterval(() => {
                combatClock.value = Date.now();
            }, COMBAT_CLOCK_INTERVAL);
        }

        function updatePlayerDirection(dx, dy) {

            if (dx === 1) {
                player.value.direction = 'right';
                return;
            }

            if (dx === -1) {
                player.value.direction = 'left';
                return;
            }

            if (dy === 1) {
                player.value.direction = 'down';
                return;
            }

            if (dy === -1) {
                player.value.direction = 'up';
            }
        }

        function canPlayerMoveTo(x, y) {

            if (
                x < 0 ||
                y < 0 ||
                x >= MAP_WIDTH ||
                y >= MAP_HEIGHT
            ) {
                return false;
            }

            const tile = gameMap[y][x];

            if (BLOCKED_TILES.includes(tile)) {
                return false;
            }

            return !monsters.value.some(
                monster =>
                    monster.x === x &&
                    monster.y === y
            );
        }

        function movePlayer(dx, dy) {

            if (dx === 0 && dy === 0) {
                player.value.moving = false;
                return false;
            }

            player.value.moving = true;
            updatePlayerDirection(dx, dy);

            const newX = player.value.x + dx;
            const newY = player.value.y + dy;

            if (!canPlayerMoveTo(newX, newY)) {
                return false;
            }

            player.value.x = newX;
            player.value.y = newY;

            updateCamera();
            persistCharacter();

            return true;
        }

        function getMovementVector() {

            const dx =
                (pressedMovementKeys.has('d') ? 1 : 0) -
                (pressedMovementKeys.has('a') ? 1 : 0);
            const dy =
                (pressedMovementKeys.has('s') ? 1 : 0) -
                (pressedMovementKeys.has('w') ? 1 : 0);

            return {
                dx,
                dy
            };
        }

        function movePlayerFromPressedKeys() {

            const {
                dx,
                dy
            } = getMovementVector();

            if (dx === 0 && dy === 0) {
                player.value.moving = false;
                return;
            }

            // Quando duas teclas sao seguradas, tenta a diagonal primeiro.
            if (movePlayer(dx, dy)) {
                return;
            }

            if (dx !== 0 && movePlayer(dx, 0)) {
                return;
            }

            if (dy !== 0 && movePlayer(0, dy)) {
                return;
            }

            player.value.moving = false;
        }

        function startPlayerMovementLoop() {

            if (playerMovementInterval) {
                return;
            }

            playerMovementInterval = setInterval(() => {
                movePlayerFromPressedKeys();
            }, PLAYER_MOVE_INTERVAL);
        }

        function selectTarget(monster) {
            selectedTarget.value = monster;
        }

        function clearTargetIfDead() {

            if (
                selectedTarget.value &&
                selectedTarget.value.hp <= 0
            ) {
                selectedTarget.value = null;
            }
        }

        function createFloatingText(x, y, text, kind = 'damage') {

            const id =
                `${Date.now()}-${Math.random()}`;

            floatingTexts.value.push({
                id,
                x,
                y,
                text,
                kind
            });

            setTimeout(() => {

                floatingTexts.value =
                    floatingTexts.value.filter(
                        t => t.id !== id
                    );

            }, 1000);
        }

        function createSkillEffect(
            x,
            y,
            kind,
            duration = 520
        ) {

            const id =
                `${Date.now()}-${Math.random()}`;

            skillEffects.value.push({
                id,
                x,
                y,
                kind
            });

            setTimeout(() => {

                skillEffects.value =
                    skillEffects.value.filter(
                        effect => effect.id !== id
                    );

            }, duration);
        }

        function addLootEntry(text) {

            lootLog.value = [
                {
                    id: `${Date.now()}-${Math.random()}`,
                    text
                },
                ...lootLog.value
            ].slice(0, LOOT_LOG_LIMIT);
        }

        function grantMonsterLoot(monster) {

            const goldMin =
                Number(monster.lootGoldMin) || 0;
            const goldMax = Math.max(
                goldMin,
                Number(monster.lootGoldMax) || 0
            );
            const itemChance =
                Number(monster.lootItemChance) || 0;
            const itemName =
                monster.lootItemName?.trim();
            const lootMessages = [];

            if (goldMax > 0) {
                const gold =
                    goldMin +
                    Math.floor(
                        Math.random() *
                            (goldMax - goldMin + 1)
                    );

                if (gold > 0) {
                    player.value.gold =
                        (Number(player.value.gold) || 0) +
                        gold;
                    lootMessages.push(
                        `${monster.name} deixou ${gold} gold`
                    );
                    createFloatingText(
                        monster.x,
                        monster.y,
                        `+${gold}g`,
                        'loot'
                    );
                }
            }

            if (
                itemName &&
                Math.random() * 100 < itemChance
            ) {
                lootMessages.push(
                    `${monster.name} deixou ${itemName}`
                );
            }

            lootMessages.forEach(addLootEntry);
        }

        function getDamageMitigation(monster, damageType) {

            const race =
                monster.spriteKey ||
                monster.race?.toLowerCase() ||
                'goblin';
            const defenses = {
                demon: {
                    physical: 4,
                    magical: 3
                },
                elf: {
                    physical: 1,
                    magical: 2
                },
                goblin: {
                    physical: 0,
                    magical: 0
                },
                orc: {
                    physical: 3,
                    magical: 1
                },
                skeleton: {
                    physical: 2,
                    magical: 2
                }
            };
            const raceDefense =
                defenses[race] || defenses.goblin;

            return Math.floor(
                (Number(monster.level) || 1) * 0.5
            ) + raceDefense[damageType];
        }

        function removeMonsterIfDead(monster, xpMultiplier = 20) {

            if (monster.hp > 0) {
                return false;
            }

            grantMonsterLoot(monster);
            player.value.xp +=
                (Number(monster.level) || 1) * xpMultiplier;

            monsters.value =
                monsters.value.filter(
                    item => item.id !== monster.id
                );

            if (
                selectedTarget.value &&
                selectedTarget.value.id === monster.id
            ) {
                selectedTarget.value = null;
                stopAutoCombat();
            }

            checkLevelUp();
            persistCharacter();

            return true;
        }

        function damageMonster(
            monster,
            amount,
            {
                kind = 'damage',
                damageType = 'physical',
                ignoreMitigation = false,
                xpMultiplier = 20
            } = {}
        ) {

            if (!monster || monster.hp <= 0) {
                return false;
            }

            engageMonster(monster);

            const mitigation =
                ignoreMitigation
                    ? 0
                    : getDamageMitigation(monster, damageType);
            const damage = Math.max(
                1,
                Math.floor(amount) - mitigation
            );

            monster.hp = Math.max(
                0,
                monster.hp - damage
            );

            createFloatingText(
                monster.x,
                monster.y,
                `-${damage}`,
                kind
            );

            removeMonsterIfDead(monster, xpMultiplier);

            return true;
        }

        function healPlayer(amount, kind = 'heal') {

            const missingHp =
                player.value.maxHp - player.value.hp;
            const healed =
                Math.min(missingHp, Math.floor(amount));

            if (healed <= 0) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Cheio',
                    'heal'
                );
                return 0;
            }

            player.value.hp += healed;

            createFloatingText(
                player.value.x,
                player.value.y,
                `+${healed}`,
                kind
            );

            return healed;
        }

        function playPlayerAttackAnimation() {

            player.value.attacking = true;

            if (playerAttackTimeout) {
                clearTimeout(playerAttackTimeout);
            }

            playerAttackTimeout = setTimeout(() => {

                player.value.attacking = false;

            }, 220);
        }

        function stopMonsterMovementAnimation(monster) {

            if (monster.movementStopTimeout) {
                clearTimeout(monster.movementStopTimeout);
            }

            monster.movementStopTimeout = setTimeout(() => {

                monster.moving = false;

            }, 240);
        }

        function playMonsterAttackAnimation(monster) {

            monster.attacking = true;
            monster.moving = false;

            if (monster.attackAnimationTimeout) {
                clearTimeout(monster.attackAnimationTimeout);
            }

            monster.attackAnimationTimeout = setTimeout(() => {

                monster.attacking = false;

            }, 260);
        }

        function getTileDistance(
            fromX,
            fromY,
            toX,
            toY
        ) {

            return Math.max(
                Math.abs(fromX - toX),
                Math.abs(fromY - toY)
            );
        }

        function getDistanceToPlayer(monster) {

            return getTileDistance(
                player.value.x,
                player.value.y,
                monster.x,
                monster.y
            );
        }

        function getDistanceToTarget(target) {

            if (!target) {
                return Infinity;
            }

            return getTileDistance(
                player.value.x,
                player.value.y,
                target.x,
                target.y
            );
        }

        function getDistanceToSpawn(monster) {

            return getTileDistance(
                monster.x,
                monster.y,
                monster.spawnX,
                monster.spawnY
            );
        }

        function getMonsterPreferredRange(monster) {

            const preferredRange = Math.max(
                1,
                Number(monster.preferredRange) || 1
            );

            return Math.min(
                Math.max(
                    1,
                    Number(monster.attackRange) || 1
                ),
                preferredRange
            );
        }

        function createTileKey(x, y) {
            return `${x},${y}`;
        }

        function stopAutoCombat() {

            if (autoCombatInterval) {
                clearInterval(autoCombatInterval);
                autoCombatInterval = null;
            }
        }

        function movePlayerTowardsTarget(target) {

            if (!target || target.hp <= 0) {
                return false;
            }

            if (getDistanceToTarget(target) <= getBasicAttackRange()) {
                return true;
            }

            const deltaX = target.x - player.value.x;
            const deltaY = target.y - player.value.y;
            const stepX =
                deltaX === 0
                    ? 0
                    : deltaX > 0
                        ? 1
                        : -1;
            const stepY =
                deltaY === 0
                    ? 0
                    : deltaY > 0
                        ? 1
                        : -1;

            const primaryStep =
                Math.abs(deltaX) >= Math.abs(deltaY)
                    ? {
                        x: stepX,
                        y: 0
                    }
                    : {
                        x: 0,
                        y: stepY
                    };
            const secondaryStep =
                Math.abs(deltaX) >= Math.abs(deltaY)
                    ? {
                        x: 0,
                        y: stepY
                    }
                    : {
                        x: stepX,
                        y: 0
                    };
            const steps = [
                {
                    x: stepX,
                    y: stepY
                },
                primaryStep,
                secondaryStep
            ];

            const nextStep = steps.find(step => {

                if (step.x === 0 && step.y === 0) {
                    return false;
                }

                return canPlayerMoveTo(
                    player.value.x + step.x,
                    player.value.y + step.y
                );
            });

            if (!nextStep) {
                player.value.moving = false;
                return false;
            }

            return movePlayer(
                nextStep.x,
                nextStep.y
            );
        }

        function canMonsterMoveTo(
            x,
            y,
            movingMonsterId,
            {
                ignorePlayer = false
            } = {}
        ) {

            if (
                x < 0 ||
                y < 0 ||
                x >= MAP_WIDTH ||
                y >= MAP_HEIGHT
            ) {
                return false;
            }

            const tile = gameMap[y][x];

            if (BLOCKED_TILES.includes(tile)) {
                return false;
            }

            if (
                !ignorePlayer &&
                x === player.value.x &&
                y === player.value.y
            ) {
                return false;
            }

            return !monsters.value.some(
                monster =>
                    monster.id !== movingMonsterId &&
                    monster.hp > 0 &&
                    monster.x === x &&
                    monster.y === y
            );
        }

        function getOrderedMonsterSteps(
            fromX,
            fromY,
            targetX,
            targetY
        ) {

            return [
                {
                    x: 1,
                    y: 0
                },
                {
                    x: -1,
                    y: 0
                },
                {
                    x: 0,
                    y: 1
                },
                {
                    x: 0,
                    y: -1
                }
            ].sort((left, right) => {

                const leftDistance =
                    getTileDistance(
                        fromX + left.x,
                        fromY + left.y,
                        targetX,
                        targetY
                    );
                const rightDistance =
                    getTileDistance(
                        fromX + right.x,
                        fromY + right.y,
                        targetX,
                        targetY
                    );

                return leftDistance - rightDistance;
            });
        }

        function moveMonsterByStep(monster, step) {

            if (!step) {
                return false;
            }

            monster.x += step.x;
            monster.y += step.y;
            monster.moving = true;
            stopMonsterMovementAnimation(monster);

            return true;
        }

        function findMonsterPathStep(
            monster,
            targetX,
            targetY,
            desiredDistance = 1
        ) {

            if (
                getTileDistance(
                    monster.x,
                    monster.y,
                    targetX,
                    targetY
                ) <= desiredDistance
            ) {
                return null;
            }

            const queue = [
                {
                    x: monster.x,
                    y: monster.y
                }
            ];
            const visited = new Set([
                createTileKey(monster.x, monster.y)
            ]);
            const parents = new Map();
            let destination = null;

            while (queue.length > 0) {
                const current = queue.shift();

                if (
                    !(
                        current.x === monster.x &&
                        current.y === monster.y
                    ) &&
                    getTileDistance(
                        current.x,
                        current.y,
                        targetX,
                        targetY
                    ) <= desiredDistance
                ) {
                    destination = current;
                    break;
                }

                getOrderedMonsterSteps(
                    current.x,
                    current.y,
                    targetX,
                    targetY
                ).forEach(step => {

                    const nextX = current.x + step.x;
                    const nextY = current.y + step.y;
                    const nextKey =
                        createTileKey(nextX, nextY);

                    if (
                        visited.has(nextKey) ||
                        !canMonsterMoveTo(
                            nextX,
                            nextY,
                            monster.id
                        )
                    ) {
                        return;
                    }

                    visited.add(nextKey);
                    parents.set(nextKey, current);
                    queue.push({
                        x: nextX,
                        y: nextY
                    });
                });
            }

            if (!destination) {
                return null;
            }

            let currentStep = destination;
            let parent =
                parents.get(
                    createTileKey(
                        destination.x,
                        destination.y
                    )
                );

            while (
                parent &&
                !(
                    parent.x === monster.x &&
                    parent.y === monster.y
                )
            ) {
                currentStep = parent;
                parent = parents.get(
                    createTileKey(
                        parent.x,
                        parent.y
                    )
                );
            }

            return {
                x: currentStep.x - monster.x,
                y: currentStep.y - monster.y
            };
        }

        function moveMonsterTowardsGoal(
            monster,
            targetX,
            targetY,
            desiredDistance = 1
        ) {

            const step = findMonsterPathStep(
                monster,
                targetX,
                targetY,
                desiredDistance
            );

            if (!step) {
                return false;
            }

            return moveMonsterByStep(monster, step);
        }

        function moveMonsterAwayFromPlayer(monster) {

            const currentDistance =
                getDistanceToPlayer(monster);
            const bestStep = [
                {
                    x: 1,
                    y: 0
                },
                {
                    x: -1,
                    y: 0
                },
                {
                    x: 0,
                    y: 1
                },
                {
                    x: 0,
                    y: -1
                }
            ]
                .filter(step =>
                    canMonsterMoveTo(
                        monster.x + step.x,
                        monster.y + step.y,
                        monster.id
                    )
                )
                .sort((left, right) => {

                    const leftDistance =
                        getTileDistance(
                            monster.x + left.x,
                            monster.y + left.y,
                            player.value.x,
                            player.value.y
                        );
                    const rightDistance =
                        getTileDistance(
                            monster.x + right.x,
                            monster.y + right.y,
                            player.value.x,
                            player.value.y
                        );

                    return rightDistance - leftDistance;
                })[0];

            if (!bestStep) {
                return false;
            }

            const nextDistance =
                getTileDistance(
                    monster.x + bestStep.x,
                    monster.y + bestStep.y,
                    player.value.x,
                    player.value.y
                );

            if (nextDistance <= currentDistance) {
                return false;
            }

            return moveMonsterByStep(monster, bestStep);
        }

        function moveMonsterToSpawn(monster) {

            if (getDistanceToSpawn(monster) === 0) {
                monster.returningHome = false;
                monster.moving = false;
                return false;
            }

            const moved =
                moveMonsterTowardsGoal(
                    monster,
                    monster.spawnX,
                    monster.spawnY,
                    0
                );

            if (!moved) {
                monster.returningHome = false;
            }

            return moved;
        }

        function engageMonster(monster) {

            if (!monster || monster.hp <= 0) {
                return;
            }

            monster.isAggro = true;
            monster.returningHome = false;
            monster.lastKnownPlayerX =
                player.value.x;
            monster.lastKnownPlayerY =
                player.value.y;

            monsters.value.forEach(otherMonster => {

                if (
                    otherMonster.id === monster.id ||
                    otherMonster.hp <= 0
                ) {
                    return;
                }

                const assistRange = Math.max(
                    0,
                    Number(otherMonster.assistRange) || 0
                );

                if (
                    getTileDistance(
                        otherMonster.x,
                        otherMonster.y,
                        monster.x,
                        monster.y
                    ) > assistRange
                ) {
                    return;
                }

                otherMonster.isAggro = true;
                otherMonster.returningHome = false;
                otherMonster.lastKnownPlayerX =
                    player.value.x;
                otherMonster.lastKnownPlayerY =
                    player.value.y;
            });
        }

        function attackPlayer(monster) {

            const now = Date.now();
            const attackCooldown =
                monster.attackCooldown || 1600;
            const lastAttackAt =
                monster.lastAttackAt || 0;

            if (now - lastAttackAt < attackCooldown) {
                return;
            }

            monster.lastAttackAt = now;
            playMonsterAttackAnimation(monster);

            if (monster.attackStyle === 'ranged') {
                createSkillEffect(
                    player.value.x,
                    player.value.y,
                    monster.projectileKind ||
                        'monster-ranged',
                    360
                );
            }

            const monsterAccuracy = Math.min(
                0.95,
                0.72 + (Number(monster.level) || 1) * 0.015
            );

            if (Math.random() > monsterAccuracy) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Miss',
                    'miss'
                );
                return;
            }

            if (
                Math.random() <
                getPlayerEvasionChance() / 100
            ) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Dodge',
                    'dodge'
                );
                return;
            }

            // Forca tambem funciona como armadura contra ataques de monstros.
            const baseDamage =
                monster.damage || monster.level * 4 || 5;
            const damage = Math.max(
                1,
                baseDamage - getPlayerArmor()
            );

            player.value.hp = Math.max(
                0,
                player.value.hp - damage
            );

            createFloatingText(
                player.value.x,
                player.value.y,
                `-${damage}`,
                'damage'
            );

            if (player.value.hp <= 0) {
                playerDeath();
            }
        }

        function clearRegenerationIntervals() {

            regenerationIntervals.forEach(interval => {
                clearInterval(interval);
            });
            regenerationIntervals.length = 0;
        }

        function playerDeath() {

            // Respawn simples: volta ao ponto inicial com recursos cheios.
            stopAutoCombat();
            clearRegenerationIntervals();
            pressedMovementKeys.clear();
            player.value.x = PLAYER_START_POSITION.x;
            player.value.y = PLAYER_START_POSITION.y;
            player.value.hp =
                player.value.maxHp || 100;
            player.value.mana =
                player.value.maxMana || 50;
            player.value.moving = false;
            player.value.direction = 'down';
            player.value.animationFrame = 0;

            monsters.value.forEach(monster => {
                monster.lastAttackAt = Date.now();
                monster.isAggro = false;
                monster.returningHome = true;
            });

            updateCamera();
            persistCharacter();
        }

        function startMonsterAI() {

            if (monsterAIInterval) {
                return;
            }

            monsterAIInterval = setInterval(() => {

                monsters.value.forEach(monster => {

                    if (monster.hp <= 0) {
                        return;
                    }

                    const distance =
                        getDistanceToPlayer(monster);
                    const agroRange =
                        monster.agroRange || 5;
                    const attackRange =
                        monster.attackRange || 1;
                    const leashRange = Math.max(
                        agroRange + 2,
                        monster.leashRange || 8
                    );
                    const preferredRange =
                        getMonsterPreferredRange(monster);
                    const inAgroRange =
                        distance <= agroRange;

                    if (inAgroRange) {
                        engageMonster(monster);
                    }

                    if (
                        monster.isAggro &&
                        (
                            distance > leashRange ||
                            getDistanceToSpawn(monster) >
                                leashRange
                        )
                    ) {
                        monster.isAggro = false;
                        monster.returningHome = true;
                    }

                    if (monster.returningHome) {
                        moveMonsterToSpawn(monster);
                        return;
                    }

                    if (!monster.isAggro) {
                        return;
                    }

                    if (
                        monster.attackStyle === 'ranged' &&
                        distance < preferredRange &&
                        moveMonsterAwayFromPlayer(monster)
                    ) {
                        return;
                    }

                    if (distance <= attackRange) {
                        attackPlayer(monster);
                        return;
                    }

                    moveMonsterTowardsGoal(
                        monster,
                        player.value.x,
                        player.value.y,
                        preferredRange
                    );
                });

            }, MONSTER_AI_INTERVAL);
        }

        async function basicAttack({
            respectCooldown = false
        } = {}) {

            if (playerAttackInProgress) {
                return false;
            }

            const now = Date.now();

            if (
                respectCooldown &&
                now - player.value.lastAttackAt <
                    getPlayerAttackCooldown()
            ) {
                return false;
            }

            playPlayerAttackAnimation();

            if (!selectedTarget.value) {
                return false;
            }

            engageMonster(selectedTarget.value);

            const distanceX = Math.abs(
                player.value.x - selectedTarget.value.x
            );

            const distanceY = Math.abs(
                player.value.y - selectedTarget.value.y
            );

            if (
                Math.max(distanceX, distanceY) >
                getBasicAttackRange()
            ) {

                console.log('Target muito longe.');
                createFloatingText(
                    selectedTarget.value.x,
                    selectedTarget.value.y,
                    'Fora',
                    'miss'
                );

                return false;
            }

            playerAttackInProgress = true;
            player.value.lastAttackAt = now;

            try {
                const result = await attackMonsterRequest(
                    player.value,
                    selectedTarget.value
                );

                if (result.outOfRange) {
                    createFloatingText(
                        selectedTarget.value.x,
                        selectedTarget.value.y,
                        'Fora',
                        'miss'
                    );
                    return false;
                }

                selectedTarget.value.hp =
                    result.monster.hp;

                createFloatingText(
                    selectedTarget.value.x,
                    selectedTarget.value.y,
                    result.dodged
                        ? 'Dodge'
                        : result.hit
                            ? `-${result.damage}${result.critical ? '!' : ''}`
                            : 'Miss',
                    result.dodged
                        ? 'dodge'
                        : result.critical
                            ? 'critical'
                            : result.hit
                                ? 'damage'
                                : 'miss'
                );

                console.log(
                    `Causaste ${result.damage} de dano`
                );

                if (result.killed) {

                    console.log(
                        `Mataste ${selectedTarget.value.name}`
                    );

                    grantMonsterLoot(selectedTarget.value);
                    player.value.xp += result.xpGained;

                    monsters.value =
                        monsters.value.filter(
                            m => m.id !== selectedTarget.value.id
                        );

                    selectedTarget.value = null;
                    stopAutoCombat();

                    checkLevelUp();
                    persistCharacter();
                }

                return true;
            } finally {
                playerAttackInProgress = false;
            }
        }

        function runAutoCombatStep() {

            clearTargetIfDead();

            if (!selectedTarget.value) {
                stopAutoCombat();
                return;
            }

            if (
                getDistanceToTarget(selectedTarget.value) >
                getBasicAttackRange()
            ) {
                movePlayerTowardsTarget(selectedTarget.value);
                return;
            }

            player.value.moving = false;
            basicAttack({
                respectCooldown: true
            });
        }

        function startAutoCombat() {

            if (!selectedTarget.value) {
                basicAttack();
                return;
            }

            runAutoCombatStep();

            if (autoCombatInterval) {
                return;
            }

            autoCombatInterval = setInterval(() => {
                runAutoCombatStep();
            }, AUTO_COMBAT_INTERVAL);
        }

        function checkLevelUp() {

            let xpRequired =
                getXpRequiredForNextLevel();
            let leveledUp = false;

            while (player.value.xp >= xpRequired) {
                player.value.level++;

                player.value.xp -= xpRequired;

                // A cada level o jogador ganha pontos para distribuir.
                player.value.attributePoints =
                    getAvailableAttributePoints() +
                    ATTRIBUTE_POINTS_PER_LEVEL;

                leveledUp = true;
                xpRequired = getXpRequiredForNextLevel();
            }

            if (leveledUp) {
                player.value.hp = player.value.maxHp;
                player.value.mana = player.value.maxMana;

                console.log('Subiste de level!');
                persistCharacter();
            }
        }

        function payAndStartSkill(skill) {

            if (!skill || isSkillCoolingDown(skill)) {
                return false;
            }

            if (!canPaySkillMana(skill)) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Sem MP',
                    'miss'
                );
                return false;
            }

            player.value.mana -= getSkillManaCost(skill);
            markSkillUsed(skill);
            playPlayerAttackAnimation();

            return true;
        }

        function getTargetForSkill(skill) {

            if (
                !selectedTarget.value ||
                selectedTarget.value.hp <= 0
            ) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Sem target',
                    'miss'
                );
                return null;
            }

            if (
                getDistanceToTarget(selectedTarget.value) >
                skill.range
            ) {
                createFloatingText(
                    selectedTarget.value.x,
                    selectedTarget.value.y,
                    'Fora',
                    'miss'
                );
                return null;
            }

            return selectedTarget.value;
        }

        function castFireball(skill) {

            const target = getTargetForSkill(skill);

            if (!target || !payAndStartSkill(skill)) {
                return;
            }

            const damage =
                18 +
                (Number(player.value.intelligence) || 0) * 2.7 +
                (Number(player.value.level) || 1) * 2;

            createSkillEffect(target.x, target.y, 'fireball');
            damageMonster(target, damage, {
                kind: 'magic',
                damageType: 'magical',
                xpMultiplier: 22
            });
            persistCharacter();
        }

        function castHeal(skill) {

            if (player.value.hp >= player.value.maxHp) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Cheio',
                    'heal'
                );
                return;
            }

            if (!payAndStartSkill(skill)) {
                return;
            }

            const healAmount =
                24 +
                (Number(player.value.intelligence) || 0) * 2.2 +
                (Number(player.value.level) || 1) * 2;

            createSkillEffect(player.value.x, player.value.y, 'heal');
            healPlayer(healAmount);
            persistCharacter();
        }

        function getDirectionVectorByFacing() {

            const vectors = {
                down: {
                    x: 0,
                    y: 1
                },
                up: {
                    x: 0,
                    y: -1
                },
                left: {
                    x: -1,
                    y: 0
                },
                right: {
                    x: 1,
                    y: 0
                }
            };

            return vectors[player.value.direction] || vectors.down;
        }

        function castDash(skill) {

            if (!payAndStartSkill(skill)) {
                return;
            }

            const direction = getDirectionVectorByFacing();
            let moved = false;

            createSkillEffect(player.value.x, player.value.y, 'dash');

            for (let step = 0; step < skill.range; step++) {
                const nextX =
                    player.value.x + direction.x;
                const nextY =
                    player.value.y + direction.y;

                if (!canPlayerMoveTo(nextX, nextY)) {
                    break;
                }

                player.value.x = nextX;
                player.value.y = nextY;
                moved = true;
            }

            if (!moved) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Bloq',
                    'miss'
                );
            }

            createSkillEffect(player.value.x, player.value.y, 'dash');
            updateCamera();
            persistCharacter();
        }

        function castPowerStrike(skill) {

            const target = getTargetForSkill(skill);

            if (!target || !payAndStartSkill(skill)) {
                return;
            }

            const damage =
                22 +
                (Number(player.value.strength) || 0) * 3.2 +
                (Number(player.value.level) || 1) * 2;

            createSkillEffect(target.x, target.y, 'power-strike');
            damageMonster(target, damage, {
                kind: 'critical',
                damageType: 'physical',
                xpMultiplier: 24
            });
            persistCharacter();
        }

        function castRegeneration(skill) {

            if (!payAndStartSkill(skill)) {
                return;
            }

            let ticks = 0;
            const healPerTick =
                7 +
                Math.floor(
                    (Number(player.value.intelligence) || 0) * 0.8
                );

            createSkillEffect(
                player.value.x,
                player.value.y,
                'regeneration'
            );

            const interval = setInterval(() => {
                ticks++;
                createSkillEffect(
                    player.value.x,
                    player.value.y,
                    'regeneration',
                    420
                );
                healPlayer(healPerTick, 'regeneration');
                persistCharacter();

                if (ticks >= 5 || player.value.hp <= 0) {
                    clearInterval(interval);
                    const index =
                        regenerationIntervals.indexOf(interval);

                    if (index !== -1) {
                        regenerationIntervals.splice(index, 1);
                    }
                }
            }, 1000);

            regenerationIntervals.push(interval);
            persistCharacter();
        }

        function castUltimate(skill) {

            const origin =
                selectedTarget.value &&
                selectedTarget.value.hp > 0 &&
                getDistanceToTarget(selectedTarget.value) <= skill.range
                    ? selectedTarget.value
                    : player.value;

            if (!payAndStartSkill(skill)) {
                return;
            }

            const damage =
                42 +
                (Number(player.value.strength) || 0) * 1.2 +
                (Number(player.value.intelligence) || 0) * 2.4 +
                (Number(player.value.dexterity) || 0) * 1.2 +
                (Number(player.value.level) || 1) * 4;

            createSkillEffect(origin.x, origin.y, 'ultimate', 820);

            monsters.value
                .filter(monster => monster.hp > 0)
                .filter(monster =>
                    Math.max(
                        Math.abs(monster.x - origin.x),
                        Math.abs(monster.y - origin.y)
                    ) <= skill.radius
                )
                .forEach(monster => {
                    damageMonster(monster, damage, {
                        kind: 'critical',
                        damageType: 'magical',
                        ignoreMitigation: true,
                        xpMultiplier: 28
                    });
                });

            persistCharacter();
        }

        function useSkill(key) {

            const skill = getSkillByKey(key);

            if (!skill) {
                return;
            }

            if (skill.id === 'basicAttack') {
                startAutoCombat();
                return;
            }

            const actions = {
                fireball: castFireball,
                heal: castHeal,
                dash: castDash,
                powerStrike: castPowerStrike,
                regeneration: castRegeneration,
                ultimate: castUltimate
            };

            const action = actions[skill.id];

            if (action) {
                action(skill);
            }
        }

        function handleKeyDown(event) {

            const key = event.key.toLowerCase();
            const code = event.code.toLowerCase();
            const movementKeyByCode = {
                keyw: 'w',
                keys: 's',
                keya: 'a',
                keyd: 'd'
            };
            const movementKey =
                ['w', 's', 'a', 'd'].includes(key)
                    ? key
                    : movementKeyByCode[code];

            if (movementKey) {
                const wasPressed =
                    pressedMovementKeys.has(movementKey);
                pressedMovementKeys.add(movementKey);
                stopAutoCombat();
                if (!wasPressed) {
                    movePlayerFromPressedKeys();
                }
                event.preventDefault();
                return;
            }

            if (
                key === ' ' ||
                key === 'space' ||
                code === 'space'
            ) {
                event.preventDefault();
                startAutoCombat();
                return;
            }

            if (
                ['1', '2', '3', '4', '5', 'q', 'e', 'r', 'f']
                    .includes(key)
            ) {
                useSkill(key);
            }
        }

        function handleKeyUp(event) {

            const key = event.key.toLowerCase();
            const code = event.code.toLowerCase();
            const movementKeyByCode = {
                keyw: 'w',
                keys: 's',
                keya: 'a',
                keyd: 'd'
            };
            const movementKey =
                ['w', 's', 'a', 'd'].includes(key)
                    ? key
                    : movementKeyByCode[code];

            if (!movementKey) {
                return;
            }

            pressedMovementKeys.delete(movementKey);

            if (pressedMovementKeys.size === 0) {
                player.value.moving = false;
            }
        }

        function handleWindowBlur() {
            pressedMovementKeys.clear();
            player.value.moving = false;
        }

        onMounted(async () => {

            window.addEventListener(
                'keydown',
                handleKeyDown
            );
            window.addEventListener(
                'keyup',
                handleKeyUp
            );
            window.addEventListener(
                'blur',
                handleWindowBlur
            );

            const character =
                await getCharacter(props.characterId);

            player.value = {
                ...player.value,
                ...character,
                maxHp: character.maxHp || character.hp || 100,
                maxMana: character.maxMana || character.mana || 50,
                attributePoints: character.attributePoints || 0,
                direction: 'down',
                moving: false,
                attacking: false,
                animationFrame: 0
            };

            const zoneMonsters =
                await getMonsters(
                    player.value.currentZone
                );

            monsters.value = zoneMonsters.map(monster => ({
                ...monster,
                maxHp: monster.maxHp || monster.hp,
                agroRange: monster.agroRange || 5,
                attackRange: monster.attackRange || 1,
                attackCooldown:
                    monster.attackCooldown || 1600,
                attackStyle:
                    monster.attackStyle ||
                    (
                        (monster.attackRange || 1) > 1
                            ? 'ranged'
                            : 'melee'
                    ),
                preferredRange: Math.max(
                    1,
                    monster.preferredRange ||
                        Math.max(
                            1,
                            (monster.attackRange || 1) - 1
                        )
                ),
                assistRange: monster.assistRange || 2,
                leashRange:
                    monster.leashRange ||
                    (monster.agroRange || 5) + 3,
                projectileKind:
                    monster.projectileKind ||
                    'monster-ranged',
                lootGoldMin: monster.lootGoldMin || 0,
                lootGoldMax: monster.lootGoldMax || 0,
                lootItemName: monster.lootItemName || '',
                lootItemChance:
                    Number(monster.lootItemChance) || 0,
                spawnX: monster.spawnX ?? monster.x,
                spawnY: monster.spawnY ?? monster.y,
                lastAttackAt: monster.lastAttackAt || 0,
                isAggro: false,
                returningHome: false,
                moving: false,
                attacking: false,
                animationFrame: 0
            }));

            startAnimationLoop();
            startCombatClock();
            startPlayerMovementLoop();

            startMonsterAI();

            updateCamera();
        });

        onUnmounted(() => {

            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
            window.removeEventListener(
                'keyup',
                handleKeyUp
            );
            window.removeEventListener(
                'blur',
                handleWindowBlur
            );

            if (animationInterval) {
                clearInterval(animationInterval);
            }

            if (monsterAIInterval) {
                clearInterval(monsterAIInterval);
            }

            if (playerMovementInterval) {
                clearInterval(playerMovementInterval);
            }

            if (autoCombatInterval) {
                clearInterval(autoCombatInterval);
            }

            if (combatClockInterval) {
                clearInterval(combatClockInterval);
            }

            if (playerAttackTimeout) {
                clearTimeout(playerAttackTimeout);
            }

            clearRegenerationIntervals();

            monsters.value.forEach(monster => {

                if (monster.movementStopTimeout) {
                    clearTimeout(monster.movementStopTimeout);
                }

                if (monster.attackAnimationTimeout) {
                    clearTimeout(monster.attackAnimationTimeout);
                }
            });
        });

        return {

            tileSize,

            gameMap,

            player,

            monsters,

            selectedTarget,

            floatingTexts,

            lootLog,

            skillEffects,

            camera,

            tileImages,

            skillBar,

            hpBar,
            mpBar,
            xpBar,

            skillSlot,

            getPlayerSprite,
            getMonsterSprite,
            getAvailableAttributePoints,
            getWeaponLabel,
            getDamageTypeLabel,
            getBasicAttackRange,
            getPlayerArmor,
            getPlayerCriticalChance,
            getPlayerAccuracy,
            getPlayerEvasionChance,
            getPlayerMagicDamage,
            getSkillCooldownReduction,
            getPlayerAttackCooldown,
            getPlayerHpPercent,
            getPlayerManaPercent,
            getPlayerXpPercent,
            getXpRequiredForNextLevel,
            getBasicAttackDamagePreview,
            isSkillCoolingDown,
            getSkillCooldownPercent,
            getSkillCooldownText,
            getSkillManaCost,
            canPaySkillMana,
            getDistanceToTarget,
            spendAttributePoint,
            useSkill,

            selectTarget
        };
    }
};

