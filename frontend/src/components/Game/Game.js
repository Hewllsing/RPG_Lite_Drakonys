
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
const TILE_SIZE = 52;
const VIEWPORT_WIDTH = 1040;
const VIEWPORT_HEIGHT = 720;
const PLAYER_START_ZONE = 'starterTown';
const PLAYER_START_POSITION = {
    x: 9,
    y: 8
};
const PLAYER_MOVE_INTERVAL = 380;
const PLAYER_ATTACK_COOLDOWN = 900;
const MIN_PLAYER_ATTACK_COOLDOWN = 550;
const AUTO_COMBAT_INTERVAL = 180;
const ATTRIBUTE_POINTS_PER_LEVEL = 3;
const COMBAT_CLOCK_INTERVAL = 80;
const AFK_FARM_DELAY = 30000;
const AFK_FARM_CHECK_INTERVAL = 1000;
const QUEST_COMPLETE_DISPLAY_TIME = 4200;
const PLAYER_RESPAWN_DELAY = 3000;
const RESOURCE_REGEN_INTERVAL = 1000;
const OUT_OF_COMBAT_DELAY = 5000;
const OUT_OF_COMBAT_REGEN_MULTIPLIER = 3;
const MONSTER_RESPAWN_DELAY = 10000;
const INVENTORY_SLOT_LIMIT = 30;
const STORAGE_SLOT_LIMIT = 90;
const DAILY_QUEST_BONUS_LIMIT = 10;
const DAILY_QUEST_LIMIT = 30;
const DAILY_QUEST_STORAGE_KEY = 'rpg_lite_daily_quests';
const WEAPON_PROFILES = {
    warrior: {
        weaponType: 'sword',
        weaponLabel: 'Espada',
        damageType: 'physical',
        damageLabel: 'Fisico',
        range: 1,
        baseDamage: 8,
        primaryAttribute: 'strength',
        primaryScale: 2.6,
        secondaryAttribute: 'dexterity',
        secondaryScale: 0.25,
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
        primaryScale: 1.25,
        secondaryAttribute: 'strength',
        secondaryScale: 1,
        accuracyBonus: 5,
        criticalBonus: 2
    }
};
const ATTRIBUTE_GAIN_BY_POINT = {
    strength: {
        maxHp: 10
    },
    intelligence: {
        maxMana: 8
    },
    dexterity: {}
};
const BASE_ATTRIBUTES_BY_CLASS = {
    warrior: {
        strength: 8,
        intelligence: 3,
        dexterity: 5
    },
    mage: {
        strength: 3,
        intelligence: 9,
        dexterity: 4
    },
    archer: {
        strength: 5,
        intelligence: 4,
        dexterity: 9
    }
};

function getDailyQuestDateKey() {

    return new Date().toISOString().slice(0, 10);
}

function loadDailyQuestState() {

    const fallback = {
        date: getDailyQuestDateKey(),
        completed: 0
    };

    if (typeof localStorage === 'undefined') {
        return fallback;
    }

    try {
        const stored = JSON.parse(
            localStorage.getItem(DAILY_QUEST_STORAGE_KEY)
        );

        if (stored?.date === fallback.date) {
            return {
                ...fallback,
                completed: Number(stored.completed) || 0
            };
        }
    } catch (error) {
        console.log('Nao foi possivel ler as quests diarias.');
    }

    localStorage.setItem(
        DAILY_QUEST_STORAGE_KEY,
        JSON.stringify(fallback)
    );

    return fallback;
}

