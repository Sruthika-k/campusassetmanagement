import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  const data = response.data;

  // Save token exactly as specified
  if (data && data.token) {
    localStorage.setItem('token', response.data.token);
  }

  if (data && data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }

  return data;
}

export async function register(name, email, password, role) {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    role,
  });

  const data = response.data;

  if (data && data.token) {
    localStorage.setItem('token', response.data.token);
  }

  if (data && data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }

  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

