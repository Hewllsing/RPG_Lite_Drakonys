import axios from 'axios';
import {
  getAuthToken
} from './authService';

const API_URL = 'http://localhost:3000/api/monsters';

export async function getMonsters(zone) {

  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    },
    params: {
      zone
    }
  });

  return response.data;
}
