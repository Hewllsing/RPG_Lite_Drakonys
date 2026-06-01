<template>
  <div class="app-shell">
    <div
      v-if="session && selectedCharacter"
      class="game-session"
    >
      <div class="session-bar">
        <div class="session-identity">
          <strong>{{ session.user.user }}</strong>
          <span>{{ selectedCharacter.name }} / sessao ativa {{ sessionDuration }}</span>
        </div>

        <button
          type="button"
          @click="backToCharacters"
        >
          Personagens
        </button>

        <button
          type="button"
          @click="logout"
        >
          Sair
        </button>
      </div>

      <Game
        :key="selectedCharacter.id"
        :character-id="selectedCharacter.id"
      />
    </div>

    <main
      v-else-if="session"
      class="character-page"
    >
      <section class="character-panel">
        <div class="character-header">
          <div>
            <h1>Personagens</h1>
            <p>{{ session.user.user }} / sessao ativa {{ sessionDuration }}</p>
          </div>

          <button
            type="button"
            @click="logout"
          >
            Sair
          </button>
        </div>

        <button
          v-if="!showCharacterCreate"
          type="button"
          class="create-character-entry"
          @click="openCharacterCreate"
        >
          Criar personagem
        </button>

        <section
          v-else
          class="character-create-flow"
        >
          <div class="class-card-grid">
            <button
              v-for="characterClass in classOptions"
              :key="characterClass.id"
              type="button"
              class="class-card"
              :class="{ selected: characterForm.characterClass === characterClass.id }"
              @click="selectCharacterClass(characterClass.id)"
            >
              <img
                :src="characterClass.sprite"
                alt=""
              />
              <strong>{{ characterClass.name }}</strong>
              <span>{{ characterClass.summary }}</span>
              <small>{{ characterClass.stats }}</small>
            </button>
          </div>

          <form
            v-if="characterForm.characterClass"
            class="character-create"
            @submit.prevent="submitCharacter"
          >
            <label>
              Nome do personagem
              <input
                v-model="characterForm.name"
                maxlength="60"
                type="text"
                required
              />
            </label>

            <button
              type="submit"
              :disabled="characterLoading"
            >
              Criar {{ getClassLabel(characterForm.characterClass) }}
            </button>

            <button
              type="button"
              @click="closeCharacterCreate"
            >
              Cancelar
            </button>
          </form>
        </section>

        <p
          v-if="characterError"
          class="auth-error"
        >
          {{ characterError }}
        </p>

        <div class="character-list">
          <article
            v-for="character in characters"
            :key="character.id"
            class="character-row"
          >
            <img
              :src="getClassSprite(character.characterClass)"
              class="character-row-sprite"
              alt=""
            />

            <div class="character-row-info">
              <h2>{{ character.name }}</h2>
              <p>
                {{ getClassLabel(character.characterClass) }}
              </p>
              <p>
                Level {{ character.level }} / {{ character.currentZone }}
              </p>
              <p>
                HP {{ character.hp }}/{{ character.maxHp }} - MP {{ character.mana }}/{{ character.maxMana }}
              </p>
            </div>

            <div class="character-actions">
              <button
                type="button"
                @click="playCharacter(character)"
              >
                Jogar
              </button>

              <button
                class="danger-button"
                type="button"
                @click="openDeleteCharacter(character)"
              >
                Deletar
              </button>
            </div>
          </article>

          <p
            v-if="!characters.length && !characterLoading"
            class="empty-state"
          >
            Nenhum personagem criado.
          </p>
        </div>
      </section>

      <div
        v-if="characterToDelete"
        class="delete-modal"
      >
        <section class="delete-dialog">
          <h2>Deletar {{ characterToDelete.name }}</h2>
          <p>
            Escreve exatamente o nome do personagem para confirmar.
          </p>

          <input
            v-model="deleteConfirmation"
            type="text"
            :placeholder="characterToDelete.name"
          />

          <p
            v-if="deleteError"
            class="auth-error"
          >
            {{ deleteError }}
          </p>

          <div class="delete-actions">
            <button
              type="button"
              @click="closeDeleteCharacter"
            >
              Cancelar
            </button>

            <button
              class="danger-button"
              type="button"
              :disabled="deleteConfirmation !== characterToDelete.name"
              @click="confirmDeleteCharacter"
            >
              Confirmar delete
            </button>
          </div>
        </section>
      </div>
    </main>

    <main
      v-else
      class="auth-page"
    >
      <section class="auth-panel">
        <h1>Drakonys RPG Lite</h1>

        <div class="auth-tabs">
          <button
            type="button"
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >
            Login
          </button>

          <button
            type="button"
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
          >
            Registar
          </button>
        </div>

        <form
          class="auth-form"
          @submit.prevent="submitAuth"
        >
          <label v-if="mode === 'register'">
            User
            <input
              v-model="form.user"
              autocomplete="username"
              type="text"
              required
            />
          </label>

          <label>
            {{ mode === 'login' ? 'User ou email' : 'Email' }}
            <input
              v-model="form.identifier"
              :autocomplete="mode === 'login' ? 'username' : 'email'"
              :type="mode === 'login' ? 'text' : 'email'"
              required
            />
          </label>

          <label>
            Password
            <input
              v-model="form.password"
              autocomplete="current-password"
              type="password"
              required
            />
          </label>

          <p
            v-if="error"
            class="auth-error"
          >
            {{ error }}
          </p>

          <button
            class="auth-submit"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? 'A entrar...' : submitLabel }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script>
import Game from './components/Game/Game.vue';
import { playerSprites } from './data/gameAssets';
import {
  clearSession,
  getStoredSession,
  login,
  register
} from './services/authService';
import {
  createCharacter,
  deleteCharacter,
  getCharacters
} from './services/characterService';

