
import {
    computed,
    ref,
    onMounted,
    onUnmounted
} from 'vue';

import {
    getCharacter,
    saveCharacter
} from '../../services/characterService';
import { attackMonster as attackMonsterRequest } from '../../services/combatService';
import {
    bossSprites,
    effectAssets,
    itemAssets,
    minimapAssets,
    monsterSprites,
    npcAssets,
    playerSprites,
    portalAssets,
    questAssets,
    rarityFrames,
    tileImages,
    uiAssets
} from '../../data/gameAssets';
import { createBoss } from '../../data/bosses';
import {
    ITEM_DEFINITIONS,
    STARTER_INVENTORY
} from '../../data/items';
import {
    BLOCKED_TILES,
    getZoneKeyByName,
    ZONES
} from '../../data/maps';
import { createMonster } from '../../data/monsters';
import { createNpc } from '../../data/npcs';
import { createQuestState } from '../../data/quests';
import { SKILL_DEFINITIONS } from '../../data/skills';

const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const PLAYER_START_POSITION = {
    x: 5,
    y: 5
};
const PLAYER_MOVE_INTERVAL = 240;
const PLAYER_ATTACK_COOLDOWN = 900;
const MIN_PLAYER_ATTACK_COOLDOWN = 450;
const AUTO_COMBAT_INTERVAL = 180;
const ATTRIBUTE_POINTS_PER_LEVEL = 3;
const COMBAT_CLOCK_INTERVAL = 80;
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

        const currentZoneKey = ref('goblinForest');
        const activeZone = computed(
            () => ZONES[currentZoneKey.value] || ZONES.goblinForest
        );
        const gameMap = computed(() => activeZone.value.map);
        const npcs = ref([]);
        const portals = ref([]);
        const quests = ref(createQuestState());
        const inventory = ref(
            STARTER_INVENTORY.map(item => ({
                ...item
            }))
        );
        const gold = ref(25);
        const activeNpc = ref(null);
        const zoneBanner = ref(null);

        const skillBar = SKILL_DEFINITIONS;
        const skillCooldowns = ref(
            SKILL_DEFINITIONS.reduce((cooldowns, skill) => {
                cooldowns[skill.id] = 0;
                return cooldowns;
            }, {})
        );

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
                (monster.isBoss
                    ? bossSprites[spriteKey]
                    : monsterSprites[spriteKey]) ||
                monsterSprites.goblin;

            if (monster.dead) {
                return sprites.dead || sprites.idle;
            }

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

        function getMapWidth() {

            return gameMap.value[0]?.length || MAP_WIDTH;
        }

        function getMapHeight() {

            return gameMap.value.length || MAP_HEIGHT;
        }

        function getZoneName() {

            return activeZone.value.name;
        }

        function loadZoneEntities(zoneKey) {

            const zone = ZONES[zoneKey] || ZONES.goblinForest;

            currentZoneKey.value = zone.key;
            portals.value = zone.portals || [];
            npcs.value = (zone.npcs || []).map(npc =>
                createNpc(npc.type, npc.x, npc.y)
            );

            const zoneMonsters = (zone.monsters || []).map(
                (monster, index) =>
                    createMonster(
                        monster.type,
                        monster.x,
                        monster.y,
                        `${zone.key}-${index}`
                    )
            );

            if (zone.boss) {
                zoneMonsters.push(
                    createBoss(
                        zone.boss.type,
                        zone.boss.x,
                        zone.boss.y
                    )
                );
            }

            monsters.value = zoneMonsters;
        }

        function transitionToZone(zoneKey) {

            const zone = ZONES[zoneKey];

            if (!zone) {
                return;
            }

            // Troca de zona centralizada para manter mapa, entidades e HUD em sincronia.
            stopAutoCombat();
            selectedTarget.value = null;
            loadZoneEntities(zoneKey);

            player.value.x = zone.playerStart.x;
            player.value.y = zone.playerStart.y;
            player.value.currentZone = zone.name;
            player.value.moving = false;

            zoneBanner.value = {
                name: zone.name,
                theme: zone.theme,
                image: zone.assets?.banner
            };

            updateQuestProgress('explore', zone.key);
            updateCamera();
            persistCharacter();

            setTimeout(() => {
                zoneBanner.value = null;
            }, 1200);
        }

        function checkPortalCollision() {

            const portal = portals.value.find(
                item =>
                    item.x === player.value.x &&
                    item.y === player.value.y
            );

            if (portal) {
                transitionToZone(portal.to);
            }
        }

        function interactNpc(npc) {

            activeNpc.value = npc;

            if (npc.type === 'healer') {
                player.value.hp = player.value.maxHp;
                player.value.mana = player.value.maxMana;
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    '+Full',
                    'heal'
                );
                persistCharacter();
            }

            updateQuestProgress('talk', npc.type);
        }

        function closeNpcDialog() {

            activeNpc.value = null;
        }

        function updateQuestProgress(objectiveType, targetType, amount = 1) {

            quests.value = quests.value.map(quest => {

                if (
                    quest.objectiveType !== objectiveType ||
                    !quest.targetTypes.includes(targetType) ||
                    quest.status === 'complete'
                ) {
                    return quest;
                }

                const progress = Math.min(
                    quest.required,
                    quest.progress + amount
                );

                return {
                    ...quest,
                    progress,
                    status:
                        progress >= quest.required
                            ? 'complete'
                            : 'inProgress'
                };
            });
        }

        function getVisibleQuests() {

            return quests.value.filter(
                quest =>
                    quest.zone === currentZoneKey.value ||
                    quest.status !== 'available'
            );
        }

        function getQuestStatusLabel(status) {

            const labels = {
                available: 'Disponivel',
                inProgress: 'Em progresso',
                complete: 'Completa'
            };

            return labels[status] || status;
        }

        function getQuestIcon(quest) {

            if (quest.status === 'complete') {
                return questAssets.completed;
            }

            if (quest.status === 'inProgress') {
                return questAssets.inProgress;
            }

            return questAssets.available;
        }

        function addItem(itemId, quantity = 1) {

            const definition = ITEM_DEFINITIONS[itemId];

            if (!definition) {
                return;
            }

            if (itemId === 'goldCoin') {
                gold.value += quantity;
                return;
            }

            const existingItem = inventory.value.find(
                item => item.id === itemId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
                return;
            }

            inventory.value.push({
                id: itemId,
                quantity
            });

            if (itemId === 'demonKey') {
                updateQuestProgress('collect', 'demonKey');
            }
        }

        function addDrops(monster) {

            const drops = monster.drops || [];

            if (monster.gold) {
                addItem('goldCoin', monster.gold);
            }

            drops.forEach(itemId => {
                const chance = itemId === 'goldCoin'
                    ? 1
                    : monster.isBoss
                        ? 0.85
                        : 0.35;

                if (Math.random() <= chance) {
                    addItem(itemId);
                }
            });
        }

        function getInventoryItem(item) {

            return ITEM_DEFINITIONS[item.id] || {};
        }

        function getItemIcon(item) {

            return getInventoryItem(item).icon || itemAssets.goldCoin;
        }

        function getItemFrame(item) {

            const definition = getInventoryItem(item);

            return rarityFrames[definition.rarity] || rarityFrames.common;
        }

        function getItemTooltip(item) {

            const definition = getInventoryItem(item);

            return `${definition.name || item.id} - ${definition.rarity || 'common'} - ${definition.type || 'item'}`;
        }

        function getMinimapStyle(entity) {

            return {
                left: `${(entity.x / getMapWidth()) * 100}%`,
                top: `${(entity.y / getMapHeight()) * 100}%`
            };
        }

        function getBosses() {

            return monsters.value.filter(
                monster => monster.isBoss && !monster.dead
            );
        }

        function getSkillEffectImage(effect) {

            const map = {
                fireball: 'fire',
                heal: 'heal',
                regeneration: 'heal',
                dash: 'shadow',
                'power-shot': 'critical',
                'power-strike': 'critical',
                curse: 'shadow',
                ultimate: 'holy',
                death: 'death'
            };

            return effectAssets[map[effect.kind] || effect.kind];
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

            if (skill.id === 'slash') {
                return getPlayerAttackCooldown();
            }

            return Math.max(
                800,
                skill.cooldown *
                    (1 - getSkillCooldownReduction() / 100)
            );
        }

        function getSkillLastUsedAt(skill) {

            if (skill.id === 'slash') {
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

            if (skill.id === 'slash') {
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
                x >= getMapWidth() ||
                y >= getMapHeight()
            ) {
                return false;
            }

            const tile = gameMap.value[y]?.[x];

            if (BLOCKED_TILES.includes(tile)) {
                return false;
            }

            if (
                npcs.value.some(
                    npc =>
                        npc.x === x &&
                        npc.y === y
                )
            ) {
                return false;
            }

            return !monsters.value.some(
                monster =>
                    !monster.dead &&
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

            checkPortalCollision();
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

            if (monster.hp > 0 || monster.dead) {
                return false;
            }

            monster.dead = true;
            monster.moving = false;
            monster.attacking = false;

            player.value.xp +=
                monster.xp ||
                (Number(monster.level) || 1) * xpMultiplier;
            addDrops(monster);
            updateQuestProgress('kill', monster.typeKey);
            createSkillEffect(monster.x, monster.y, 'death', 560);

            if (
                selectedTarget.value &&
                selectedTarget.value.id === monster.id
            ) {
                stopAutoCombat();
            }

            setTimeout(() => {
                monsters.value =
                    monsters.value.filter(
                        item => item.id !== monster.id
                    );

                if (
                    selectedTarget.value &&
                    selectedTarget.value.id === monster.id
                ) {
                    selectedTarget.value = null;
                }
            }, 560);

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

        function getDistanceToPlayer(monster) {

            const distanceX = Math.abs(
                player.value.x - monster.x
            );

            const distanceY = Math.abs(
                player.value.y - monster.y
            );

            return Math.max(distanceX, distanceY);
        }

        function getDistanceToTarget(target) {

            if (!target) {
                return Infinity;
            }

            return Math.max(
                Math.abs(player.value.x - target.x),
                Math.abs(player.value.y - target.y)
            );
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

        function canMonsterMoveTo(x, y) {

            if (
                x < 0 ||
                y < 0 ||
                x >= getMapWidth() ||
                y >= getMapHeight()
            ) {
                return false;
            }

            const tile = gameMap.value[y]?.[x];

            if (BLOCKED_TILES.includes(tile)) {
                return false;
            }

            if (
                x === player.value.x &&
                y === player.value.y
            ) {
                return false;
            }

            if (
                npcs.value.some(
                    npc =>
                        npc.x === x &&
                        npc.y === y
                )
            ) {
                return false;
            }

            return !monsters.value.some(
                monster =>
                    !monster.dead &&
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

                    selectedTarget.value.xp =
                        result.xpGained || selectedTarget.value.xp;
                    removeMonsterIfDead(selectedTarget.value);
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

        function castShadowStep(skill) {

            castDash(skill);
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

        function castPowerShot(skill) {

            const target = getTargetForSkill(skill);

            if (!target || !payAndStartSkill(skill)) {
                return;
            }

            const damage =
                20 +
                (Number(player.value.dexterity) || 0) * 3 +
                (Number(player.value.level) || 1) * 2;

            createSkillEffect(target.x, target.y, 'power-shot');
            damageMonster(target, damage, {
                kind: 'critical',
                damageType: 'physical',
                xpMultiplier: 24
            });
            persistCharacter();
        }

        function castCurse(skill) {

            const target = getTargetForSkill(skill);

            if (!target || !payAndStartSkill(skill)) {
                return;
            }

            const damage =
                16 +
                (Number(player.value.intelligence) || 0) * 2.4 +
                (Number(player.value.level) || 1) * 2;

            target.damage = Math.max(
                1,
                Math.floor((target.damage || 1) * 0.85)
            );

            createSkillEffect(target.x, target.y, 'curse');
            damageMonster(target, damage, {
                kind: 'magic',
                damageType: 'magical',
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

            if (skill.id === 'slash') {
                startAutoCombat();
                return;
            }

            const actions = {
                fireball: castFireball,
                heal: castHeal,
                shadowStep: castShadowStep,
                powerShot: castPowerShot,
                curse: castCurse,
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

            loadZoneEntities(
                getZoneKeyByName(player.value.currentZone)
            );

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
            currentZoneKey,
            activeZone,
            getZoneName,

            player,

            monsters,
            npcs,
            portals,
            quests,
            inventory,
            gold,
            activeNpc,
            zoneBanner,

            selectedTarget,

            floatingTexts,

            skillEffects,

            camera,

            tileImages,
            uiAssets,
            minimapAssets,
            portalAssets,
            npcAssets,
            effectAssets,

            skillBar,

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
            getVisibleQuests,
            getQuestStatusLabel,
            getQuestIcon,
            getInventoryItem,
            getItemIcon,
            getItemFrame,
            getItemTooltip,
            getMinimapStyle,
            getBosses,
            getSkillEffectImage,
            interactNpc,
            closeNpcDialog,
            spendAttributePoint,
            useSkill,

            selectTarget
        };
    }
};

