const TOKEN_KEY = "wasito_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${getToken() || ""}`,
      ...(init?.headers || {}),
    },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error((data && (data as { error?: string }).error) || "Error en la petición");
  }
  return res.json() as Promise<T>;
}

export function apiGet<T>(url: string): Promise<T> {
  return request<T>(url);
}

export function apiSend<T>(url: string, method: string, body?: unknown): Promise<T> {
  return request<T>(url, { method, body: body ? JSON.stringify(body) : undefined });
}
