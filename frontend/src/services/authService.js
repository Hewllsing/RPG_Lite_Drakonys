import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';
const SESSION_KEY = 'rpg_lite_session';

export function getStoredSession() {

  const session = localStorage.getItem(SESSION_KEY);

  return session
    ? JSON.parse(session)
    : null;
}

export function saveSession(session) {
  const sessionWithTime = {
    ...session,
    loginAt: session.loginAt || new Date().toISOString()
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(sessionWithTime)
  );

  return sessionWithTime;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthToken() {
  return getStoredSession()?.token || null;
}

export async function register({
  user,
  email,
  password
}) {

  const response = await axios.post(
    `${API_URL}/register`,
    {
      user,
      email,
      password
    }
  );

  return saveSession(response.data);
}

export async function login({
  identifier,
  password
}) {

  const response = await axios.post(
    `${API_URL}/login`,
    {
      identifier,
      password
    }
  );

  return saveSession(response.data);
}
