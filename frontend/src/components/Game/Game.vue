<template>
  <div class="game-shell">
    <section class="game-stage">
      <header class="zone-header">
        <div>
          <span class="eyebrow">Drakonys RPG Lite</span>
          <h1>{{ getZoneName() }}</h1>
        </div>
        <div class="zone-actions">
          <div
            class="afk-farm-badge"
            :class="{ active: afkFarmEnabled }"
          >
            <span class="afk-orb"></span>
            {{ getAfkFarmStatusLabel() }}
          </div>
          <div class="resource-pill">
            <span>Gold</span>
            <strong>{{ gold }}</strong>
          </div>
        </div>
      </header>

      <div
        ref="gameViewportRef"
        class="game-viewport"
      >
        <div
          v-if="zoneBanner"
          class="zone-banner"
        >
          <img
            v-if="zoneBanner.image"
            :src="zoneBanner.image"
            alt=""
          />
          <div>
            <span>Entrando em</span>
            <strong>{{ zoneBanner.name }}</strong>
            <small>{{ zoneBanner.theme }}</small>
          </div>
        </div>

        <div
          class="game-map"
          @click="handleMapClick"
          :style="{
            transform: `translate(-${camera.x}px, -${camera.y}px)`
          }"
        >
          <template
            v-for="(row, rowIndex) in gameMap"
            :key="rowIndex"
          >
            <img
              v-for="(tile, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              class="tile"
              :src="tileImages[tile]"
              :style="{
                left: colIndex * tileSize + 'px',
                top: rowIndex * tileSize + 'px'
              }"
              alt=""
            />
          </template>

          <div
            v-for="portal in portals"
            :key="`${portal.to}-${portal.x}-${portal.y}`"
            class="portal-wrapper"
            :style="{
              left: portal.x * tileSize + 'px',
              top: portal.y * tileSize + 'px'
            }"
            :title="portal.label"
          >
            <img
              :src="portalAssets[portal.color]"
              class="portal"
              alt=""
            />
          </div>

          <div
            v-for="npc in npcs"
            :key="`${npc.type}-${npc.x}-${npc.y}`"
            class="npc-wrapper"
            :style="{
              left: npc.x * tileSize + 'px',
              top: npc.y * tileSize + 'px'
            }"
            @click.stop="openNpcDialog(npc)"
          >
            <span class="entity-name npc-name">{{ npc.name }}</span>
            <img
              :src="npc.assets.sprite"
              class="npc"
              alt=""
            />
          </div>

          <div
            class="player-wrapper"
            :class="{ moving: player.moving }"
            :style="{
              left: player.x * tileSize + 'px',
              top: player.y * tileSize + 'px'
            }"
            @click.stop
          >
            <div class="player-overhead-bars">
              <div class="player-overhead-bar hp">
                <div
                  class="player-overhead-fill hp"
                  :style="{ width: getPlayerHpPercent() + '%' }"
                ></div>
              </div>
              <div class="player-overhead-bar mp">
                <div
                  class="player-overhead-fill mp"
                  :style="{ width: getPlayerManaPercent() + '%' }"
                ></div>
              </div>
            </div>

            <span class="entity-name player-name">{{ player.name }}</span>
            <img
              class="player"
              :src="getPlayerSprite()"
              alt=""
            />
          </div>

          <div
            v-for="monster in monsters"
            :key="monster.id"
            class="monster-wrapper"
            :class="{ boss: monster.isBoss, dead: monster.dead }"
            :style="{
              left: monster.x * tileSize + 'px',
              top: monster.y * tileSize + 'px'
            }"
            @click.stop="selectTarget(monster)"
            @dblclick.stop="engageTarget(monster)"
          >
            <span class="entity-name monster-name">{{ monster.name }}</span>
            <img
              :src="getMonsterSprite(monster)"
              class="monster"
              :class="{ selected: selectedTarget?.id === monster.id }"
              alt=""
            />
            <div class="monster-hp-container">
              <div
                class="monster-hp-fill"
                :style="{ width: (monster.hp / monster.maxHp) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <div
            v-for="text in floatingTexts"
            :key="text.id"
            class="floating-text"
            :class="text.kind"
            :style="{
              left: text.x * tileSize + 'px',
              top: text.y * tileSize + 'px'
            }"
          >
            {{ text.text }}
          </div>

          <div
            v-for="effect in skillEffects"
            :key="effect.id"
            class="skill-effect"
            :class="effect.kind"
            :style="{
              left: effect.x * tileSize + 'px',
              top: effect.y * tileSize + 'px'
            }"
          >
            <img
              v-if="getSkillEffectImage(effect)"
              :src="getSkillEffectImage(effect)"
              alt=""
            />
          </div>
        </div>
      </div>
    </section>

    <aside class="player-ui">
      <section class="ui-panel character-panel">
        <div class="panel-title-row">
          <div>
            <span class="eyebrow">Personagem</span>
            <h2>{{ player.name }}</h2>
          </div>
          <div class="level-stack">
            <span class="class-glow">{{ getClassLabel(player.characterClass) }}</span>
            <strong class="level-badge">Lv {{ player.level }}</strong>
          </div>
        </div>

        <div class="status-bars">
          <div class="bar-container hp">
            <div
              class="status-bar-fill hp"
              :style="{ width: getPlayerHpPercent() + '%' }"
            ></div>
            <span>HP {{ player.hp }}/{{ player.maxHp }}</span>
          </div>
          <div class="bar-container mp">
            <div
              class="status-bar-fill mp"
              :style="{ width: getPlayerManaPercent() + '%' }"
            ></div>
            <span>MP {{ player.mana }}/{{ player.maxMana }}</span>
          </div>
          <div class="bar-container xp">
            <div
              class="status-bar-fill xp"
              :style="{ width: getPlayerXpPercent() + '%' }"
            ></div>
            <span>XP {{ player.xp }}/{{ getXpRequiredForNextLevel() }}</span>
          </div>
        </div>
      </section>

      <section
        class="ui-panel target-frame"
        :class="{ boss: selectedTarget?.isBoss }"
      >
        <div class="panel-title-row">
          <h3>Target</h3>
          <span v-if="selectedTarget">{{ getDistanceToTarget(selectedTarget) }}/{{ getBasicAttackRange() }}</span>
        </div>
        <div
          v-if="selectedTarget"
          class="target-content"
        >
          <img
            :src="getMonsterSprite(selectedTarget)"
            alt=""
          />
          <div>
            <strong>{{ selectedTarget.name }}</strong>
            <small>{{ selectedTarget.isBoss ? 'Boss' : selectedTarget.type }}</small>
            <div class="target-health">
              <div
                :style="{ width: (selectedTarget.hp / selectedTarget.maxHp) * 100 + '%' }"
              ></div>
            </div>
            <span>{{ selectedTarget.hp }}/{{ selectedTarget.maxHp }}</span>
          </div>
        </div>
        <p v-else class="muted">Nenhum target</p>
      </section>

      <section class="ui-panel minimap-panel">
        <div class="panel-title-row">
          <h3>Minimap</h3>
          <button
            type="button"
            class="map-expand-button"
            @click="toggleExpandedMap"
          >
            Expandir Mapa
          </button>
        </div>
        <div class="minimap">
          <img
            v-if="activeZone.assets?.minimap"
            :src="activeZone.assets.minimap"
            alt=""
          />
          <span
            class="minimap-marker player-marker"
            :style="getMinimapStyle(player)"
          ></span>
          <span
            v-for="npc in npcs"
            :key="`mini-npc-${npc.type}-${npc.x}`"
            class="minimap-marker npc-marker"
            :style="getMinimapStyle(npc)"
          ></span>
          <span
            v-for="portal in portals"
            :key="`mini-portal-${portal.to}`"
            class="minimap-marker portal-marker"
            :style="getMinimapStyle(portal)"
          ></span>
          <span
            v-for="boss in getBosses()"
            :key="`mini-boss-${boss.id}`"
            class="minimap-marker boss-marker"
            :style="getMinimapStyle(boss)"
          ></span>
          <span
            class="minimap-marker party-marker"
            :style="{ left: '12%', top: '18%' }"
          ></span>
        </div>
      </section>

      <section class="ui-panel attributes-frame">
        <div class="attributes-header">
          <h3>Atributos</h3>
          <span>{{ getAvailableAttributePoints() }} pts</span>
        </div>
        <div class="attribute-row">
          <div>
            <strong>Forca</strong>
            <small>Dano fisico, armadura, vida</small>
            <span>{{ player.strength }} / Arm {{ getPlayerArmor() }}</span>
          </div>
          <button
            type="button"
            :disabled="getAvailableAttributePoints() <= 0"
            @click="spendAttributePoint('strength')"
          >
            +
          </button>
          <button
            type="button"
            :disabled="!canRemoveAttributePoint('strength')"
            @click="removeAttributePoint('strength')"
          >
            -
          </button>
        </div>
        <div class="attribute-row">
          <div>
            <strong>Inteligencia</strong>
            <small>Mana, cooldown, dano magico</small>
            <span>{{ player.intelligence }} / Mag {{ getPlayerMagicDamage() }} / -{{ getSkillCooldownReduction() }}%</span>
          </div>
          <button
            type="button"
            :disabled="getAvailableAttributePoints() <= 0"
            @click="spendAttributePoint('intelligence')"
          >
            +
          </button>
          <button
            type="button"
            :disabled="!canRemoveAttributePoint('intelligence')"
            @click="removeAttributePoint('intelligence')"
          >
            -
          </button>
        </div>
        <div class="attribute-row">
          <div>
            <strong>Destreza</strong>
            <small>Critico, ataque, precisao, evasao</small>
            <span>{{ player.dexterity }} / Crit {{ getPlayerCriticalChance() }}% / Acc {{ getPlayerAccuracy() }}%</span>
          </div>
          <button
            type="button"
            :disabled="getAvailableAttributePoints() <= 0"
            @click="spendAttributePoint('dexterity')"
          >
            +
          </button>
          <button
            type="button"
            :disabled="!canRemoveAttributePoint('dexterity')"
            @click="removeAttributePoint('dexterity')"
          >
            -
          </button>
        </div>
        <p class="attack-speed-note">
          {{ getWeaponLabel() }} / {{ getDamageTypeLabel() }} / Range {{ getBasicAttackRange() }} / Dano {{ getBasicAttackDamagePreview() }}
        </p>
      </section>
    </aside>

    <aside class="right-ui">
      <section class="ui-panel inventory-panel">
        <div class="panel-title-row">
          <h3>Inventario</h3>
          <span>{{ getInventoryLimitLabel() }}</span>
        </div>
        <div class="inventory-grid">
          <div
            v-for="item in inventory"
            :key="item.id"
            class="inventory-slot"
            :title="getItemTooltip(item)"
          >
            <img
              :src="getItemFrame(item)"
              class="rarity-frame"
              alt=""
            />
            <img
              :src="getItemIcon(item)"
              class="item-icon"
              alt=""
            />
            <span>{{ item.quantity }}</span>
          </div>
        </div>
      </section>

      <section class="ui-panel quests-panel">
        <div class="panel-title-row">
          <h3>Quests</h3>
          <span>{{ getDailyQuestSummary() }}</span>
        </div>
        <p class="quest-daily-note">
          As primeiras 10 quests do dia dao 3x XP e gold. Limite diario: 30 quests.
        </p>
        <div class="quest-list scroll-panel">
          <article
            v-for="quest in getVisibleQuests()"
            :key="quest.id"
            class="quest-card"
            :class="quest.status"
          >
            <img
              :src="getQuestIcon(quest)"
              alt=""
            />
            <div>
              <strong>{{ quest.title }}</strong>
              <em>{{ quest.type }}</em>
              <p>{{ quest.description }}</p>
              <span>{{ quest.progress }}/{{ quest.required }} - {{ getQuestStatusLabel(quest.status) }}</span>
              <div class="quest-progress">
                <div :style="{ width: getQuestProgressPercent(quest) + '%' }"></div>
              </div>
              <small>{{ getQuestProgressPercent(quest) }}%</small>
              <small>{{ quest.reward }}</small>
            </div>
          </article>
        </div>
      </section>

      <section class="ui-panel skills-panel">
        <div class="panel-title-row">
          <h3>Skills</h3>
          <span>{{ player.characterClass }}</span>
        </div>
        <div class="skill-list scroll-panel">
          <button
            v-for="skill in skillBar"
            :key="`skill-info-${skill.id}`"
            type="button"
            class="skill-info"
            :class="{
              unavailable: !canPaySkillMana(skill),
              cooling: isSkillCoolingDown(skill)
            }"
            :title="skill.description"
            @click="useSkill(skill.key.toLowerCase())"
          >
            <img
              :src="skill.icon"
              alt=""
            />
            <div>
              <strong>{{ skill.name }}</strong>
              <span>Tecla {{ skill.key }} / MP {{ getSkillManaCost(skill) }}</span>
              <small>Cooldown {{ getSkillCooldownText(skill) }}</small>
              <p>{{ skill.description || skill.tooltip }}</p>
              <em>
                {{ isSkillCoolingDown(skill) ? 'Em cooldown' : canPaySkillMana(skill) ? 'Disponivel' : 'Mana insuficiente' }}
              </em>
            </div>
          </button>
        </div>
      </section>
    </aside>

    <div
      v-if="activeNpc"
      class="dialog-backdrop"
      @click.self="closeNpcDialog"
    >
      <section class="npc-dialog">
        <img
          :src="activeNpc.assets.portrait"
          class="npc-portrait"
          alt=""
        />
        <div>
          <div class="panel-title-row">
            <div>
              <span class="eyebrow">{{ activeNpc.role }}</span>
              <h3>{{ activeNpc.name }}</h3>
            </div>
            <button
              type="button"
              @click="closeNpcDialog"
            >
              X
            </button>
          </div>
          <p>{{ activeNpc.dialogue }}</p>
          <button
            type="button"
            class="dialog-action"
            @click="confirmNpcAction(activeNpc)"
          >
            {{ activeNpc.actionLabel }}
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="merchantOpen"
      class="dialog-backdrop"
      @click.self="merchantOpen = false"
    >
      <section class="trade-dialog">
        <div class="panel-title-row">
          <div>
            <span class="eyebrow">Loja</span>
            <h3>Merchant</h3>
          </div>
          <button
            type="button"
            @click="merchantOpen = false"
          >
            X
          </button>
        </div>
        <p>Compra por preco alto e compra os teus itens por 1/3 do valor.</p>
        <div class="trade-columns">
          <div>
            <h4>Comprar</h4>
            <button
              v-for="item in getMerchantItems()"
              :key="`buy-${item.id}`"
              type="button"
              class="trade-row"
              @click="buyMerchantItem(item.id)"
            >
              <img :src="item.icon" alt="" />
              <span>{{ item.name }}</span>
              <strong>{{ item.buyPrice }}g</strong>
            </button>
          </div>
          <div>
            <h4>Vender</h4>
            <button
              v-for="item in inventory.filter(slot => slot.id !== 'goldCoin')"
              :key="`sell-${item.id}`"
              type="button"
              class="trade-row"
              @click="sellInventoryItem(item)"
            >
              <img :src="getItemIcon(item)" alt="" />
              <span>{{ getInventoryItem(item).name }}</span>
              <strong>{{ Math.max(1, Math.floor((getInventoryItem(item).value || 3) / 3)) }}g</strong>
            </button>
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="storageOpen"
      class="dialog-backdrop"
      @click.self="storageOpen = false"
    >
      <section class="trade-dialog storage-dialog">
        <div class="panel-title-row">
          <div>
            <span class="eyebrow">Casa</span>
            <h3>Bau pessoal</h3>
          </div>
          <button
            type="button"
            @click="storageOpen = false"
          >
            X
          </button>
        </div>
        <p>{{ getStorageLimitLabel() }} no bau. Move um item por clique.</p>
        <div class="trade-columns">
          <div>
            <h4>Mochila</h4>
            <button
              v-for="item in inventory.filter(slot => slot.id !== 'goldCoin')"
              :key="`store-${item.id}`"
              type="button"
              class="trade-row"
              @click="moveItemToStorage(item)"
            >
              <img :src="getItemIcon(item)" alt="" />
              <span>{{ getInventoryItem(item).name }}</span>
              <strong>x{{ item.quantity }}</strong>
            </button>
          </div>
          <div>
            <h4>Bau</h4>
            <button
              v-for="item in storageItems"
              :key="`take-${item.id}`"
              type="button"
              class="trade-row"
              @click="moveItemFromStorage(item)"
            >
              <img :src="getItemIcon(item)" alt="" />
              <span>{{ getInventoryItem(item).name }}</span>
              <strong>x{{ item.quantity }}</strong>
            </button>
          </div>
        </div>
      </section>
    </div>

    <div
      v-if="npcResponse"
      class="npc-response-toast"
    >
      <img
        :src="npcResponse.portrait"
        alt=""
      />
      <div>
        <strong>{{ npcResponse.name }}</strong>
        <span>{{ npcResponse.message }}</span>
      </div>
    </div>

    <div
      v-if="questNotification"
      class="quest-complete-toast"
    >
      <strong>Quest completa</strong>
      <span>{{ questNotification.title }}</span>
      <small>
        +{{ questNotification.xpReward }} XP / +{{ questNotification.goldReward }} gold
        <template v-if="questNotification.multiplier > 1">
          / bonus {{ questNotification.multiplier }}x
        </template>
      </small>
    </div>

    <div
      v-if="levelUpEffect"
      class="level-up-effect"
    >
      <strong>LEVEL UP!</strong>
      <span>Nivel {{ levelUpEffect.level }}</span>
      <i v-for="index in 10" :key="index"></i>
    </div>

    <div
      v-if="deathScreen"
      class="death-screen"
    >
      <section>
        <h2>VOCE MORREU</h2>
        <p>Monstro responsavel: <strong>{{ deathScreen.monsterName }}</strong></p>
        <p>Nivel do jogador: <strong>{{ deathScreen.playerLevel }}</strong></p>
        <p>Tempo de sobrevivencia: <strong>{{ deathScreen.survivalTime }}</strong></p>
        <small>Retornando para a Safe Zone em 3 segundos...</small>
      </section>
    </div>

    <div
      v-if="expandedMapOpen"
      class="dialog-backdrop"
      @click.self="toggleExpandedMap"
    >
      <section class="global-map-dialog">
        <div class="panel-title-row">
          <div>
            <span class="eyebrow">Mapa Global</span>
            <h3>Territorios de Drakonys</h3>
          </div>
          <button type="button" @click="toggleExpandedMap">X</button>
        </div>
        <div class="global-map-grid">
          <article
            v-for="zone in getGlobalMapZones()"
            :key="zone.key"
            class="global-zone-card"
            :class="{
              current: currentZoneKey === zone.key,
              selected: getSelectedGlobalZone().key === zone.key,
              reachable: canTravelToGlobalZone(zone),
              safe: zone.safeZone
            }"
            @click="selectGlobalZone(zone)"
          >
            <img
              v-if="zone.assets?.minimap"
              :src="zone.assets.minimap"
              alt=""
            />
            <strong>{{ zone.name }}</strong>
            <span v-if="currentZoneKey === zone.key">Posicao atual</span>
            <span v-else-if="canTravelToGlobalZone(zone)">Portal conectado</span>
            <small>{{ zone.safeZone ? 'Cidade / Safe Zone' : zone.theme }}</small>
            <em>{{ zone.portals?.length || 0 }} portais / {{ getGlobalZoneQuestCount(zone) }} quests</em>
          </article>
        </div>
        <footer class="global-map-detail">
          <div>
            <strong>{{ getSelectedGlobalZone().name }}</strong>
            <span>{{ getSelectedGlobalZone().theme }}</span>
            <small>
              {{ getGlobalZoneMonsterCount(getSelectedGlobalZone()) }} criaturas /
              {{ getGlobalZoneQuestCount(getSelectedGlobalZone()) }} quests
            </small>
          </div>
          <button
            type="button"
            :disabled="!canTravelToGlobalZone(getSelectedGlobalZone())"
            @click="travelToSelectedGlobalZone"
          >
            Viajar pelo portal
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script src="./Game.js"></script>
<style src="./Game.css"></style>
