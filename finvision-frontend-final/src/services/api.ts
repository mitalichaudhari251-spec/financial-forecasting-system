import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 60_000,
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const match = document.cookie
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('fv_token='));
        const token = match?.split('=')[1];
        if (token) {
          config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (err.response?.status === 401) {
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config).then((r) => r.data);
  }
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config).then((r) => r.data);
  }
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config).then((r) => r.data);
  }
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config).then((r) => r.data);
  }

  postForm<T>(url: string, form: FormData, config?: AxiosRequestConfig) {
    return this.client
      .post<T>(url, form, {
        ...config,
        headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  }
}

export const api = new ApiClient();
