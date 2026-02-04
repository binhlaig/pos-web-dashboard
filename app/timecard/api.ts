// /lib/timecard/api.ts
import axios, { AxiosRequestConfig } from "axios";
import { getAccessToken } from "./auth";


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// JWT ကို header ထဲ auto ထည့်ပေးမယ်
api.interceptors.request.use((cfg) => {
  const token = getAccessToken();
  if (token) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any).Authorization = `Bearer ${token}`;
  }
  return cfg;
});

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
