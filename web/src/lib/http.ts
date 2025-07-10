interface IHttp {
  get: <TResponse, TData = undefined>(
    url: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  post: <TResponse, TData = undefined>(
    url: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  put: <TResponse, TData = undefined>(
    url: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  patch: <TResponse, TData = undefined>(
    url: string,
    data?: TData,
    headers?: Record<string, string>
  ) => Promise<TResponse>;
  delete: <TResponse>(url: string) => Promise<TResponse>;
}

class Http implements IHttp {
  public async get<TResponse, TData = undefined>(
    url: string,
    params?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const response = await fetch(withParams(url, params), {
      method: 'GET',
      headers: overrideHeaders(headers),
    });
    if (isFailure(response)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  public async post<TResponse, TData = undefined>(
    url: string,
    data?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const response = await fetch(url, {
      method: 'POST',
      headers: overrideHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (isFailure(response)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  public async put<TResponse, TData = undefined>(
    url: string,
    data: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: overrideHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (isFailure(response)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  public async patch<TResponse, TData = undefined>(
    url: string,
    data?: TData,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: overrideHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (isFailure(response)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  public async delete<TResponse>(
    url: string,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: overrideHeaders(headers),
    });
    if (isFailure(response)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}

function isFailure(response: Response): boolean {
  return response.status < 200 || response.status >= 400;
}

function withParams<TData>(url: string, data?: TData): string {
  if (!data) return url;
  const params = new URLSearchParams(data).toString();
  return `${url}?${params}`;
}

function overrideHeaders(
  headers: Record<string, string> | undefined
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...headers,
  };
}

export const http: IHttp = new Http();
