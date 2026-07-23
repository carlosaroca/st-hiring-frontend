export interface ApiFieldError {
  field: string;
  message: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: ApiFieldError[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ApiFieldError[];

  constructor(message: string, status: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Is the API running?', 0);
  }

  if (!response.ok) {
    const body: ApiErrorBody = await response.json().catch(() => ({}));

    throw new ApiError(
      body.message ?? `The request failed with status ${response.status}`,
      response.status,
      body.errors ?? [],
    );
  }

  return (await response.json()) as T;
};