export default {
  components: {
    Game
  },

  data() {
    return {
      mode: 'login',
      loading: false,
      characterLoading: false,
      error: '',
      characterError: '',
      deleteError: '',
      session: getStoredSession(),
      sessionClock: Date.now(),
      sessionTimer: null,
      characters: [],
      selectedCharacter: null,
      characterToDelete: null,
      deleteConfirmation: '',
      showCharacterCreate: false,
      classOptions: [
        {
          id: 'warrior',
          name: 'Warrior',
          sprite: playerSprites.warrior.down.idle,
          summary: 'Linha de frente resistente, dano fisico forte e mais vida por forca.',
          stats: 'Forca alta / Armadura / HP'
        },
        {
          id: 'mage',
          name: 'Mage',
          sprite: playerSprites.mage.down.idle,
          summary: 'Controle arcano com mana alta, cura e dano magico em area.',
          stats: 'Inteligencia alta / MP / Cooldown'
        },
        {
          id: 'archer',
          name: 'Archer',
          sprite: playerSprites.archer.down.idle,
          summary: 'Combate a distancia com precisao e ataques constantes.',
          stats: 'Destreza alta / Range / Critico'
        }
      ],
      characterForm: {
        name: '',
        characterClass: ''
      },
      form: {
        user: '',
        identifier: '',
        password: ''
      }
    };
  },

  computed: {
    submitLabel() {
      return this.mode === 'login'
        ? 'Entrar'
        : 'Criar conta';
    },

    sessionDuration() {
      const loginAt = this.session?.loginAt
        ? new Date(this.session.loginAt).getTime()
        : this.sessionClock;
      const elapsed = Math.max(
        0,
        Math.floor((this.sessionClock - loginAt) / 1000)
      );
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  },

  async mounted() {
    this.sessionTimer = setInterval(() => {
      this.sessionClock = Date.now();
    }, 1000);

    if (this.session) {
      if (!this.session.loginAt) {
        this.session.loginAt = new Date().toISOString();
      }
      await this.loadCharacters();
    }
  },

  beforeUnmount() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
  },

  methods: {
    async submitAuth() {

      this.loading = true;
      this.error = '';

      try {
        const session =
          this.mode === 'login'
            ? await login({
              identifier: this.form.identifier,
              password: this.form.password
            })
            : await register({
              user: this.form.user,
              email: this.form.identifier,
              password: this.form.password
            });

        this.session = session;
        this.selectedCharacter = null;
        this.showCharacterCreate = false;
        await this.loadCharacters();
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Nao foi possivel autenticar.';
      } finally {
        this.loading = false;
      }
    },

    async loadCharacters() {

      this.characterLoading = true;
      this.characterError = '';

      try {
        this.characters = await getCharacters();
      } catch (error) {
        this.characterError =
          error.response?.data?.message ||
          'Nao foi possivel carregar personagens.';
      } finally {
        this.characterLoading = false;
      }
    },

    async submitCharacter() {

      if (!this.characterForm.characterClass) {
        this.characterError = 'Escolhe uma classe antes de criar.';
        return;
      }

      this.characterLoading = true;
      this.characterError = '';

      try {
        const character =
          await createCharacter(
            this.characterForm.name,
            this.characterForm.characterClass
          );

        this.characters = [
          character,
          ...this.characters
        ];
        this.characterForm.name = '';
        this.characterForm.characterClass = '';
        this.showCharacterCreate = false;
      } catch (error) {
        this.characterError =
          error.response?.data?.message ||
          'Nao foi possivel criar personagem.';
      } finally {
        this.characterLoading = false;
      }
    },

    playCharacter(character) {
      this.selectedCharacter = character;
    },

    openCharacterCreate() {
      this.showCharacterCreate = true;
      this.characterForm.characterClass = '';
      this.characterForm.name = '';
    },

    closeCharacterCreate() {
      this.showCharacterCreate = false;
      this.characterForm.characterClass = '';
      this.characterForm.name = '';
    },

    selectCharacterClass(characterClass) {
      this.characterForm.characterClass = characterClass;
    },

    getClassLabel(characterClass) {
      const labels = {
        warrior: 'Warrior',
        mage: 'Mage',
        archer: 'Archer'
      };

      return labels[characterClass] || 'Warrior';
    },

    getClassSprite(characterClass) {
      return (
        playerSprites[characterClass]?.down?.idle ||
        playerSprites.warrior.down.idle
      );
    },

    backToCharacters() {
      this.selectedCharacter = null;
      this.showCharacterCreate = false;
      this.loadCharacters();
    },

    openDeleteCharacter(character) {
      this.characterToDelete = character;
      this.deleteConfirmation = '';
      this.deleteError = '';
    },

    closeDeleteCharacter() {
      this.characterToDelete = null;
      this.deleteConfirmation = '';
      this.deleteError = '';
    },

    async confirmDeleteCharacter() {

      if (!this.characterToDelete) {
        return;
      }

      try {
        await deleteCharacter(
          this.characterToDelete.id,
          this.deleteConfirmation
        );

        this.characters =
          this.characters.filter(
            character =>
              character.id !== this.characterToDelete.id
          );
        this.closeDeleteCharacter();
      } catch (error) {
        this.deleteError =
          error.response?.data?.message ||
          'Nao foi possivel deletar personagem.';
      }
    },

    logout() {
      clearSession();
      this.session = null;
      this.characters = [];
      this.selectedCharacter = null;
      this.characterToDelete = null;
      this.showCharacterCreate = false;
      this.form.password = '';
    }
  }
};
</script>
