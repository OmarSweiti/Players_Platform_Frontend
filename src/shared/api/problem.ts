import type { components } from './schema';

/** A failure, as the API answers every one: RFC 9457 problem details (docs/reference/api.md). */
export type ProblemDetails = components['schemas']['ProblemDetails'];
/** A stable code a screen may branch on. */
export type ProblemCode = ProblemDetails['code'];
/** One field the request got wrong: a JSON Pointer into what was sent, and why. */
export type FieldError = ProblemDetails['fieldErrors'][number];

/**
 * A failed API call, typed. `message` is the API's text for a person, in the
 * language the request asked for; `code` and each field error's `code` are
 * what a screen branches on. A failure that is not a problem — a proxy's
 * error page, a dropped connection's body — becomes an INTERNAL_ERROR with
 * the response's status, so a caller handles one kind of error. The error's
 * own message names only the status and the code: it may be logged, so it
 * never quotes the response.
 */
export class ApiProblem extends Error {
  override readonly name = 'ApiProblem';

  constructor(
    readonly status: number,
    readonly code: ProblemCode,
    /** Shown to the person, so support can find the request. */
    readonly requestId: string | undefined,
    readonly fieldErrors: readonly FieldError[],
    /** The API's message for a person, in the request's language; empty when none came. */
    readonly detail: string,
  ) {
    super(`${status} ${code}`);
  }

  /** The problem a failed response carries. */
  static from(response: Response, body: unknown): ApiProblem {
    const requestId = response.headers.get('X-Request-Id') ?? undefined;
    if (!isProblemDetails(body)) {
      return new ApiProblem(
        response.status,
        'INTERNAL_ERROR',
        requestId,
        [],
        '',
      );
    }
    return new ApiProblem(
      response.status,
      body.code,
      body.requestId,
      body.fieldErrors,
      body.message,
    );
  }
}

/** Whether a response body has the shape of the API's problem details. */
export function isProblemDetails(body: unknown): body is ProblemDetails {
  if (typeof body !== 'object' || body === null) return false;
  const problem = body as Record<string, unknown>;
  return (
    typeof problem.status === 'number' &&
    typeof problem.code === 'string' &&
    typeof problem.message === 'string' &&
    typeof problem.requestId === 'string' &&
    Array.isArray(problem.fieldErrors) &&
    problem.fieldErrors.every(
      (field: unknown) =>
        typeof field === 'object' &&
        field !== null &&
        typeof (field as Record<string, unknown>).field === 'string' &&
        typeof (field as Record<string, unknown>).code === 'string',
    )
  );
}
