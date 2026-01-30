// API Service Layer for Appointment System Frontend
// This connects your React frontend to the FastAPI backend

// When using Create React App's proxy (configured in package.json),
// we use relative URLs in development. The proxy will forward them to the backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Helper function for API calls
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const url = `${API_BASE_URL}/auth/login`;
    console.log('🔍 DEBUG: Login URL:', url);
    console.log('🔍 DEBUG: API_BASE_URL:', API_BASE_URL);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    console.log('🔍 DEBUG: Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: response.statusText };
      }
      console.error('🔍 DEBUG: Login error:', errorData);
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.access_token);
    return data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: async (userId) => {
    return apiRequest(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Get user preferences
  getPreferences: async (userId) => {
    return apiRequest(`/users/${userId}/preferences`);
  },

  // Update user preferences
  updatePreferences: async (userId, preferences) => {
    return apiRequest(`/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

// Providers API
export const providersAPI = {
  // Get all providers with optional filters
  getProviders: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/providers?${queryParams}`);
  },

  // Get provider by ID
  getProvider: async (providerId) => {
    return apiRequest(`/providers/${providerId}`);
  },

  // Search providers
  // Search providers
  searchProviders: async (query, category = null) => {
    const params = new URLSearchParams({ search: query });
    if (category) params.append('profession', category);
    return apiRequest(`/providers?${params.toString()}`);
  },

  // Get provider availability
  getAvailability: async (providerId, date) => {
    return apiRequest(`/providers/${providerId}/availability?date=${date}`);
  },

  // Get provider queue status
  getQueueStatus: async (providerId) => {
    return apiRequest(`/providers/${providerId}/queue`);
  },

  // Get provider reviews
  getReviews: async (providerId) => {
    return apiRequest(`/providers/${providerId}/reviews`);
  },
};

// Services API
export const servicesAPI = {
  // Get all services
  getServices: async (providerId = null) => {
    const endpoint = providerId
      ? `/services?provider_id=${providerId}`
      : '/services';
    return apiRequest(endpoint);
  },

  // Get service by ID
  getService: async (serviceId) => {
    return apiRequest(`/services/${serviceId}`);
  },

  // Get services by category
  getServicesByCategory: async (category) => {
    return apiRequest(`/services/category/${category}`);
  },

  // Get popular services
  getPopularServices: async () => {
    return apiRequest('/services/popular');
  },
};

// Appointments API
export const appointmentsAPI = {
  // Create new appointment
  createAppointment: async (appointmentData) => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  // Get user appointments
  getUserAppointments: async (userId, status = null) => {
    const endpoint = status
      ? `/appointments/user/${userId}?status=${status}`
      : `/appointments/user/${userId}`;
    return apiRequest(endpoint);
  },

  // Get provider appointments (for cockpit)
  getProviderAppointments: async () => {
    return apiRequest('/appointments/provider/me');
  },

  // Get appointment by ID
  getAppointment: async (appointmentId) => {
    return apiRequest(`/appointments/${appointmentId}`);
  },

  // Update appointment
  updateAppointment: async (appointmentId, updateData) => {
    return apiRequest(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    return apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId, newDateTime) => {
    return apiRequest(`/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ new_datetime: newDateTime }),
    });
  },

  // Check-in for appointment
  checkIn: async (appointmentId) => {
    return apiRequest(`/appointments/${appointmentId}/checkin`, {
      method: 'POST',
    });
  },

  // Get appointment queue position
  getQueuePosition: async (appointmentId) => {
    return apiRequest(`/appointments/${appointmentId}/queue-position`);
  },

  // Rate appointment
  rateAppointment: async (appointmentId, rating, review) => {
    return apiRequest(`/appointments/${appointmentId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  },

  // Cockpit: Call next customer
  callNext: async () => {
    return apiRequest(`/appointments/queue/next`, {
      method: 'POST',
    });
  },

  // Cockpit: Finish current customer
  finishCurrent: async () => {
    return apiRequest(`/appointments/queue/finish`, {
      method: 'POST',
    });
  },
};

// Recommendations API
export const recommendationsAPI = {
  // Get personalized recommendations for user
  getRecommendations: async (userId) => {
    return apiRequest(`/recommendations/user/${userId}`);
  },

  // Get recommendations based on preferences
  getRecommendationsByPreferences: async (preferences) => {
    return apiRequest('/recommendations/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  },

  // Get similar services
  getSimilarServices: async (serviceId) => {
    return apiRequest(`/recommendations/similar/${serviceId}`);
  },

  // Get trending services
  getTrendingServices: async () => {
    return apiRequest('/recommendations/trending');
  },

  // Get recommendations by location
  getLocationBasedRecommendations: async (latitude, longitude, radius = 5) => {
    return apiRequest(`/recommendations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  },
};

// Analytics API
export const analyticsAPI = {
  // Get user analytics
  getUserAnalytics: async (userId) => {
    return apiRequest(`/analytics/user/${userId}`);
  },

  // Get provider analytics
  getProviderAnalytics: async (providerId) => {
    return apiRequest(`/analytics/provider/${providerId}`);
  },

  // Get system-wide analytics
  getSystemAnalytics: async () => {
    return apiRequest('/analytics/system');
  },

  // Get wait time statistics
  getWaitTimeStats: async (providerId = null) => {
    const endpoint = providerId
      ? `/analytics/wait-time?provider_id=${providerId}`
      : '/analytics/wait-time';
    return apiRequest(endpoint);
  },

  // Get popular time slots
  getPopularTimeSlots: async (providerId) => {
    return apiRequest(`/analytics/popular-slots?provider_id=${providerId}`);
  },

  // Track user action (for analytics)
  trackAction: async (actionData) => {
    return apiRequest('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  },
};

// Real-time Queue Updates (WebSocket connection)
export class QueueWebSocket {
  constructor(appointmentId) {
    this.appointmentId = appointmentId;
    this.ws = null;
    this.callbacks = {
      onUpdate: null,
      onError: null,
      onConnect: null,
      onDisconnect: null,
    };
  }

  connect() {
    const token = localStorage.getItem('authToken');
    const wsUrl = `ws://localhost:8000/ws/queue/${this.appointmentId}?token=${token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Queue WebSocket connected');
      if (this.callbacks.onConnect) this.callbacks.onConnect();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.callbacks.onUpdate) this.callbacks.onUpdate(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.callbacks.onError) this.callbacks.onError(error);
    };

    this.ws.onclose = () => {
      console.log('Queue WebSocket disconnected');
      if (this.callbacks.onDisconnect) this.callbacks.onDisconnect();
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }
}

// Categories data (can also be fetched from backend if you add a categories endpoint)
export const CATEGORIES = [
  { id: 1, name: 'Healthcare', icon: '🏥', color: '#FF6B6B' },
  { id: 2, name: 'Beauty & Spa', icon: '💆', color: '#4ECDC4' },
  { id: 3, name: 'Fitness', icon: '💪', color: '#95E1D3' },
  { id: 4, name: 'Consultation', icon: '👔', color: '#FFE66D' },
  { id: 5, name: 'Automotive', icon: '🚗', color: '#A8E6CF' },
  { id: 6, name: 'Home Services', icon: '🏠', color: '#FFB6B9' },
];

// Export all APIs
export default {
  auth: authAPI,
  users: usersAPI,
  providers: providersAPI,
  services: servicesAPI,
  appointments: appointmentsAPI,
  recommendations: recommendationsAPI,
  analytics: analyticsAPI,
  QueueWebSocket,
  CATEGORIES,
};
