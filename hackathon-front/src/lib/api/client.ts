// Typed fetch wrapper that talks to the EduMetric Spring Boot backend.
// All endpoints return ApiResponse<T> — this client unwraps it and throws
// ApiError on failure. Token is read from localStorage (client) so the
// browser sends Authorization: Bearer <jwt>; the backend also accepts the
// em_token httpOnly cookie, which the browser carries automatically when
// credentials: "include" is set.

import type { ApiResponse, LoginResponse, PageParams } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api";

const TOKEN_STORAGE_KEY = "em_token";
const REFRESH_TOKEN_STORAGE_KEY = "em_refresh";

export class ApiError extends Error {
  status: number;
  details: string[] | null;

  constructor(message: string, status: number, details: string[] | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function getToken(): string | null {
  return readToken();
}

function readRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function getRefreshToken(): string | null {
  return readRefreshToken();
}

export function clearTokens() {
  setToken(null);
  setRefreshToken(null);
}

// Single-flight access-token refresh: many requests can 401 at once, but only
// one /auth/refresh call is in flight. Resolves true when a fresh access token
// has been stored, false when re-auth failed (tokens cleared).
let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const payload = (await res.json()) as ApiResponse<LoginResponse>;
    if (payload?.error || !payload?.data) {
      clearTokens();
      return false;
    }
    setToken(payload.data.token);
    setRefreshToken(payload.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
  // Override the token (e.g. for server-side calls passing a cookie value).
  token?: string | null;
  // Internal: set once we've already retried after a silent refresh.
  _retry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    path.startsWith("http")
      ? path
      : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: Method,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const isForm =
    typeof FormData !== "undefined" && opts.body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  // Let the browser set the multipart boundary itself for FormData bodies.
  if (opts.body !== undefined && !isForm) {
    headers["Content-Type"] = "application/json";
  }
  const token = opts.token !== undefined ? opts.token : readToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, opts.query), {
      method,
      headers,
      body:
        opts.body !== undefined
          ? isForm
            ? (opts.body as FormData)
            : JSON.stringify(opts.body)
          : undefined,
      credentials: "include",
      signal: opts.signal,
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0,
    );
  }

  // Access token likely expired — try a one-shot silent refresh, then retry once.
  if (
    response.status === 401 &&
    !opts._retry &&
    opts.token === undefined &&
    typeof window !== "undefined" &&
    !path.includes("/auth/refresh") &&
    !path.includes("/auth/login")
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(method, path, { ...opts, _retry: true });
    }
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    /* non-JSON response — leave payload null */
  }

  if (!response.ok) {
    const message =
      payload?.error ||
      (response.status === 401
        ? "Unauthorized"
        : response.status === 403
          ? "Forbidden"
          : `Request failed (${response.status})`);
    throw new ApiError(message, response.status, payload?.details ?? null);
  }

  if (payload && (payload.data !== undefined || payload.error !== undefined)) {
    if (payload.error) {
      throw new ApiError(payload.error, response.status, payload.details ?? null);
    }
    return payload.data as T;
  }
  return undefined as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PUT", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PATCH", path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>("DELETE", path, opts),
};

export function pageQuery(params?: PageParams) {
  if (!params) return undefined;
  const q: Record<string, string | number> = {};
  if (params.page !== undefined) q.page = params.page;
  if (params.size !== undefined) q.size = params.size;
  if (params.sort) q.sort = params.sort;
  return q;
}
