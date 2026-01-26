/**
 * API utility to handle authenticated requests with JWT token
 */

const API_BASE_URL = 'http://localhost:8081';

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('authToken');
  
  console.log('API Call:', {
    endpoint,
    token: token ? `${token.substring(0, 20)}...` : 'No token',
    hasToken: !!token,
  });
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Add token to Authorization header if it exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('Authorization header set');
  } else {
    console.warn('No token found in localStorage');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
      
      // Try to get error message from response body
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If response is not JSON, use status text
      }
      
      console.error('API error details:', { status: response.status, statusText: response.statusText, body: errorMessage });
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error - Backend may not be running:', error);
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8081');
    }
    throw error;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
