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

export async function getCharacters() {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders()
  });

  return response.data;
}

export async function createCharacter(name, characterClass) {
  const response = await axios.post(
    API_URL,
    {
      name,
      characterClass
    },
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
}

export async function getCharacter(characterId) {
  const response = await axios.get(
    `${API_URL}/${characterId}`,
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
}

export async function saveCharacter(characterId, character) {
  const response = await axios.put(
    `${API_URL}/${characterId}`,
    character,
    {
      headers: getAuthHeaders()
    }
  );

  return response.data;
}

export async function deleteCharacter(characterId, confirmationName) {
  const response = await axios.delete(
    `${API_URL}/${characterId}`,
    {
      headers: getAuthHeaders(),
      data: {
        confirmationName
      }
    }
  );

  return response.data;
}
