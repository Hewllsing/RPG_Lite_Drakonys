import axios from 'axios';

const API_URL = 'http://localhost:3000/api/combat';

export async function attackMonster(player, monster) {

  const response = await axios.post(`${API_URL}/attack`, {
    player,
    monster
  });

  return response.data;
}