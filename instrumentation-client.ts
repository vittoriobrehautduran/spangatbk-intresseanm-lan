import * as Sentry from '@sentry/nextjs';
import { getSentryOptions } from './lib/sentry';

Sentry.init(getSentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
