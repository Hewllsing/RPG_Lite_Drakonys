
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

    setup() {

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
            strength: 5,
            intelligence: 5,
            dexterity: 5,
            direction: 'down',
            moving: false,
            attacking: false,
            animationFrame: 0
        });

        const monsters = ref([]);

        const selectedTarget = ref(null);

        const floatingTexts = ref([]);

        let animationInterval = null;
        let monsterAIInterval = null;
        let playerAttackTimeout = null;

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

        const skillBar = [

            {
                key: '1',
                icon: skillAttack,
                name: 'Ataque'
            },

            {
                key: '2',
                icon: skillFireball,
                name: 'Fireball'
            },

            {
                key: '3',
                icon: skillHeal,
                name: 'Heal'
            },

            {
                key: 'Q',
                icon: skillDash,
                name: 'Dash'
            }
        ];

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

            saveCharacter(player.value).catch(() => {
                console.log('Nao foi possivel guardar o personagem.');
            });
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

        function movePlayer(dx, dy) {

            player.value.moving = true;

            if (dx === 1) {
                player.value.direction = 'right';
            }

            if (dx === -1) {
                player.value.direction = 'left';
            }

            if (dy === 1) {
                player.value.direction = 'down';
            }

            if (dy === -1) {
                player.value.direction = 'up';
            }

            const newX = player.value.x + dx;
            const newY = player.value.y + dy;

            if (
                newX < 0 ||
                newY < 0 ||
                newX >= MAP_WIDTH ||
                newY >= MAP_HEIGHT
            ) {
                return;
            }

            const tile = gameMap[newY][newX];

            if (BLOCKED_TILES.includes(tile)) {
                return;
            }

            if (
                monsters.value.some(
                    monster =>
                        monster.x === newX &&
                        monster.y === newY
                )
            ) {
                return;
            }

            player.value.x = newX;
            player.value.y = newY;

            updateCamera();
            persistCharacter();
        }

        function selectTarget(monster) {
            selectedTarget.value = monster;
        }

        function createFloatingText(x, y, text) {

            const id =
                `${Date.now()}-${Math.random()}`;

            floatingTexts.value.push({
                id,
                x,
                y,
                text
            });

            setTimeout(() => {

                floatingTexts.value =
                    floatingTexts.value.filter(
                        t => t.id !== id
                    );

            }, 1000);
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

        function getDistanceToPlayer(monster) {

            const distanceX = Math.abs(
                player.value.x - monster.x
            );

            const distanceY = Math.abs(
                player.value.y - monster.y
            );

            return Math.max(distanceX, distanceY);
        }

        function canMonsterMoveTo(x, y) {

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
                x === player.value.x &&
                y === player.value.y
            ) {
                return false;
            }

            return !monsters.value.some(
                monster =>
                    monster.x === x &&
                    monster.y === y
            );
        }

        function moveMonsterTowardsPlayer(monster) {

            const deltaX = player.value.x - monster.x;
            const deltaY = player.value.y - monster.y;

            const horizontalStep = {
                x: deltaX === 0
                    ? 0
                    : deltaX > 0
                        ? 1
                        : -1,
                y: 0
            };

            const verticalStep = {
                x: 0,
                y: deltaY === 0
                    ? 0
                    : deltaY > 0
                        ? 1
                        : -1
            };

            const steps =
                Math.abs(deltaX) >= Math.abs(deltaY)
                    ? [
                        horizontalStep,
                        verticalStep
                    ]
                    : [
                        verticalStep,
                        horizontalStep
                    ];

            const nextStep = steps.find(step => {

                if (step.x === 0 && step.y === 0) {
                    return false;
                }

                return canMonsterMoveTo(
                    monster.x + step.x,
                    monster.y + step.y
                );
            });

            if (!nextStep) {
                return;
            }

            monster.x += nextStep.x;
            monster.y += nextStep.y;
            monster.moving = true;

            stopMonsterMovementAnimation(monster);
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

            const damage =
                monster.damage || monster.level * 4 || 5;

            player.value.hp = Math.max(
                0,
                player.value.hp - damage
            );

            createFloatingText(
                player.value.x,
                player.value.y,
                `-${damage}`
            );

            if (player.value.hp <= 0) {
                playerDeath();
            }
        }

        function playerDeath() {

            // Respawn simples: volta ao ponto inicial com recursos cheios.
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

                    // O monstro so reage quando o player entra no raio de agro.
                    if (distance > agroRange) {
                        return;
                    }

                    if (distance <= attackRange) {
                        attackPlayer(monster);
                        return;
                    }

                    moveMonsterTowardsPlayer(monster);
                });

            }, 600);
        }

        async function basicAttack() {

            playPlayerAttackAnimation();

            if (!selectedTarget.value) return;

            const distanceX = Math.abs(
                player.value.x - selectedTarget.value.x
            );

            const distanceY = Math.abs(
                player.value.y - selectedTarget.value.y
            );

            if (distanceX > 1 || distanceY > 1) {

                console.log('Target muito longe.');

                return;
            }

            const result = await attackMonsterRequest(
                player.value,
                selectedTarget.value
            );

            selectedTarget.value.hp =
                result.monster.hp;

            createFloatingText(
                selectedTarget.value.x,
                selectedTarget.value.y,
                `-${result.damage}`
            );

            console.log(
                `Causaste ${result.damage} de dano`
            );

            if (result.killed) {

                console.log(
                    `Mataste ${selectedTarget.value.name}`
                );

                player.value.xp += result.xpGained;

                monsters.value =
                    monsters.value.filter(
                        m => m.id !== selectedTarget.value.id
                    );

                selectedTarget.value = null;

                checkLevelUp();
                persistCharacter();
            }
        }

        function checkLevelUp() {

            const xpRequired =
                player.value.level * 100;

            if (player.value.xp >= xpRequired) {

                player.value.level++;

                player.value.xp = 0;

                player.value.maxHp += 10;
                player.value.hp = player.value.maxHp;

                player.value.maxMana += 5;
                player.value.mana = player.value.maxMana;

                console.log('Subiste de level!');
                persistCharacter();
            }
        }

        function useSkill(key) {
            console.log(
                `Usaste a skill da tecla: ${key}`
            );
        }

        let playerStopTimeout = null;

        function handleKeyDown(event) {

            const key = event.key.toLowerCase();

            if (key === 'w') movePlayer(0, -1);
            if (key === 's') movePlayer(0, 1);
            if (key === 'a') movePlayer(-1, 0);
            if (key === 'd') movePlayer(1, 0);

            if (key === ' ') {
                basicAttack();
            }

            if (
                ['1', '2', '3', '4', '5', 'q', 'e', 'r', 'f']
                    .includes(key)
            ) {
                useSkill(key);
            }

            clearTimeout(playerStopTimeout);

            playerStopTimeout = setTimeout(() => {

                player.value.moving = false;

            }, 120);
        }

        onMounted(async () => {

            window.addEventListener(
                'keydown',
                handleKeyDown
            );

            const character =
                await getCharacter();

            player.value = {
                ...player.value,
                ...character,
                maxHp: character.maxHp || character.hp || 100,
                maxMana: character.maxMana || character.mana || 50,
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
                lastAttackAt: monster.lastAttackAt || 0,
                moving: false,
                attacking: false,
                animationFrame: 0
            }));

            startAnimationLoop();

            startMonsterAI();

            updateCamera();
        });

        onUnmounted(() => {

            window.removeEventListener(
                'keydown',
                handleKeyDown
            );

            if (animationInterval) {
                clearInterval(animationInterval);
            }

            if (monsterAIInterval) {
                clearInterval(monsterAIInterval);
            }

            if (playerAttackTimeout) {
                clearTimeout(playerAttackTimeout);
            }

            if (playerStopTimeout) {
                clearTimeout(playerStopTimeout);
            }

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

            camera,

            tileImages,

            skillBar,

            hpBar,
            mpBar,
            xpBar,

            skillSlot,

            getPlayerSprite,
            getMonsterSprite,

            selectTarget
        };
    }
};

