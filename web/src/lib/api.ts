import { removeUndefinedValues } from '@/app/utils/remove-undefined-values';
import { http } from './http';
import { useAuth } from '@/app/auth/context/auth.context';

interface Api {
  get: <TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  post: <TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  put: <TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  patch: <TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  delete: <TResponse>(endpoint: string) => Promise<TResponse>;
}

export function useApi(): Api {
  const { user } = useAuth();
  const defaultHeaders: Record<string, string> = {};
  if (user?.token) {
    defaultHeaders.Authorization = `Bearer ${user.token}`;
  }

  async function get<TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return http.get<TResponse, TData>(
      apiUrl(endpoint),
      removeUndefinedValues<TData | undefined>(data),
      {
        ...defaultHeaders,
        ...headers,
      }
    );
  }

  async function post<TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return http.post<TResponse, TData>(apiUrl(endpoint), data, {
      ...defaultHeaders,
      ...headers,
    });
  }

  async function put<TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return http.put<TResponse, TData>(apiUrl(endpoint), data, {
      ...defaultHeaders,
      ...headers,
    });
  }

  async function patch<TResponse, TData = undefined>(
    endpoint: string,
    data?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return http.patch<TResponse, TData>(apiUrl(endpoint), data, {
      ...defaultHeaders,
      ...headers,
    });
  }

  async function _delete<TResponse>(endpoint: string): Promise<TResponse> {
    return http.delete<TResponse>(endpoint, {
      ...defaultHeaders,
    });
  }

  return {
    get,
    post,
    put,
    patch,
    delete: _delete,
  };
}

function apiUrl(endpoint: string): string {
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}${endpoint}`;
}
