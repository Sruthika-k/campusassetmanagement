const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api';

const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem('token');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export async function getAssets() {
  const res = await fetch(`${API_BASE}/assets`, { headers: getHeaders() });
  return res.json();
}

export async function getAsset(id) {
  const res = await fetch(`${API_BASE}/assets/${id}`, { headers: getHeaders() });
  return res.json();
}

export async function createAsset(data) {
  const res = await fetch(`${API_BASE}/assets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}
