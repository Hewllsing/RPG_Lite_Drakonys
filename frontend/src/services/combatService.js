import axios from 'axios';
import {
  getAuthToken
} from './authService';

const API_URL = 'http://localhost:3000/api/combat';

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
