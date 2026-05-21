import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
});

API.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }

  return config;
});

export function setAuthToken(token){
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
}

const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (savedToken) setAuthToken(savedToken);

function getApiError(err, fallback) {
  return err?.response?.data?.message || fallback;
}

export async function loginUser(payload) {
  try {
    const { data } = await API.post('/auth/login', payload);
    return data;
  } catch (err) {
    throw new Error(getApiError(err, 'Login failed'));
  }
}

export async function registerUser(payload) {
  try {
    const { data } = await API.post('/auth/register', payload);
    return data;
  } catch (err) {
    throw new Error(getApiError(err, 'Registration failed'));
  }
}

export async function fetchLostItems(params) {
  try {
    const { data } = await API.get('/lost-items', { params });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, 'Failed to fetch lost items'));
  }
}

export async function fetchFoundItems(params) {
  try {
    const { data } = await API.get('/found-items', { params });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, 'Failed to fetch found items'));
  }
}

export async function fetchItemDetails(type, id) {
  try {
    const endpoint = type === 'found' ? `/found-items/${id}` : `/lost-items/${id}`;
    const { data } = await API.get(endpoint);
    return data;
  } catch (err) {
    throw new Error(getApiError(err, 'Failed to fetch item details'));
  }
}

export async function createLostItem(formData) {
  try {
    const { data } = await API.post('/lost-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, 'Failed to submit lost item'));
  }
}

export async function createFoundItem(formData) {
  try {
    const { data } = await API.post('/found-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (err) {
    throw new Error(getApiError(err, 'Failed to submit found item'));
  }
}

export default API;
