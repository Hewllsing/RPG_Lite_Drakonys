const crypto = require('crypto');

const { pool } = require('../database/connection');
const {
  hashPassword,
  verifyPassword
} = require('./passwordService');
const {
  createCharacterForUser
} = require('./characterService');

function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sanitizeUser(user) {

  return {
    id: user.id,
    user: user.username,
    email: user.email
  };
}

async function createSession(userId) {

  const token = createSessionToken();

  await pool.execute(
    `
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (:userId, :token, DATE_ADD(NOW(), INTERVAL 7 DAY))
    `,
    {
      userId,
      token
    }
  );

  return token;
}

async function registerUser({
  user,
  email,
  password
}) {

  const username = user?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!username || !normalizedEmail || !password) {
    const error = new Error('User, email e password sao obrigatorios.');
    error.status = 400;
    throw error;
  }

  const [existingUsers] = await pool.execute(
    `
      SELECT id
      FROM users
      WHERE username = :username OR email = :email
      LIMIT 1
    `,
    {
      username,
      email: normalizedEmail
    }
  );

  if (existingUsers.length > 0) {
    const error = new Error('User ou email ja esta em uso.');
    error.status = 409;
    throw error;
  }

  const passwordHash = hashPassword(password);

  const [result] = await pool.execute(
    `
      INSERT INTO users (username, email, password_hash)
      VALUES (:username, :email, :passwordHash)
    `,
    {
      username,
      email: normalizedEmail,
      passwordHash
    }
  );

  const newUser = {
    id: result.insertId,
    username,
    email: normalizedEmail
  };

  await createCharacterForUser(newUser.id, username);

  const token = await createSession(newUser.id);

  return {
    token,
    user: sanitizeUser(newUser)
  };
}

async function loginUser({
  identifier,
  password
}) {

  const login = identifier?.trim();

  if (!login || !password) {
    const error = new Error('User/email e password sao obrigatorios.');
    error.status = 400;
    throw error;
  }

  const [users] = await pool.execute(
    `
      SELECT id, username, email, password_hash
      FROM users
      WHERE username = :login OR email = :login
      LIMIT 1
    `,
    {
      login
    }
  );

  const user = users[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    const error = new Error('Credenciais invalidas.');
    error.status = 401;
    throw error;
  }

  const token = await createSession(user.id);

  return {
    token,
    user: sanitizeUser(user)
  };
}

async function getUserBySessionToken(token) {

  if (!token) {
    return null;
  }

  const [users] = await pool.execute(
    `
      SELECT users.id, users.username, users.email
      FROM user_sessions
      INNER JOIN users ON users.id = user_sessions.user_id
      WHERE user_sessions.token = :token
        AND user_sessions.expires_at > NOW()
      LIMIT 1
    `,
    {
      token
    }
  );

  return users[0] || null;
}

module.exports = {
  registerUser,
  loginUser,
  getUserBySessionToken,
  sanitizeUser
};
