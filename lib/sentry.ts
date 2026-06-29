import type { BrowserOptions, EdgeOptions, NodeOptions } from '@sentry/nextjs';

// Shared Sentry settings. Only active when NEXT_PUBLIC_SENTRY_DSN is set in the environment.
export function getSentryOptions(): NodeOptions & BrowserOptions & EdgeOptions {
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    environment,
    tracesSampleRate: isProduction ? 0.1 : 1,
    sendDefaultPii: false,
  };
}
