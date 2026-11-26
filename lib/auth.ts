// lib/auth.ts
import { CONFIG } from "./config";

export type UserRole = "student" | "professor";

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

  if (!token || token === "undefined" || token === "null") {
    return null;
  }
  return token;
};

export const getUserId = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!payloadBase64) return null;
    const paddedPayload = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(atob(paddedPayload));
    const userId = decodedPayload.sub ?? decodedPayload.id ?? decodedPayload.userId;
    return userId ? Number(userId) : null;
  } catch {
    return null;
  }
};

export const getUserRole = (): UserRole => {
  const token = getAccessToken();
  if (!token) return "student";

  try {
    const payloadBase64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!payloadBase64) return "student";
    const paddedPayload = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(paddedPayload)) as { role?: unknown };
    return payload.role === "professor" ? "professor" : "student";
  } catch {
    return "student";
  }
};

export const setTokens = (accessToken?: string, refreshToken?: string): void => {
  if (typeof window === "undefined") return;

  if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
    localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  } else {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  }

  if (refreshToken && refreshToken !== "undefined" && refreshToken !== "null") {
    localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } else {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }
};

export const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};
