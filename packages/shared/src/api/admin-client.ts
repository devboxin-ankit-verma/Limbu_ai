const API_URL = process.env.API_URL ?? process.env.API_INTERNAL_URL ?? "http://localhost:3002";

export async function adminFetch(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${API_URL}/api/admin${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });
}

/** Browser client — calls admin app proxy (same origin, forwards session cookie). */
export function adminApi(path: string, init?: RequestInit) {
  return fetch(`/api/admin${path}`, {
    ...init,
    credentials: "same-origin",
  });
}

export async function readApiError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}
