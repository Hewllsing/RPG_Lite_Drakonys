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

function formatDbDate(value) {

  if (!value) {
    return null;
  }

  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function sanitizeUser(user) {

  return {
    id: user.id,
    user: user.username,
    email: user.email,
    lastLoginAt: formatDbDate(user.last_login_at),
    previousLastLoginAt: formatDbDate(
      user.previous_last_login_at
    )
  };
}

async function getUserById(userId) {

  const [users] = await pool.execute(
    `
      SELECT id, username, email, last_login_at
      FROM users
      WHERE id = :userId
      LIMIT 1
    `,
    {
      userId
    }
  );

  return users[0] || null;
}

async function touchLastLogin(userId) {

  await pool.execute(
    `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = :userId
    `,
    {
      userId
    }
  );

  return getUserById(userId);
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
      INSERT INTO users (
        username,
        email,
        password_hash,
        last_login_at
      )
      VALUES (
        :username,
        :email,
        :passwordHash,
        NOW()
      )
    `,
    {
      username,
      email: normalizedEmail,
      passwordHash
    }
  );

  const newUser = await getUserById(
    result.insertId
  );

  await createCharacterForUser(newUser.id, username);

  const token = await createSession(newUser.id);

  return {
    token,
    user: sanitizeUser({
      ...newUser,
      previous_last_login_at: null
    })
  };
}

async function loginUser({
  identifier,
  password
}) {

  const login = identifier?.trim();
  const normalizedLogin = login?.toLowerCase();

  if (!login || !password) {
    const error = new Error('User/email e password sao obrigatorios.');
    error.status = 400;
    throw error;
  }

  const [users] = await pool.execute(
    `
      SELECT
        id,
        username,
        email,
        password_hash,
        last_login_at
      FROM users
      -- Login flexivel: aceita user ou email sem depender de maiusculas/minusculas.
      WHERE LOWER(username) = :normalizedLogin
        OR LOWER(email) = :normalizedLogin
      LIMIT 1
    `,
    {
      normalizedLogin
    }
  );

  const user = users[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    const error = new Error('Credenciais invalidas.');
    error.status = 401;
    throw error;
  }

  const previousLastLoginAt =
    user.last_login_at;
  const loggedUser =
    await touchLastLogin(user.id);
  const token = await createSession(user.id);

  return {
    token,
    user: sanitizeUser({
      ...loggedUser,
      previous_last_login_at: previousLastLoginAt
    })
  };
}

async function getUserBySessionToken(token) {

  if (!token) {
    return null;
  }

  const [users] = await pool.execute(
    `
      SELECT
        users.id,
        users.username,
        users.email,
        users.last_login_at
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
