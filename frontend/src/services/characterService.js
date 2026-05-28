import axios from 'axios';

const API_URL = 'http://localhost:3000/api/character';

export async function getCharacter() {
  const response = await axios.get(API_URL);
  return response.data;
}