import { authHelper } from "./auth-helper";

export class ApiError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = authHelper.getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(path, { cache: "no-store", ...options, headers });
  
  // Handle non-JSON or empty responses safely
  const contentType = response.headers.get("content-type");
  let result;
  if (contentType && contentType.includes("application/json")) {
    result = await response.json();
  } else {
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    return null;
  }

  // Handle standardized error format from our backend
  if (!result.success) {
    const errorMsg = result.error?.message || "An unexpected error occurred";
    const errorCode = result.error?.code || "INTERNAL_ERROR";
    const errorDetails = result.error?.details || null;
    
    throw new ApiError(errorMsg, errorCode, errorDetails);
  }

  return result;
}
