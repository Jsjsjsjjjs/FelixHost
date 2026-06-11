// src/lib/pterodactyl/client.ts

const PTERODACTYL_URL = process.env.PTERODACTYL_URL!;
const APP_KEY = process.env.PTERODACTYL_APP_KEY!;
const CLIENT_KEY = process.env.PTERODACTYL_CLIENT_KEY!;

export class PteroAPIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: unknown[]
  ) {
    super(message);
    this.name = "PteroAPIError";
  }
}

async function request<T>(
  path: string,
  key: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PTERODACTYL_URL}/api/${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${key}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Retry logic handled at call site
  });

  if (!res.ok) {
    let body: { errors?: { code: string; detail: string }[] } = {};
    try { body = await res.json(); } catch { /* ignore */ }
    const detail = body.errors?.[0]?.detail ?? res.statusText;
    throw new PteroAPIError(res.status, detail, body.errors);
  }

  if (res.status === 204) return {} as T;

  return res.json();
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof PteroAPIError && err.statusCode === 429) {
        // Rate limited — wait and retry
        await new Promise((r) => setTimeout(r, delay * attempt));
        continue;
      }
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Retry exhausted");
}

// ── Application API ──────────────────────────────────────────

export const appApi = {
  get: <T>(path: string) =>
    withRetry(() => request<T>(`application/${path}`, APP_KEY)),

  post: <T>(path: string, body: unknown) =>
    withRetry(() =>
      request<T>(`application/${path}`, APP_KEY, {
        method: "POST",
        body: JSON.stringify(body),
      })
    ),

  patch: <T>(path: string, body: unknown) =>
    withRetry(() =>
      request<T>(`application/${path}`, APP_KEY, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
    ),

  delete: <T>(path: string) =>
    withRetry(() =>
      request<T>(`application/${path}`, APP_KEY, { method: "DELETE" })
    ),
};

// ── Client API ───────────────────────────────────────────────

export const clientApi = {
  get: <T>(path: string) =>
    withRetry(() => request<T>(`client/${path}`, CLIENT_KEY)),

  post: <T>(path: string, body?: unknown) =>
    withRetry(() =>
      request<T>(`client/${path}`, CLIENT_KEY, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      })
    ),

  put: <T>(path: string, body: unknown) =>
    withRetry(() =>
      request<T>(`client/${path}`, CLIENT_KEY, {
        method: "PUT",
        body: JSON.stringify(body),
      })
    ),

  delete: <T>(path: string, body?: unknown) =>
    withRetry(() =>
      request<T>(`client/${path}`, CLIENT_KEY, {
        method: "DELETE",
        body: body ? JSON.stringify(body) : undefined,
      })
    ),
};
