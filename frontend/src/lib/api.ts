const API_BASE_URL = 'http://localhost:3001/api';

interface ApiOptions {
  headers?: Record<string, string>;
  body?: unknown;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function request<T>(
  method: string,
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return request<T>('GET', endpoint, options);
  },

  post<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>('POST', endpoint, { ...options, body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return request<T>('PATCH', endpoint, { ...options, body });
  },

  del<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return request<T>('DELETE', endpoint, options);
  },
};

export default api;
