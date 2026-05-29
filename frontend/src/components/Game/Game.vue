<template>
  <div class="game-container">

    <div class="game-viewport">

      <div
        class="game-map"
        :style="{
          transform: `translate(-${camera.x}px, -${camera.y}px)`
        }"
      >

        <!-- MAPA -->

        <div
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
          />

        </div>

        <!-- PLAYER -->

        <img
          class="player"
          :src="getPlayerSprite()"
          :style="{
            left: player.x * tileSize + 'px',
            top: player.y * tileSize + 'px'
          }"
        />

        <!-- MONSTROS -->

        <div
          v-for="monster in monsters"
          :key="monster.id"
          class="monster-wrapper"
          :style="{
            left: monster.x * tileSize + 'px',
            top: monster.y * tileSize + 'px'
          }"
          @click="selectTarget(monster)"
        >

          <img
            :src="getMonsterSprite(monster)"
            class="monster"
            :class="{
              selected:
                selectedTarget?.id === monster.id
            }"
          />

          <!-- HP BAR -->

          <div class="monster-hp-container">

            <div
              class="monster-hp-fill"
              :style="{
                width:
                  (monster.hp / monster.maxHp) * 100 + '%'
              }"
            ></div>

          </div>

        </div>

        <!-- FLOATING DAMAGE -->

        <div
          v-for="text in floatingTexts"
          :key="text.id"
          class="floating-text"
          :style="{
            left: text.x * tileSize + 'px',
            top: text.y * tileSize + 'px'
          }"
        >
          {{ text.text }}
        </div>

      </div>

    </div>

    <!-- UI -->

    <div class="player-ui">

      <h2>{{ player.name }}</h2>

      <!-- STATUS -->

      <div class="status-bars">

        <div class="bar-container">

          <img
            :src="hpBar"
            class="status-bar"
          />

          <span>
            HP {{ player.hp }}
          </span>

        </div>

        <div class="bar-container">

          <img
            :src="mpBar"
            class="status-bar"
          />

          <span>
            MP {{ player.mana }}
          </span>

        </div>

        <div class="bar-container">

          <img
            :src="xpBar"
            class="status-bar"
          />

          <span>
            LVL {{ player.level }}
          </span>

        </div>

      </div>

      <!-- TARGET -->

      <div class="target-frame">

        <h3>Target</h3>

        <div v-if="selectedTarget">

          <p>
            {{ selectedTarget.name }}
          </p>

          <p>
            HP:
            {{ selectedTarget.hp }}
          </p>

        </div>

        <p v-else>
          Nenhum target
        </p>

      </div>

      <!-- ATRIBUTOS -->

      <div class="attributes-frame">

        <div class="attributes-header">

          <h3>Atributos</h3>

          <span>
            {{ getAvailableAttributePoints() }} pts
          </span>

        </div>

        <div class="attribute-row">

          <div>
            <strong>Forca</strong>
            <small>
              Dano fisico, armadura, vida
            </small>
            <span>
              {{ player.strength }} / Arm {{ getPlayerArmor() }}
            </span>
          </div>

          <button
            type="button"
            :disabled="getAvailableAttributePoints() <= 0"
            @click="spendAttributePoint('strength')"
          >
            +
          </button>

        </div>

        <div class="attribute-row">

          <div>
            <strong>Inteligencia</strong>
            <small>
              Mana, cooldown, dano magico
            </small>
            <span>
              {{ player.intelligence }} / Mag {{ getPlayerMagicDamage() }}
              / -{{ getSkillCooldownReduction() }}%
            </span>
          </div>

          <button
            type="button"
            :disabled="getAvailableAttributePoints() <= 0"
            @click="spendAttributePoint('intelligence')"
          >
            +
          </button>

        </div>

        <div class="attribute-row">

          <div>
            <strong>Destreza</strong>
            <small>
              Critico, ataque, precisao, evasao
            </small>
            <span>
              {{ player.dexterity }} / Crit {{ getPlayerCriticalChance() }}%
              / Acc {{ getPlayerAccuracy() }}%
              / Eva {{ getPlayerEvasionChance() }}%
            </span>
          </div>

          <button
            type="button"
            :disabled="getAvailableAttributePoints() <= 0"
            @click="spendAttributePoint('dexterity')"
          >
            +
          </button>

        </div>

        <p class="attack-speed-note">
          Ataque basico: {{ getPlayerAttackCooldown() }}ms
        </p>

      </div>

      <!-- HOTBAR -->

      <div class="hotbar">

        <div
          v-for="skill in skillBar"
          :key="skill.key"
          class="skill-wrapper"
        >

          <img
            :src="skillSlot"
            class="skill-slot"
          />

          <img
            :src="skill.icon"
            class="skill-icon"
          />

          <span class="skill-key">
            {{ skill.key }}
          </span>

        </div>

      </div>

    </div>

  </div>
</template>

<script src="./Game.js"></script>
<style src="./Game.css"></style>
