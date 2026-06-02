import axios from 'axios';
import {
  getAuthToken
} from './authService';
import {
  apiUrl
} from './apiConfig';

const API_URL = apiUrl('/api/combat');

export async function attackMonster(player, monster) {

  const response = await axios.post(`${API_URL}/attack`, {
    player,
    monster
  }, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });

  return response.data;
}
