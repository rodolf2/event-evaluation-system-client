const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

console.log("API_BASE_URL:", API_BASE_URL); // Debug log

export const api = {
  baseURL: API_BASE_URL,

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const { headers: customHeaders, ...restOptions } = options;
    const config = {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
      credentials: "include", // Send cookies for cross-origin requests
    };

    const response = await fetch(url, config);
    return response;
  },

  async get(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: "GET",
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.response = { data };
      throw error;
    }
    return data;
  },

  async post(endpoint, data, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || `HTTP error! status: ${response.status}`);
      error.response = { data: result };
      throw error;
    }
    return result;
  },

  async put(endpoint, data, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || `HTTP error! status: ${response.status}`);
      error.response = { data: result };
      throw error;
    }
    return result;
  },

  async delete(endpoint, data, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await response.json();
    if (!response.ok) {
      const error = new Error(result.message || `HTTP error! status: ${response.status}`);
      error.response = { data: result };
      throw error;
    }
    return result;
  },
};

export default api;
