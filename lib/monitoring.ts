import * as Sentry from '@sentry/nextjs';

type SubmissionContext = Record<string, unknown>;

// Report a failed form submission (client or server).
export function reportSubmissionFailure(message: string, context?: SubmissionContext) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    scope.setTag('area', 'application-submit');
    scope.setLevel('error');
    if (context) {
      scope.setContext('submission', context);
    }
    Sentry.captureMessage(message);
  });
}

// Report a partial failure — e.g. DB down but email sent.
export function reportSubmissionWarning(message: string, context?: SubmissionContext) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    scope.setTag('area', 'application-submit');
    scope.setLevel('warning');
    if (context) {
      scope.setContext('submission', context);
    }
    Sentry.captureMessage(message);
  });
}

// Report unexpected exceptions with optional context.
export function reportException(error: unknown, context?: SubmissionContext) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('details', context);
    }
    Sentry.captureException(error);
  });
}
