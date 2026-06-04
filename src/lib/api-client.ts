import { authHelper } from "./auth-helper";

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = authHelper.getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(path, { ...options, headers });
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || "An error occurred");
  }

  return result;
}
