import API_URL from './config';

let isRefreshing = false;
let refreshQueue = [];

const getToken = () => localStorage.getItem('access_token');

export function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle401(response) {
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken && !isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('access_token', data.access);
          isRefreshing = false;
          refreshQueue.forEach(cb => cb(data.access));
          refreshQueue = [];
          return 'retried';
        }
      } catch (e) {
        // refresh failed
      }
      isRefreshing = false;
      refreshQueue = [];
    }
    clearSession();
    window.location.href = '/';
  }
  return response;
}

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  const result = await handle401(response);
  if (result === 'retried') {
    return fetchJson(path, options);
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    if (data) {
      if (typeof data === 'string') throw new Error(data);
      if (data.detail) throw new Error(data.detail);
      if (data.error) throw new Error(data.error);
      if (typeof data === 'object') {
        const messages = Object.entries(data).flatMap(([key, value]) => {
          if (Array.isArray(value)) return value.map(item => `${key}: ${item}`);
          if (value && typeof value === 'object') return Object.entries(value).map(([subKey, subValue]) => `${key}.${subKey}: ${subValue}`);
          return `${key}: ${value}`;
        });
        if (messages.length) throw new Error(messages.join(' | '));
      }
    }
    throw new Error(response.statusText || 'Request failed');
  }

  return data;
}

export async function postJson(path, body) {
  return fetchJson(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function putJson(path, body) {
  return fetchJson(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteJson(path) {
  return fetchJson(path, { method: 'DELETE' });
}

export function clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function isAdmin() {
  const user = getCurrentUser();
  return user && (user.role === 'admin' || user.role === 'owner' || user.is_superuser);
}

export function isOwner() {
  const user = getCurrentUser();
  return user && (user.role === 'owner' || user.is_superuser);
}

export function canManageUsers() {
  const user = getCurrentUser();
  return user && (user.role === 'owner' || user.role === 'admin' || user.is_superuser);
}

/**
 * Fetch a list endpoint that may return paginated ({results, count}) or plain array.
 * Always returns an array.
 */
export async function fetchList(path, options = {}) {
  const data = await fetchJson(path, options);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}
