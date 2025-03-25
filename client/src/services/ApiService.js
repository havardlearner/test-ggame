const API_URL = ''; // Empty string for relative URLs when using proxy

class ApiService {
  async request(endpoint, method = 'GET', data = null) {
    const url = `${API_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    // If response is not ok, throw error
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.msg || 'Something went wrong');
    }
    
    // Return null for 204 No Content
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }
  
  // Auth endpoints
  async register(userData) {
    return this.request('/api/auth/register', 'POST', userData);
  }
  
  async login(credentials) {
    return this.request('/api/auth/login', 'POST', credentials);
  }
  
  // User endpoints
  async getUser() {
    return this.request('/api/users/me');
  }
  
  async updateProfile(userData) {
    return this.request('/api/users/profile', 'PUT', userData);
  }
  
  async getHighScores() {
    return this.request('/api/users/highscores');
  }
  
  // Subscription endpoints
  async subscribeToUser(userId) {
    return this.request(`/api/users/subscribe/${userId}`, 'POST');
  }
  
  async unsubscribeFromUser(userId) {
    return this.request(`/api/users/unsubscribe/${userId}`, 'POST');
  }
  
  async getMutualSubscribers() {
    return this.request('/api/users/mutuals');
  }
}

export default new ApiService(); 