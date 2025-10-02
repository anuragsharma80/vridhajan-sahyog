import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true, // Enable cookies for secure token handling
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Process failed requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add a request interceptor
API.interceptors.request.use(
  (config) => {
    // HttpOnly cookies are automatically sent with requests
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and refresh
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired) - but not for login/logout endpoints
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/logout')) {
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return API(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          // Token refreshed successfully
          processQueue(null, response.data.data);
          
          // Retry the original request
          return API(originalRequest);
        } else {
          // Refresh failed
          processQueue(new Error('Token refresh failed'), null);
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        processQueue(refreshError, null);
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
