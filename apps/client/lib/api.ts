import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_API_BASE_URL,
  withCredentials: true,
})

export default api;