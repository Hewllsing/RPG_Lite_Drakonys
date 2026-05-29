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

        <div
          class="player-wrapper"
          :style="{
            left: player.x * tileSize + 'px',
            top: player.y * tileSize + 'px'
          }"
        >

          <div class="player-overhead-bars">

            <div class="player-overhead-bar hp">
              <div
                class="player-overhead-fill hp"
                :style="{
                  width: getPlayerHpPercent() + '%'
                }"
              ></div>
            </div>

            <div class="player-overhead-bar mp">
              <div
                class="player-overhead-fill mp"
                :style="{
                  width: getPlayerManaPercent() + '%'
                }"
              ></div>
            </div>

          </div>

          <img
            class="player"
            :src="getPlayerSprite()"
          />

        </div>

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
          :class="text.kind"
          :style="{
            left: text.x * tileSize + 'px',
            top: text.y * tileSize + 'px'
          }"
        >
          {{ text.text }}
        </div>

        <!-- SKILL EFFECTS -->

        <div
          v-for="effect in skillEffects"
          :key="effect.id"
          class="skill-effect"
          :class="effect.kind"
          :style="{
            left: effect.x * tileSize + 'px',
            top: effect.y * tileSize + 'px'
          }"
        ></div>

      </div>

    </div>

    <!-- UI -->

    <div class="player-ui">

      <h2>{{ player.name }}</h2>

      <!-- STATUS -->

      <div class="status-bars">

        <div class="bar-container hp">

          <img
            :src="hpBar"
            class="status-bar"
          />

          <div
            class="status-bar-fill hp"
            :style="{
              width: getPlayerHpPercent() + '%'
            }"
          ></div>

          <span>
            HP {{ player.hp }}/{{ player.maxHp }}
          </span>

        </div>

        <div class="bar-container mp">

          <img
            :src="mpBar"
            class="status-bar"
          />

          <div
            class="status-bar-fill mp"
            :style="{
              width: getPlayerManaPercent() + '%'
            }"
          ></div>

          <span>
            MP {{ player.mana }}/{{ player.maxMana }}
          </span>

        </div>

        <div class="bar-container xp">

          <img
            :src="xpBar"
            class="status-bar"
          />

          <div
            class="status-bar-fill xp"
            :style="{
              width: getPlayerXpPercent() + '%'
            }"
          ></div>

          <span>
            LVL {{ player.level }} - XP {{ player.xp }}/{{ getXpRequiredForNextLevel() }}
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

          <p>
            Range:
            {{ getDistanceToTarget(selectedTarget) }}/{{ getBasicAttackRange() }}
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
          {{ getWeaponLabel() }} / {{ getDamageTypeLabel() }}
          / Range {{ getBasicAttackRange() }}
          / Dano {{ getBasicAttackDamagePreview() }}
          / {{ getPlayerAttackCooldown() }}ms
        </p>

      </div>

      <!-- HOTBAR -->

      <div class="hotbar">

        <div
          v-for="skill in skillBar"
          :key="skill.key"
          class="skill-wrapper"
          :class="{
            unavailable: !canPaySkillMana(skill)
          }"
          :title="`${skill.name} - MP ${getSkillManaCost(skill)}`"
          @click="useSkill(skill.key.toLowerCase())"
        >

          <img
            :src="skillSlot"
            class="skill-slot"
          />

          <img
            :src="skill.icon"
            class="skill-icon"
          />

          <div
            v-if="isSkillCoolingDown(skill)"
            class="skill-cooldown"
            :style="{
              height: getSkillCooldownPercent(skill) + '%'
            }"
          ></div>

          <span
            v-if="isSkillCoolingDown(skill)"
            class="skill-cooldown-text"
          >
            {{ getSkillCooldownText(skill) }}
          </span>

          <span class="skill-key">
            {{ skill.key }}
          </span>

          <span
            v-if="getSkillManaCost(skill) > 0"
            class="skill-mana"
          >
            {{ getSkillManaCost(skill) }}
          </span>

        </div>

      </div>

    </div>

  </div>
</template>

<script src="./Game.js"></script>
<style src="./Game.css"></style>
