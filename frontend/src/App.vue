<template>
  <div class="app-shell">
    <div
      v-if="session"
      class="game-session"
    >
      <div class="session-bar">
        <div class="session-user">
          <span>
            {{ session.user.user }}
          </span>

          <small v-if="session.user.previousLastLoginAt">
            Ultimo login: {{ formatSessionDate(session.user.previousLastLoginAt) }}
          </small>

          <small v-else>
            Primeiro login registado nesta conta.
          </small>
        </div>

        <button
          type="button"
          @click="logout"
        >
          Sair
        </button>
      </div>

      <Game />
    </div>

    <main
      v-else
      class="auth-page"
    >
      <section class="auth-panel">
        <h1>Drakonys</h1>

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
import {
  clearSession,
  getStoredSession,
  login,
  register
} from './services/authService';

export default {
  components: {
    Game
  },

  data() {
    return {
      mode: 'login',
      loading: false,
      error: '',
      session: getStoredSession(),
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
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          'Nao foi possivel autenticar.';
      } finally {
        this.loading = false;
      }
    },

    logout() {
      clearSession();
      this.session = null;
      this.form.password = '';
    },

    formatSessionDate(value) {

      if (!value) {
        return '';
      }

      return new Intl.DateTimeFormat(
        'pt-PT',
        {
          dateStyle: 'short',
          timeStyle: 'short'
        }
      ).format(new Date(value));
    }
  }
};
</script>
