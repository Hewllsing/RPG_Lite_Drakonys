import axios from 'axios';
import {
  getAuthToken
} from './authService';

const API_URL = 'http://localhost:3000/api/character';

function getAuthHeaders() {

  const token = getAuthToken();

  return {
    Authorization: `Bearer ${token}`
  };
}

export async function getCharacter() {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function saveCharacter(character) {
  const response = await axios.put(API_URL, character, {
    headers: getAuthHeaders()
  });

  return response.data;
}
