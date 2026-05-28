import axios from 'axios';

const API_URL = 'http://localhost:3000/api/monsters';

export async function getMonsters(zone) {

  const response = await axios.get(API_URL, {
    params: {
      zone
    }
  });

  return response.data;
}