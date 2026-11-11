import { CONFIG } from "./config";
import { getAccessToken } from "./auth";

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers, ...restOptions } = options;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const baseUrl = CONFIG.API_BASE_URL.replace(/\/+$/, "");
  const apiPath = endpoint.replace(/^\/+/, "");
  const response = await fetch(`${baseUrl}/${apiPath}`, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      Array.isArray(data.message) ? data.message.join(", ") : data.message || "An unexpected error occurred.";
    throw new Error(errorMessage);
  }

  return data as T;
}