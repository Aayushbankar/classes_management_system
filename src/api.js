import API_URL from './config';

const getToken = () => localStorage.getItem('access_token');

export function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handle401(response) {
  if (response.status === 401) {
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
  handle401(response);

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
