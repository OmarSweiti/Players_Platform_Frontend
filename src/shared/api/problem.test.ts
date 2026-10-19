import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../../../tests/msw/server';
import { createApiClient, unwrap } from './client';
import { ApiProblem } from './problem';

const failure = (call: Promise<unknown>) =>
  call.then(
    () => {
      throw new Error('the call succeeded');
    },
    (error: unknown) => error,
  );

describe('problem details', () => {
  it('problem_details_expose_code_and_field_errors', async () => {
    server.use(
      http.get(`${location.origin}/health/live`, () =>
        HttpResponse.json(
          {
            type: 'urn:sadara:problem:validation-failed',
            title: 'Validation failed',
            status: 400,
            detail: 'تحقّق من الحقول المحدّدة.',
            instance: 'urn:uuid:8c22c808-fab2-4b88-988b-56cf1fe34f09',
            code: 'VALIDATION_FAILED',
            message: 'تحقّق من الحقول المحدّدة.',
            requestId: '8c22c808-fab2-4b88-988b-56cf1fe34f09',
            fieldErrors: [
              {
                field: '/dateOfBirth',
                code: 'INVALID_FORMAT',
                message: 'تحقّق من صيغة هذه القيمة.',
              },
            ],
          },
          {
            status: 400,
            headers: {
              'Content-Type': 'application/problem+json',
              'X-Request-Id': '8c22c808-fab2-4b88-988b-56cf1fe34f09',
            },
          },
        ),
      ),
    );

    const problem = await failure(
      unwrap(createApiClient({ locale: 'ar' }).GET('/health/live')),
    );

    expect(problem).toBeInstanceOf(ApiProblem);
    expect(problem).toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
      requestId: '8c22c808-fab2-4b88-988b-56cf1fe34f09',
      detail: 'تحقّق من الحقول المحدّدة.',
      fieldErrors: [{ field: '/dateOfBirth', code: 'INVALID_FORMAT' }],
    });
    // What may reach a log names the status and the code, never the answer.
    expect((problem as ApiProblem).message).toBe('400 VALIDATION_FAILED');
  });

  it('a_failure_that_is_not_a_problem_still_becomes_one', async () => {
    server.use(
      http.get(
        `${location.origin}/health/live`,
        () =>
          new HttpResponse('<html><body>Bad gateway</body></html>', {
            status: 502,
            headers: {
              'Content-Type': 'text/html',
              'X-Request-Id': 'proxy-request-1',
            },
          }),
      ),
    );

    const problem = await failure(
      unwrap(createApiClient({ locale: 'en' }).GET('/health/live')),
    );

    expect(problem).toBeInstanceOf(ApiProblem);
    expect(problem).toMatchObject({
      status: 502,
      code: 'INTERNAL_ERROR',
      requestId: 'proxy-request-1',
      fieldErrors: [],
      detail: '',
    });
  });
});
