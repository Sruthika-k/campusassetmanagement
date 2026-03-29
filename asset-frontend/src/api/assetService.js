const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api'

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

class AssetService {
  async getAssets() {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, { headers: getHeaders() })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      
      throw error
    }
  }

  async getAsset(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, { headers: getHeaders() })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      
      throw error
    }
  }

  async createAsset(assetData) {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(assetData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      
      throw error
    }
  }

  async updateAsset(id, assetData) {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(assetData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      
      throw error
    }
  }

  async deleteAsset(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return true
    } catch (error) {
      
      throw error
    }
  }
}

export const assetService = new AssetService()
