// import { v4 as uuidv4 } from 'uuid'; // Commented out - not currently used

const API_BASE_URL = 'http://localhost:3004/api';

class APIClient {
  constructor() {
    this.token = null;
    this.callbacks = [];
    this.terminalId = this.generateTerminalId();
  }

  // Generate unique terminal ID
  generateTerminalId() {
    return `terminal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Authentication methods
  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-Terminal-ID': this.terminalId,
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Get terminal information
  getTerminalId() {
    return this.terminalId;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired or invalid
        this.clearToken();
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic GET method
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.accessToken) {
      this.setToken(response.accessToken);
      this.onLogin(response.user);
    }
    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  // User management
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Product management
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return this.request(endpoint);
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async searchProducts(query) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  // Sales endpoints
  async getSales(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/sales?${queryString}` : '/sales';
    return this.request(endpoint);
  }

  async createSale(saleData) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async getSale(id) {
    return this.request(`/sales/${id}`);
  }

  async updateSale(id, saleData) {
    return this.request(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleData),
    });
  }

  async voidSale(id, reason) {
    return this.request(`/sales/${id}/void`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Stock movement endpoints
  async getStockMovements(productId) {
    return this.request(`/stock-movements${productId ? `?productId=${productId}` : ''}`);
  }

  async createStockMovement(movementData) {
    return this.request('/stock-movements', {
      method: 'POST',
      body: JSON.stringify(movementData),
    });
  }

  // Logging endpoint
  async logAction(action, resource, resourceId, details, ipAddress = null, userAgent = null) {
    const logData = {
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
      userAgent: userAgent || navigator.userAgent,
      ipAddress,
    };

    try {
      await this.request('/logs', {
        method: 'POST',
        body: JSON.stringify(logData),
      });
    } catch (error) {
      // Log locally if API fails
      console.error('Failed to log action:', error, logData);
    }
  }

  // Customer Management
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/customers?${queryString}` : '/customers';
    return this.request(endpoint);
  }

  async createCustomer(customerData) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  async updateCustomer(id, customerData) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCustomers(query) {
    return this.request(`/customers/search?query=${encodeURIComponent(query)}`);
  }

  async getCustomerHistory(id) {
    return this.request(`/customers/${id}/history`);
  }

  async getCustomerAnalytics() {
    return this.request('/customers/analytics/overview');
  }

  // Loyalty Program
  async earnLoyaltyPoints(data) {
    return this.request('/loyalty/earn', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async redeemLoyaltyPoints(data) {
    return this.request('/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLoyaltyTransactions(customerId) {
    return this.request(`/loyalty/transactions/${customerId}`);
  }

  async adjustLoyaltyPoints(data) {
    return this.request('/loyalty/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Loyalty Tiers
  async getLoyaltyTiers() {
    return this.request('/loyalty/tiers');
  }

  async createLoyaltyTier(data) {
    return this.request('/loyalty/tiers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLoyaltyTier(id, data) {
    return this.request(`/loyalty/tiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLoyaltyTier(id) {
    return this.request(`/loyalty/tiers/${id}`, {
      method: 'DELETE',
    });
  }

  // Advanced Analytics
  async getRealTimeAnalytics() {
    return this.request('/analytics/realtime');
  }

  // Communications
  async sendCommunication(data) {
    return this.request('/communications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCustomerCommunications(customerId) {
    return this.request(`/communications/${customerId}`);
  }

  // Event subscription
  onLogin(callback) {
    this.callbacks.push(callback);
  }

  offLogin(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  notifyLogin(user) {
    this.callbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in login callback:', error);
      }
    });
  }

  async onLogin(user) {
    await this.logAction('LOGIN', 'user', user.id, `User ${user.name} logged in`);
    this.notifyLogin(user);
  }
}

const api = new APIClient();
export default api;
