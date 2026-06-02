import axios from 'axios';
import {
  getAuthToken
} from './authService';
import {
  apiUrl
} from './apiConfig';

const API_URL = apiUrl('/api/monsters');

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
