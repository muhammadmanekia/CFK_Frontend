import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://env-8355920.atl.jelastic.vps-host.net',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const localhost = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
