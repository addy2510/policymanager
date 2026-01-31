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
      
      if (response.status === 403) {
        throw new Error('Access forbidden. Please check your permissions or try logging in again.');
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

/**
 * Download a binary file (blob) from the API and trigger a client-side download.
 * Handles Authorization header and common HTTP errors similar to `apiCall`.
 */
export const downloadFile = async (
  endpoint: string,
  defaultFilename = 'download',
  options: { method?: string; body?: any; headers?: HeadersInit } = {}
) => {
  const token = localStorage.getItem('authToken');

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If sending JSON body, set Content-Type
  const method = (options.method || 'GET').toUpperCase();
  let body: BodyInit | undefined;
  if (options.body != null) {
    if (typeof options.body === 'string' || options.body instanceof Blob) {
      body = options.body as BodyInit;
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. Please check your permissions or try logging in again.');
      }

      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch (e) {
        // ignore
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();

    // Try to infer filename from content-disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let filename = defaultFilename;
    if (contentDisposition) {
      const match = /filename\*?=([^;]+)/i.exec(contentDisposition);
      if (match && match[1]) {
        filename = match[1].replace(/UTF-8''/, '').replace(/"/g, '').trim();
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error - Backend may not be running:', error);
      throw new Error('Unable to connect to server. Please ensure the backend is running on http://localhost:8081');
    }
    throw error;
  }
};
