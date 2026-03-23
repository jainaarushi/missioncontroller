export class ApiError extends Error {
  public data: Record<string, unknown>;
  constructor(
    public status: number,
    message: string,
    data?: Record<string, unknown>,
  ) {
    super(message);
    this.data = data || {};
  }
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || res.statusText, body);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
