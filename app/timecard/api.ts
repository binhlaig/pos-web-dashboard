// /lib/timecard/api.ts
import axios, { AxiosRequestConfig } from "axios";
import { clearAuthTokens, getStoredToken, redirectToSignIn } from "@/lib/auth";


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// JWT ကို header ထဲ auto ထည့်ပေးမယ်
api.interceptors.request.use((cfg) => {
  const token = getStoredToken();
  if (token) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any).Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthTokens();
      redirectToSignIn();
    }

    return Promise.reject(error);
  }
);

export async function get<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  const res = await api.post<T>(url, data, config);
  return res.data;
}

export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  const res = await api.put<T>(url, data, config);
  return res.data;
}

export async function del<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await api.delete<T>(url, config);
  return res.data;
}