export default {

    props: {
        characterId: {
            type: Number,
            required: true
        }
    },

    setup(props) {

        const tileSize = TILE_SIZE;

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
            currentZone: 'Initial City',
            strength: 5,
            intelligence: 5,
            dexterity: 5,
            attributePoints: 0,
            direction: 'down',
            moving: false,
            attacking: false,
            animationFrame: 0,
            lastAttackAt: 0,
            lastCombatAt: 0
        });

        const monsters = ref([]);

        const selectedTarget = ref(null);
        const afkFarmEnabled = ref(false);
        const lastPlayerActivityAt = ref(Date.now());

        const floatingTexts = ref([]);
        const skillEffects = ref([]);
        const combatClock = ref(Date.now());
        const questNotification = ref(null);
        const levelUpEffect = ref(null);
        const deathScreen = ref(null);
        const expandedMapOpen = ref(false);
        const selectedGlobalZoneKey = ref('starterTown');
        const gameViewportRef = ref(null);
        const viewportSize = ref({
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT
        });
        const dailyQuestState = ref(loadDailyQuestState());
        const merchantOpen = ref(false);
        const storageOpen = ref(false);
        const storageItems = ref([]);

        let animationInterval = null;
        let monsterAIInterval = null;
        let playerMovementInterval = null;
        let autoCombatInterval = null;
        let combatClockInterval = null;
        let afkFarmInterval = null;
        let resourceRegenInterval = null;
        let playerAttackTimeout = null;
        let playerAttackInProgress = false;
        let lastPlayerMoveAt = 0;
        let clickMovePath = [];
        let questNotificationTimeout = null;
        let playerDeathTimeout = null;
        let gameStartedAt = Date.now();
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
                id: item.id || item.itemId,
                quantity: item.quantity
            }))
        );
        const gold = ref(25);
        const activeNpc = ref(null);
        const npcResponse = ref(null);
        const zoneBanner = ref(null);
        let npcResponseTimeout = null;

        const skillBar = SKILL_DEFINITIONS;
        const skillCooldowns = ref(
            SKILL_DEFINITIONS.reduce((cooldowns, skill) => {
                cooldowns[skill.id] = 0;
                return cooldowns;
            }, {})
        );

        const afkFarmCooldownRemaining = computed(() => {
            if (afkFarmEnabled.value) {
                return 0;
            }

            return Math.max(
                0,
                Math.ceil(
                    (
                        AFK_FARM_DELAY -
                        (combatClock.value - lastPlayerActivityAt.value)
                    ) / 1000
                )
            );
        });

        function getAfkFarmStatusLabel() {

            if (afkFarmEnabled.value) {
                return 'AFK FARM ATIVO';
            }

            const remaining = afkFarmCooldownRemaining.value;

            return remaining > 0
                ? `AFK em ${remaining}s`
                : 'AFK pronto';
        }

        function toggleExpandedMap() {

            expandedMapOpen.value = !expandedMapOpen.value;

            if (expandedMapOpen.value) {
                selectedGlobalZoneKey.value = currentZoneKey.value;
            }
        }

        function getGlobalMapZones() {

            return Object.values(ZONES);
        }

        function getSelectedGlobalZone() {

            return (
                ZONES[selectedGlobalZoneKey.value] ||
                activeZone.value
            );
        }

        function getGlobalZoneQuestCount(zone) {

            return zone.quests?.length || 0;
        }

        function getGlobalZoneMonsterCount(zone) {

            return (
                (zone.monsters?.length || 0) +
                (zone.boss ? 1 : 0)
            );
        }

        function canTravelToGlobalZone(zone) {

            if (!zone || zone.key === currentZoneKey.value) {
                return false;
            }

            return portals.value.some(
                portal => portal.to === zone.key
            );
        }

        function selectGlobalZone(zone) {

            selectedGlobalZoneKey.value = zone.key;
        }

        function travelToSelectedGlobalZone() {

            const zone = getSelectedGlobalZone();

            if (!canTravelToGlobalZone(zone)) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Sem portal',
                    'miss'
                );
                return;
            }

            expandedMapOpen.value = false;
            transitionToZone(zone.key);
        }

        function getPlayerSpriteSet() {

            return (
                playerSprites[getCharacterClass()] ||
                playerSprites.default ||
                playerSprites
            );
        }

        function getPlayerDirectionSprites() {

            const spriteSet = getPlayerSpriteSet();

            return (
                spriteSet[player.value.direction] ||
                spriteSet.down
            );
        }

        function getPlayerSprite() {

            const spriteSet = getPlayerSpriteSet();
            const direction = getPlayerDirectionSprites();

            if (player.value.hp <= 0 && spriteSet.dead) {
                return spriteSet.dead;
            }

            if (player.value.attacking) {
                return direction.attack;
            }

            if (!player.value.moving) {
                return direction.idle;
            }

            return direction.walk[
                player.value.animationFrame %
                    direction.walk.length
            ];
        }

        function disableAfkFarm() {

            afkFarmEnabled.value = false;
        }

        function markPlayerActivity() {

            lastPlayerActivityAt.value = Date.now();
            disableAfkFarm();
        }

        function hasAliveMonsters() {

            return monsters.value.some(
                monster => !monster.dead && monster.hp > 0
            );
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

            const mapPixelWidth = getMapWidth() * tileSize;
            const mapPixelHeight = getMapHeight() * tileSize;
            const viewportWidth = viewportSize.value.width || VIEWPORT_WIDTH;
            const viewportHeight = viewportSize.value.height || VIEWPORT_HEIGHT;
            const maxCameraX = Math.max(
                0,
                mapPixelWidth - viewportWidth
            );
            const maxCameraY = Math.max(
                0,
                mapPixelHeight - viewportHeight
            );

            camera.value.x = Math.min(
                maxCameraX,
                Math.max(
                    0,
                    player.value.x * tileSize - viewportWidth / 2
                )
            );

            camera.value.y = Math.min(
                maxCameraY,
                Math.max(
                    0,
                    player.value.y * tileSize - viewportHeight / 2
                )
            );
        }

        function syncViewportSize() {

            const viewport = gameViewportRef.value;

            if (!viewport) {
                return;
            }

            const rect = viewport.getBoundingClientRect();

            viewportSize.value = {
                width: Math.max(1, Math.round(rect.width)),
                height: Math.max(1, Math.round(rect.height))
            };

            updateCamera();
        }

        function persistCharacter() {

            saveCharacter(
                props.characterId,
                {
                    ...player.value,
                    gold: gold.value,
                    inventoryJson: JSON.stringify(inventory.value),
                    equipmentJson:
                        player.value.equipmentJson ||
                        '{"weapon":null,"armor":null,"accessory":null}'
                }
            ).catch(() => {
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
            markPlayerActivity();
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

        function openNpcDialog(npc) {

            markPlayerActivity();
            activeNpc.value = npc;
        }

        function getNpcSuccessMessage(npc) {

            const messages = {
                blacksmith: 'Fechado. Vou deixar a forja quente para quando trouxeres material de verdade.',
                merchant: 'Combinado. Separei umas mercadorias boas para a proxima visita.',
                healer: 'Pronto. Os teus ferimentos fecharam e a mana voltou a correr.',
                questMaster: 'Contrato aceito. Volta com provas, e talvez com todos os dedos.',
                trainer: 'Treino anotado. O corpo aprende antes da cabeca admitir.',
                guard: 'Entendido. Mantem-te na estrada e evita fazer barulho perto das ruinas.',
                storageChest: 'Bau aberto. A casa guarda melhor do que a mochila.'
            };

            return messages[npc.type] || 'Certo. Esta combinado.';
        }

        function showNpcResponse(npc, message) {

            npcResponse.value = {
                name: npc.name,
                portrait: npc.assets.dialogueIcon || npc.assets.portrait,
                message
            };

            if (npcResponseTimeout) {
                clearTimeout(npcResponseTimeout);
            }

            npcResponseTimeout = setTimeout(() => {
                npcResponse.value = null;
                npcResponseTimeout = null;
            }, 3200);
        }

        function acceptZoneQuests() {

            const zoneQuestIds = activeZone.value.quests || [];

            quests.value = quests.value.map(quest => {

                if (
                    !zoneQuestIds.includes(quest.id) ||
                    quest.status === 'inProgress'
                ) {
                    return quest;
                }

                const progress =
                    quest.objectiveType === 'level'
                        ? Math.min(
                            Math.max(0, quest.required - 1),
                            Number(player.value.level) || 1
                        )
                        : 0;

                return {
                    ...quest,
                    progress,
                    status: 'inProgress',
                    rewardClaimed: false
                };
            });

            quests.value
                .filter(quest =>
                    zoneQuestIds.includes(quest.id) &&
                    quest.objectiveType === 'level' &&
                    (Number(player.value.level) || 1) >= quest.required
                )
                .forEach(quest => {
                    updateQuestProgress(
                        quest.objectiveType,
                        String(quest.required),
                        1
                    );
                });
        }

        function confirmNpcAction(npc) {

            markPlayerActivity();

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

            if (npc.type === 'questMaster') {
                acceptZoneQuests();
            }

            if (npc.type === 'merchant') {
                merchantOpen.value = true;
            }

            if (npc.type === 'storageChest') {
                storageOpen.value = true;
            }

            updateQuestProgress('talk', npc.type);
            activeNpc.value = null;
            showNpcResponse(
                npc,
                getNpcSuccessMessage(npc)
            );
        }

        function closeNpcDialog() {

            markPlayerActivity();
            activeNpc.value = null;
        }

        function updateQuestProgress(objectiveType, targetType, amount = 1) {

            const completedQuests = [];

            quests.value = quests.value.map(quest => {

                if (
                    quest.objectiveType !== objectiveType ||
                    !quest.targetTypes.includes(targetType) ||
                    quest.status !== 'inProgress' ||
                    quest.status === 'complete' ||
                    quest.rewardClaimed
                ) {
                    return quest;
                }

                const progress = Math.min(
                    quest.required,
                    quest.progress + amount
                );

                const updatedQuest = {
                    ...quest,
                    progress,
                    status:
                        progress >= quest.required
                            ? 'complete'
                            : 'inProgress'
                };

                if (
                    updatedQuest.status === 'complete' &&
                    quest.status !== 'complete'
                ) {
                    updatedQuest.rewardClaimed = true;
                    completedQuests.push(updatedQuest);
                }

                return updatedQuest;
            });

            completedQuests.forEach(quest => {
                grantQuestReward(quest);
                setTimeout(() => {
                    resetQuestForRepeat(quest.id);
                }, QUEST_COMPLETE_DISPLAY_TIME);
            });
        }

        function resetQuestForRepeat(questId) {

            quests.value = quests.value.map(quest => {

                if (
                    quest.id !== questId ||
                    quest.status !== 'complete'
                ) {
                    return quest;
                }

                return {
                    ...quest,
                    progress: 0,
                    status: 'available',
                    rewardClaimed: false
                };
            });
        }

        function getVisibleQuests() {

            return quests.value.filter(
                quest =>
                    (activeZone.value.quests || []).includes(quest.id) ||
                    quest.status !== 'available'
            );
        }

        function getQuestProgressPercent(quest) {

            return Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        ((Number(quest.progress) || 0) /
                            (Number(quest.required) || 1)) *
                            100
                    )
                )
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
                return questAssets.complete;
            }

            if (quest.status === 'inProgress') {
                return questAssets.inProgress;
            }

            return questAssets.available;
        }

        function persistDailyQuestState() {

            if (typeof localStorage === 'undefined') {
                return;
            }

            localStorage.setItem(
                DAILY_QUEST_STORAGE_KEY,
                JSON.stringify(dailyQuestState.value)
            );
        }

        function refreshDailyQuestState() {

            if (
                dailyQuestState.value.date ===
                getDailyQuestDateKey()
            ) {
                return;
            }

            dailyQuestState.value = {
                date: getDailyQuestDateKey(),
                completed: 0
            };
            persistDailyQuestState();
        }

        function getDailyQuestBonusRemaining() {

            refreshDailyQuestState();

            return Math.max(
                0,
                DAILY_QUEST_BONUS_LIMIT -
                    dailyQuestState.value.completed
            );
        }

        function getDailyQuestRemaining() {

            refreshDailyQuestState();

            return Math.max(
                0,
                DAILY_QUEST_LIMIT -
                    dailyQuestState.value.completed
            );
        }

        function getDailyQuestSummary() {

            refreshDailyQuestState();

            return `${dailyQuestState.value.completed}/${DAILY_QUEST_LIMIT} hoje - ${getDailyQuestBonusRemaining()} bonus 3x restantes`;
        }

        function showQuestNotification(quest, xpReward, goldReward, multiplier) {

            questNotification.value = {
                id: `${quest.id}-${Date.now()}`,
                title: quest.title,
                xpReward,
                goldReward,
                multiplier
            };

            if (questNotificationTimeout) {
                clearTimeout(questNotificationTimeout);
            }

            questNotificationTimeout = setTimeout(() => {
                questNotification.value = null;
                questNotificationTimeout = null;
            }, 3600);
        }

        function grantQuestReward(quest) {

            refreshDailyQuestState();

            if (dailyQuestState.value.completed >= DAILY_QUEST_LIMIT) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Limite diario',
                    'miss'
                );
                return;
            }

            const multiplier =
                dailyQuestState.value.completed <
                DAILY_QUEST_BONUS_LIMIT
                    ? 3
                    : 1;
            const xpReward =
                (Number(quest.xpReward) || 0) * multiplier;
            const goldReward =
                (Number(quest.goldReward) || 0) * multiplier;

            player.value.xp += xpReward;
            gold.value += goldReward;

            (quest.itemRewards || []).forEach(itemReward => {
                addItem(
                    itemReward.itemId,
                    itemReward.quantity || 1
                );
            });

            dailyQuestState.value.completed++;
            persistDailyQuestState();
            showQuestNotification(
                quest,
                xpReward,
                goldReward,
                multiplier
            );
            checkLevelUp();
            persistCharacter();
        }

        function addItem(itemId, quantity = 1) {

            const definition = ITEM_DEFINITIONS[itemId];

            if (!definition) {
                return;
            }

            if (itemId === 'goldCoin') {
                gold.value += quantity;
                persistCharacter();
                return;
            }

            const existingItem = inventory.value.find(
                item => item.id === itemId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
                updateQuestProgress('collect', itemId, quantity);
                persistCharacter();
                return;
            }

            if (inventory.value.length >= INVENTORY_SLOT_LIMIT) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Inventario cheio',
                    'miss'
                );
                return;
            }

            inventory.value.push({
                id: itemId,
                quantity
            });

            updateQuestProgress('collect', itemId, quantity);
            persistCharacter();
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

        function getInventoryLimitLabel() {

            return `${inventory.value.length}/${INVENTORY_SLOT_LIMIT} slots`;
        }

        function getStorageLimitLabel() {

            return `${storageItems.value.length}/${STORAGE_SLOT_LIMIT} slots`;
        }

        function getMerchantItems() {

            return Object.values(ITEM_DEFINITIONS)
                .filter(item => item.id !== 'goldCoin')
                .map(item => ({
                    ...item,
                    buyPrice: Math.ceil((item.value || 100) * 1.8),
                    sellPrice: Math.max(
                        1,
                        Math.floor((item.value || 3) / 3)
                    )
                }));
        }

        function buyMerchantItem(itemId) {

            const item = getMerchantItems().find(
                merchantItem => merchantItem.id === itemId
            );

            if (!item) {
                return;
            }

            if (
                !inventory.value.some(slot => slot.id === itemId) &&
                inventory.value.length >= INVENTORY_SLOT_LIMIT
            ) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Inventario cheio',
                    'miss'
                );
                return;
            }

            if (gold.value < item.buyPrice) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Sem gold',
                    'miss'
                );
                return;
            }

            gold.value -= item.buyPrice;
            addItem(itemId);
            createFloatingText(
                player.value.x,
                player.value.y,
                'Comprado',
                'heal'
            );
        }

        function removeInventoryItem(itemId, quantity = 1) {

            const item = inventory.value.find(
                slot => slot.id === itemId
            );

            if (!item) {
                return false;
            }

            item.quantity -= quantity;

            if (item.quantity <= 0) {
                inventory.value = inventory.value.filter(
                    slot => slot.id !== itemId
                );
            }

            return true;
        }

        function sellInventoryItem(item) {

            const definition = getInventoryItem(item);

            if (!definition.id || definition.id === 'goldCoin') {
                return;
            }

            if (!removeInventoryItem(item.id)) {
                return;
            }

            const value = Math.max(
                1,
                Math.floor((definition.value || 3) / 3)
            );

            gold.value += value;
            createFloatingText(
                player.value.x,
                player.value.y,
                `+${value}g`,
                'gold'
            );
        }

        function moveItemToStorage(item) {

            const stored = storageItems.value.find(
                slot => slot.id === item.id
            );

            if (
                !stored &&
                storageItems.value.length >= STORAGE_SLOT_LIMIT
            ) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Bau cheio',
                    'miss'
                );
                return;
            }

            if (!removeInventoryItem(item.id)) {
                return;
            }

            if (stored) {
                stored.quantity++;
            } else {
                storageItems.value.push({
                    id: item.id,
                    quantity: 1
                });
            }
        }

        function moveItemFromStorage(item) {

            if (
                !inventory.value.some(slot => slot.id === item.id) &&
                inventory.value.length >= INVENTORY_SLOT_LIMIT
            ) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Inventario cheio',
                    'miss'
                );
                return;
            }

            const stored = storageItems.value.find(
                slot => slot.id === item.id
            );

            if (!stored) {
                return;
            }

            stored.quantity--;

            if (stored.quantity <= 0) {
                storageItems.value = storageItems.value.filter(
                    slot => slot.id !== item.id
                );
            }

            addItem(item.id);
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

        function getClassLabel(characterClass = getCharacterClass()) {

            const labels = {
                warrior: 'Warrior',
                mage: 'Mage',
                archer: 'Archer'
            };

            return labels[characterClass] || 'Warrior';
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
                (Number(player.value.strength) || 0) * 0.9 +
                    (Number(player.value.level) || 1) * 0.5
            );
        }

        function getPlayerCriticalChance() {

            return Math.min(
                35,
                3 +
                    (Number(player.value.dexterity) || 0) * 0.8 +
                    getWeaponProfile().criticalBonus
            );
        }

        function getPlayerAccuracy() {

            return Math.min(
                96,
                74 +
                    (Number(player.value.dexterity) || 0) * 0.7 +
                    (Number(player.value.level) || 1) * 0.3 +
                    getWeaponProfile().accuracyBonus
            );
        }

        function getPlayerEvasionChance() {

            return Math.min(
                22,
                Math.floor(
                    3 +
                        (Number(player.value.dexterity) || 0) * 0.55 +
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
                    (Number(player.value.dexterity) || 0) * 10
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

            const level = Number(player.value.level) || 1;

            if (level <= 10) {
                return 100 * (2 ** (level - 1));
            }

            if (level <= 30) {
                const extraLevels = level - 10;

                return Math.floor(
                    51200 +
                    extraLevels * 6500 +
                    (extraLevels ** 2) * 450
                );
            }

            const highLevel = level - 30;

            return Math.floor(
                361200 +
                highLevel * 18000 +
                (highLevel ** 2) * 900
            );
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

            markPlayerActivity();

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

                    const playerWalkFrames =
                        getPlayerDirectionSprites().walk || [];

                    player.value.animationFrame =
                        (player.value.animationFrame + 1) %
                        Math.max(1, playerWalkFrames.length);
                }

                monsters.value.forEach(monster => {

                    if (!monster.moving) {
                        return;
                    }

                    const spriteKey =
                        monster.spriteKey ||
                        monster.race?.toLowerCase() ||
                        'goblin';
                    const sprites =
                        (monster.isBoss
                            ? bossSprites[spriteKey]
                            : monsterSprites[spriteKey]) ||
                        monsterSprites.goblin;
                    const walkFrames = sprites.walk || [];

                    monster.animationFrame =
                        ((monster.animationFrame || 0) + 1) %
                        Math.max(1, walkFrames.length);
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

        function getOutOfCombatMultiplier(entity) {

            return Date.now() - (entity.lastCombatAt || 0) >=
                OUT_OF_COMBAT_DELAY
                ? OUT_OF_COMBAT_REGEN_MULTIPLIER
                : 1;
        }

        function getPlayerHpRegenPerSecond() {

            return Math.max(
                1,
                Math.floor((Number(player.value.maxHp) || 100) * 0.01)
            );
        }

        function getPlayerManaRegenPerSecond() {

            return Math.max(
                1,
                Math.floor((Number(player.value.maxMana) || 50) * 0.018)
            );
        }

        function regenerateEntityResources() {

            const playerMultiplier =
                getOutOfCombatMultiplier(player.value);
            const hpRegen =
                getPlayerHpRegenPerSecond() * playerMultiplier;
            const manaRegen =
                getPlayerManaRegenPerSecond() * playerMultiplier;

            if (player.value.hp > 0) {
                player.value.hp = Math.min(
                    player.value.maxHp,
                    player.value.hp + hpRegen
                );
                player.value.mana = Math.min(
                    player.value.maxMana,
                    player.value.mana + manaRegen
                );
            }

            monsters.value.forEach(monster => {

                if (monster.dead || monster.hp <= 0) {
                    return;
                }

                const monsterMultiplier =
                    getOutOfCombatMultiplier(monster);
                const monsterRegen = Math.max(
                    1,
                    Math.floor((monster.maxHp || 1) * 0.012)
                ) * monsterMultiplier;

                monster.hp = Math.min(
                    monster.maxHp,
                    monster.hp + monsterRegen
                );
            });
        }

        function startResourceRegenerationLoop() {

            if (resourceRegenInterval) {
                return;
            }

            resourceRegenInterval = setInterval(() => {
                regenerateEntityResources();
            }, RESOURCE_REGEN_INTERVAL);
        }

        function startAfkFarmLoop() {

            if (afkFarmInterval) {
                return;
            }

            afkFarmInterval = setInterval(() => {

                if (
                    afkFarmEnabled.value ||
                    activeNpc.value ||
                    pressedMovementKeys.size > 0 ||
                    player.value.hp <= 0
                ) {
                    return;
                }

                if (
                    Date.now() - lastPlayerActivityAt.value <
                    AFK_FARM_DELAY
                ) {
                    return;
                }

                if (!hasAliveMonsters()) {
                    return;
                }

                // AFK farm usa o auto-combate existente para perseguir e atacar.
                afkFarmEnabled.value = true;
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'AFK Farm',
                    'magic'
                );
                startAutoCombat({
                    userAction: false
                });
            }, AFK_FARM_CHECK_INTERVAL);
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

        function isBlockedMapPosition(x, y) {

            if (
                x < 0 ||
                y < 0 ||
                x >= getMapWidth() ||
                y >= getMapHeight()
            ) {
                return true;
            }

            return BLOCKED_TILES.includes(
                gameMap.value[y]?.[x]
            );
        }

        function hasLineOfSight(fromX, fromY, toX, toY) {

            let x = fromX;
            let y = fromY;
            const dx = Math.abs(toX - fromX);
            const dy = Math.abs(toY - fromY);
            const stepX = fromX < toX ? 1 : -1;
            const stepY = fromY < toY ? 1 : -1;
            let error = dx - dy;

            while (!(x === toX && y === toY)) {
                const doubleError = error * 2;

                if (doubleError > -dy) {
                    error -= dy;
                    x += stepX;
                }

                if (doubleError < dx) {
                    error += dx;
                    y += stepY;
                }

                if (x === toX && y === toY) {
                    return true;
                }

                if (isBlockedMapPosition(x, y)) {
                    return false;
                }
            }

            return true;
        }

        function canPlayerAttackTarget(target) {

            if (!target) {
                return false;
            }

            if (getBasicAttackRange() <= 1) {
                return true;
            }

            return hasLineOfSight(
                player.value.x,
                player.value.y,
                target.x,
                target.y
            );
        }

        function findPath(start, target, canWalk) {

            if (start.x === target.x && start.y === target.y) {
                return [];
            }

            const queue = [{
                ...start,
                path: []
            }];
            const visited = new Set([
                `${start.x},${start.y}`
            ]);
            const directions = [
                { x: 1, y: 0 },
                { x: -1, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: -1 }
            ];

            while (queue.length) {
                const current = queue.shift();

                for (const direction of directions) {
                    const next = {
                        x: current.x + direction.x,
                        y: current.y + direction.y
                    };
                    const key = `${next.x},${next.y}`;

                    if (visited.has(key)) {
                        continue;
                    }

                    if (!canWalk(next.x, next.y)) {
                        continue;
                    }

                    const path = [
                        ...current.path,
                        next
                    ];

                    if (
                        next.x === target.x &&
                        next.y === target.y
                    ) {
                        return path;
                    }

                    visited.add(key);
                    queue.push({
                        ...next,
                        path
                    });
                }
            }

            return [];
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

        function findPlayerAttackPath(target) {

            const candidates = [];
            const range = getBasicAttackRange();

            for (let y = 0; y < getMapHeight(); y++) {
                for (let x = 0; x < getMapWidth(); x++) {
                    const distance = Math.max(
                        Math.abs(x - target.x),
                        Math.abs(y - target.y)
                    );

                    if (
                        distance === 0 ||
                        distance > range ||
                        !canPlayerMoveTo(x, y)
                    ) {
                        continue;
                    }

                    if (
                        range > 1 &&
                        !hasLineOfSight(x, y, target.x, target.y)
                    ) {
                        continue;
                    }

                    candidates.push({
                        x,
                        y,
                        score:
                            Math.abs(player.value.x - x) +
                            Math.abs(player.value.y - y)
                    });
                }
            }

            return candidates
                .sort((first, second) => first.score - second.score)
                .map(candidate =>
                    findPath(
                        {
                            x: player.value.x,
                            y: player.value.y
                        },
                        candidate,
                        canPlayerMoveTo
                    )
                )
                .find(path => path.length) || [];
        }

        function followClickMovePath() {

            if (!clickMovePath.length) {
                return false;
            }

            const next = clickMovePath.shift();
            const dx = next.x - player.value.x;
            const dy = next.y - player.value.y;

            if (Math.abs(dx) + Math.abs(dy) !== 1) {
                clickMovePath = [];
                return false;
            }

            if (!movePlayer(dx, dy)) {
                clickMovePath = [];
                return false;
            }

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

            const now = Date.now();

            if (now - lastPlayerMoveAt < PLAYER_MOVE_INTERVAL) {
                return;
            }

            // O cooldown vale tanto para tecla segurada quanto para toques repetidos.
            lastPlayerMoveAt = now;

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
                if (pressedMovementKeys.size > 0) {
                    movePlayerFromPressedKeys();
                    return;
                }

                followClickMovePath();
            }, PLAYER_MOVE_INTERVAL);
        }

        function selectTarget(monster, {
            userAction = true
        } = {}) {

            if (!monster || monster.dead || monster.hp <= 0) {
                return;
            }

            if (userAction) {
                markPlayerActivity();
            }

            selectedTarget.value = monster;
        }

        function findNearestMonster() {

            return monsters.value
                .filter(monster => !monster.dead && monster.hp > 0)
                .sort((first, second) =>
                    getDistanceToTarget(first) -
                    getDistanceToTarget(second)
                )[0] || null;
        }

        function ensureAutoCombatTarget({
            silent = false,
            userAction = true
        } = {}) {

            clearTargetIfDead();

            if (selectedTarget.value) {
                return true;
            }

            const nearestMonster = findNearestMonster();

            if (!nearestMonster) {
                if (silent) {
                    return false;
                }

                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Sem alvo',
                    'miss'
                );
                return false;
            }

            selectTarget(nearestMonster, {
                userAction
            });
            return true;
        }

        function engageTarget(monster) {

            selectTarget(monster);
            startAutoCombat();
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
                if (!afkFarmEnabled.value) {
                    stopAutoCombat();
                }
            }

            if (
                selectedTarget.value &&
                selectedTarget.value.id === monster.id
            ) {
                selectedTarget.value = null;
            }

            monster.respawnTimeout = setTimeout(() => {
                respawnMonster(monster);
            }, MONSTER_RESPAWN_DELAY);

            checkLevelUp();
            persistCharacter();

            return true;
        }

        function findRespawnPosition(monster) {

            const origin = {
                x: monster.spawnX ?? monster.x,
                y: monster.spawnY ?? monster.y
            };
            const candidates = [
                origin,
                { x: origin.x + 1, y: origin.y },
                { x: origin.x - 1, y: origin.y },
                { x: origin.x, y: origin.y + 1 },
                { x: origin.x, y: origin.y - 1 }
            ];

            return candidates.find(candidate =>
                canMonsterMoveTo(
                    candidate.x,
                    candidate.y,
                    monster
                )
            ) || origin;
        }

        function respawnMonster(monster) {

            const position = findRespawnPosition(monster);

            monster.x = position.x;
            monster.y = position.y;
            monster.hp = monster.maxHp;
            monster.dead = false;
            monster.moving = false;
            monster.attacking = false;
            monster.animationFrame = 0;
            monster.lastAttackAt = Date.now();
            monster.lastCombatAt = 0;
            monster.respawnTimeout = null;
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
            monster.lastCombatAt = Date.now();
            player.value.lastCombatAt = Date.now();

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

            if (
                getDistanceToTarget(target) <= getBasicAttackRange() &&
                canPlayerAttackTarget(target)
            ) {
                return true;
            }

            const pathToAttackTile = findPlayerAttackPath(target);

            if (pathToAttackTile.length) {
                const next = pathToAttackTile[0];

                return movePlayer(
                    next.x - player.value.x,
                    next.y - player.value.y
                );
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

        function canMonsterMoveTo(x, y, movingMonster = null) {

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
                    monster.id !== movingMonster?.id &&
                    !monster.dead &&
                    monster.x === x &&
                    monster.y === y
            );
        }

        function canMonsterAttackPlayer(monster) {

            if ((monster.attackRange || 1) <= 1) {
                return true;
            }

            return hasLineOfSight(
                monster.x,
                monster.y,
                player.value.x,
                player.value.y
            );
        }

        function findMonsterAttackPath(monster) {

            const candidates = [];
            const range = monster.attackRange || 1;

            for (let y = 0; y < getMapHeight(); y++) {
                for (let x = 0; x < getMapWidth(); x++) {
                    const distance = Math.max(
                        Math.abs(x - player.value.x),
                        Math.abs(y - player.value.y)
                    );

                    if (
                        distance === 0 ||
                        distance > range ||
                        !canMonsterMoveTo(x, y, monster)
                    ) {
                        continue;
                    }

                    if (
                        range > 1 &&
                        !hasLineOfSight(
                            x,
                            y,
                            player.value.x,
                            player.value.y
                        )
                    ) {
                        continue;
                    }

                    candidates.push({
                        x,
                        y,
                        score:
                            Math.abs(monster.x - x) +
                            Math.abs(monster.y - y)
                    });
                }
            }

            return candidates
                .sort((first, second) => first.score - second.score)
                .map(candidate =>
                    findPath(
                        {
                            x: monster.x,
                            y: monster.y
                        },
                        candidate,
                        (x, y) => canMonsterMoveTo(x, y, monster)
                    )
                )
                .find(path => path.length) || [];
        }

        function moveMonsterTowardsPlayer(monster) {

            const pathToAttackTile = findMonsterAttackPath(monster);

            if (pathToAttackTile.length) {
                const next = pathToAttackTile[0];

                monster.x = next.x;
                monster.y = next.y;
                monster.moving = true;
                stopMonsterMovementAnimation(monster);
                return;
            }

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
                    monster.y + step.y,
                    monster
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

            if (!canMonsterAttackPlayer(monster)) {
                moveMonsterTowardsPlayer(monster);
                return;
            }

            monster.lastAttackAt = now;
            monster.lastCombatAt = now;
            player.value.lastCombatAt = now;
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
                playerDeath(monster);
            }
        }

        function clearRegenerationIntervals() {

            regenerationIntervals.forEach(interval => {
                clearInterval(interval);
            });
            regenerationIntervals.length = 0;
        }

        function getSurvivalTimeLabel() {

            const totalSeconds = Math.max(
                0,
                Math.floor((Date.now() - gameStartedAt) / 1000)
            );
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            return `${minutes}m ${seconds}s`;
        }

        function finishPlayerRespawn() {

            // Respawn simples: volta ao ponto inicial com recursos cheios.
            stopAutoCombat();
            clearRegenerationIntervals();
            pressedMovementKeys.clear();
            clickMovePath = [];
            loadZoneEntities(PLAYER_START_ZONE);
            player.value.x = PLAYER_START_POSITION.x;
            player.value.y = PLAYER_START_POSITION.y;
            player.value.currentZone =
                ZONES[PLAYER_START_ZONE].name;
            player.value.hp =
                player.value.maxHp || 100;
            player.value.mana =
                player.value.maxMana || 50;
            player.value.moving = false;
            player.value.direction = 'down';
            player.value.animationFrame = 0;
            deathScreen.value = null;
            playerDeathTimeout = null;
            gameStartedAt = Date.now();

            monsters.value.forEach(monster => {
                monster.lastAttackAt = Date.now();
            });

            updateCamera();
            persistCharacter();
        }

        function getBaseAttributeValue(attribute) {

            const baseAttributes =
                BASE_ATTRIBUTES_BY_CLASS[getCharacterClass()] ||
                BASE_ATTRIBUTES_BY_CLASS.warrior;

            return baseAttributes[attribute] || 0;
        }

        function canRemoveAttributePoint(attribute) {

            return (
                Boolean(ATTRIBUTE_GAIN_BY_POINT[attribute]) &&
                (Number(player.value[attribute]) || 0) >
                    getBaseAttributeValue(attribute)
            );
        }

        function removeAttributePoint(attribute) {

            markPlayerActivity();

            if (!canRemoveAttributePoint(attribute)) {
                return;
            }

            player.value[attribute] =
                Math.max(
                    getBaseAttributeValue(attribute),
                    (Number(player.value[attribute]) || 0) - 1
                );
            player.value.attributePoints =
                getAvailableAttributePoints() + 1;

            if (attribute === 'strength') {
                const hpGain =
                    ATTRIBUTE_GAIN_BY_POINT.strength.maxHp;

                player.value.maxHp =
                    Math.max(1, player.value.maxHp - hpGain);
                player.value.hp =
                    Math.min(player.value.hp, player.value.maxHp);
            }

            if (attribute === 'intelligence') {
                const manaGain =
                    ATTRIBUTE_GAIN_BY_POINT.intelligence.maxMana;

                player.value.maxMana =
                    Math.max(1, player.value.maxMana - manaGain);
                player.value.mana =
                    Math.min(player.value.mana, player.value.maxMana);
            }

            persistCharacter();
        }

        function playerDeath(monster = null) {

            if (playerDeathTimeout || deathScreen.value) {
                return;
            }

            markPlayerActivity();
            stopAutoCombat();
            clearRegenerationIntervals();
            pressedMovementKeys.clear();
            clickMovePath = [];

            deathScreen.value = {
                monsterName: monster?.name || selectedTarget.value?.name || 'Desconhecido',
                playerLevel: player.value.level,
                survivalTime: getSurvivalTimeLabel()
            };

            playerDeathTimeout = setTimeout(() => {
                finishPlayerRespawn();
            }, PLAYER_RESPAWN_DELAY);
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

                    if (
                        distance <= attackRange &&
                        canMonsterAttackPlayer(monster)
                    ) {
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

            if (!canPlayerAttackTarget(selectedTarget.value)) {
                createFloatingText(
                    selectedTarget.value.x,
                    selectedTarget.value.y,
                    'Sem linha',
                    'miss'
                );

                return false;
            }

            playerAttackInProgress = true;
            player.value.lastAttackAt = now;
            player.value.lastCombatAt = now;
            selectedTarget.value.lastCombatAt = now;

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
                if (
                    afkFarmEnabled.value &&
                    ensureAutoCombatTarget({
                        silent: true,
                        userAction: false
                    })
                ) {
                    return;
                }

                if (afkFarmEnabled.value) {
                    createFloatingText(
                        player.value.x,
                        player.value.y,
                        'Mapa limpo',
                        'heal'
                    );
                    disableAfkFarm();
                }

                stopAutoCombat();
                return;
            }

            if (
                getDistanceToTarget(selectedTarget.value) >
                    getBasicAttackRange() ||
                !canPlayerAttackTarget(selectedTarget.value)
            ) {
                movePlayerTowardsTarget(selectedTarget.value);
                return;
            }

            player.value.moving = false;
            basicAttack({
                respectCooldown: true
            });
        }

        function startAutoCombat({
            userAction = true
        } = {}) {

            if (
                !ensureAutoCombatTarget({
                    userAction
                })
            ) {
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

                levelUpEffect.value = {
                    id: Date.now(),
                    level: player.value.level
                };
                updateQuestProgress(
                    'level',
                    String(player.value.level),
                    player.value.level
                );
                setTimeout(() => {
                    levelUpEffect.value = null;
                }, 2200);
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

            if (
                skill.range > 1 &&
                !hasLineOfSight(
                    player.value.x,
                    player.value.y,
                    selectedTarget.value.x,
                    selectedTarget.value.y
                )
            ) {
                createFloatingText(
                    selectedTarget.value.x,
                    selectedTarget.value.y,
                    'Sem linha',
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

            markPlayerActivity();

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

            markPlayerActivity();

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
                clickMovePath = [];
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

            markPlayerActivity();

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
            clickMovePath = [];
            player.value.moving = false;
        }

        function handleMapClick(event) {

            markPlayerActivity();
            stopAutoCombat();

            const viewport =
                event.currentTarget.closest('.game-viewport');

            if (!viewport) {
                return;
            }

            const rect = viewport.getBoundingClientRect();
            const targetX = Math.floor(
                (event.clientX - rect.left + camera.value.x) /
                    tileSize
            );
            const targetY = Math.floor(
                (event.clientY - rect.top + camera.value.y) /
                    tileSize
            );

            if (
                targetX === player.value.x &&
                targetY === player.value.y
            ) {
                clickMovePath = [];
                return;
            }

            if (!canPlayerMoveTo(targetX, targetY)) {
                createFloatingText(
                    player.value.x,
                    player.value.y,
                    'Bloq',
                    'miss'
                );
                return;
            }

            clickMovePath = findPath(
                {
                    x: player.value.x,
                    y: player.value.y
                },
                {
                    x: targetX,
                    y: targetY
                },
                canPlayerMoveTo
            );
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
            window.addEventListener(
                'resize',
                syncViewportSize
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
                animationFrame: 0,
                lastCombatAt: 0
            };

            gold.value = Number(character.gold) || gold.value;

            if (character.inventoryJson) {
                try {
                    const savedInventory = JSON.parse(
                        character.inventoryJson
                    );

                    if (Array.isArray(savedInventory)) {
                        inventory.value = savedInventory;
                    }
                } catch (error) {
                    console.log('Inventario salvo invalido.');
                }
            }

            loadZoneEntities(
                getZoneKeyByName(player.value.currentZone)
            );

            startAnimationLoop();
            startCombatClock();
            startAfkFarmLoop();
            startResourceRegenerationLoop();
            startPlayerMovementLoop();

            startMonsterAI();

            syncViewportSize();
            window.requestAnimationFrame(syncViewportSize);
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
            window.removeEventListener(
                'resize',
                syncViewportSize
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

            if (afkFarmInterval) {
                clearInterval(afkFarmInterval);
            }

            if (resourceRegenInterval) {
                clearInterval(resourceRegenInterval);
            }

            if (playerAttackTimeout) {
                clearTimeout(playerAttackTimeout);
            }

            if (npcResponseTimeout) {
                clearTimeout(npcResponseTimeout);
            }

            if (questNotificationTimeout) {
                clearTimeout(questNotificationTimeout);
            }

            if (playerDeathTimeout) {
                clearTimeout(playerDeathTimeout);
            }

            clearRegenerationIntervals();

            monsters.value.forEach(monster => {

                if (monster.movementStopTimeout) {
                    clearTimeout(monster.movementStopTimeout);
                }

                if (monster.attackAnimationTimeout) {
                    clearTimeout(monster.attackAnimationTimeout);
                }

                if (monster.respawnTimeout) {
                    clearTimeout(monster.respawnTimeout);
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
            storageItems,
            gold,
            activeNpc,
            npcResponse,
            questNotification,
            levelUpEffect,
            deathScreen,
            dailyQuestState,
            merchantOpen,
            storageOpen,
            zoneBanner,
            expandedMapOpen,
            selectedGlobalZoneKey,
            gameViewportRef,

            selectedTarget,
            afkFarmEnabled,
            afkFarmCooldownRemaining,

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
            getClassLabel,
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
            getQuestProgressPercent,
            getInventoryItem,
            getItemIcon,
            getItemFrame,
            getItemTooltip,
            getInventoryLimitLabel,
            getStorageLimitLabel,
            getMerchantItems,
            buyMerchantItem,
            sellInventoryItem,
            moveItemToStorage,
            moveItemFromStorage,
            getMinimapStyle,
            getDailyQuestSummary,
            getAfkFarmStatusLabel,
            getGlobalMapZones,
            getSelectedGlobalZone,
            getGlobalZoneQuestCount,
            getGlobalZoneMonsterCount,
            canTravelToGlobalZone,
            getBosses,
            getSkillEffectImage,
            toggleExpandedMap,
            selectGlobalZone,
            travelToSelectedGlobalZone,
            openNpcDialog,
            confirmNpcAction,
            closeNpcDialog,
            spendAttributePoint,
            removeAttributePoint,
            canRemoveAttributePoint,
            useSkill,
            handleMapClick,

            selectTarget,
            engageTarget
        };
    }
};

