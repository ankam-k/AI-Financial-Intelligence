/**
 * The HTTP boundary.
 *
 * One place that knows about fetch, status codes and the backend's error
 * envelope. Everything above it receives typed data or an `ApiError` and never
 * touches a Response object.
 */

/** The backend's domain-error envelope (`app/api/errors.py`). */
interface ErrorEnvelope {
  detail?: string;
  error?: string;
}

export class ApiError extends Error {
  readonly status: number;
  /** Machine name from the backend: `NotFoundError`, `ValidationError`, … */
  readonly kind: string;

  constructor(message: string, status: number, kind: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }

  /** True when retrying the same request could plausibly succeed. */
  get isRetryable(): boolean {
    return this.status === 0 || this.status >= 500;
  }
}

const BASE = import.meta.env.VITE_API_BASE ?? '';

function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { Accept: 'application/json' },
      ...init,
    });
  } catch (cause) {
    // A network-level failure has no status. Status 0 marks it as retryable
    // and distinguishes "the server never answered" from "the server said no".
    throw new ApiError(
      'Could not reach the API. Is the backend running on port 8000?',
      0,
      'NetworkError',
    );
  }

  if (!response.ok) {
    let envelope: ErrorEnvelope = {};
    try {
      envelope = (await response.json()) as ErrorEnvelope;
    } catch {
      /* A non-JSON error body is still an error; fall through to the default. */
    }
    throw new ApiError(
      envelope.detail ?? `Request failed with status ${response.status}`,
      response.status,
      envelope.error ?? 'HttpError',
    );
  }

  return (await response.json()) as T;
}

export function apiGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  init: RequestInit = {},
): Promise<T> {
  return request<T>(`${path}${toQuery(params)}`, init);
}

export function apiPost<T>(path: string, body: unknown, init: RequestInit = {}): Promise<T> {
  // `init` first, so a caller's `signal` survives but cannot replace the
  // method or the body this function exists to set.
  return request<T>(path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
