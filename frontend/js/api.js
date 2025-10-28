const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token
const setToken = (token) => localStorage.setItem('token', token);

// Remove token
const removeToken = () => localStorage.removeItem('token');

// API request wrapper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  getMe: () => apiRequest('/auth/me')
};

// Listings API
const listingsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest(`/listings?${params}`);
  },
  
  getById: (id) => apiRequest(`/listings/${id}`),
  
  create: (listingData) => apiRequest('/listings', {
    method: 'POST',
    body: JSON.stringify(listingData)
  }),
  
  update: (id, updates) => apiRequest(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  
  delete: (id) => apiRequest(`/listings/${id}`, {
    method: 'DELETE'
  })
};

// Messages API
const messagesAPI = {
  getConversations: () => apiRequest('/messages/conversations'),
  
  getMessages: (userId) => apiRequest(`/messages/${userId}`),
  
  send: (messageData) => apiRequest('/messages', {
    method: 'POST',
    body: JSON.stringify(messageData)
  })
};