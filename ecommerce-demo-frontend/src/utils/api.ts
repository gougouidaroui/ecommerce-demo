import axios, { AxiosInstance } from 'axios';
import { AdminResponse } from '../types/index';

const API_BASE_URL = 'http://localhost:8000/api';
const ADMIN_BASE_URL = 'http://localhost:8000/api/admin';

const api: AxiosInstance = axios.create({ baseURL: API_BASE_URL });
const adminApi: AxiosInstance = axios.create({ baseURL: ADMIN_BASE_URL });

[api, adminApi].forEach((client) => {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
});

export { api, adminApi };
