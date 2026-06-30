import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { isStagingDeploy } from '@/lib/app-environment';
import { reportException, reportSubmissionWarning } from '@/lib/monitoring';

export const runtime = 'nodejs';

// Netlify freezes the function as soon as the response is sent — flush so events actually upload.
async function flushSentryEvents() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  await Sentry.flush(2000);
}

// Staging-only endpoint to verify Sentry is receiving errors.
export async function GET(request: Request) {
  if (!isStagingDeploy()) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'message';

  if (mode === 'warning') {
    reportSubmissionWarning('Sentry staging test warning', {
      source: 'sentry-test',
      timestamp: new Date().toISOString(),
    });
    await flushSentryEvents();

    return NextResponse.json({
      ok: true,
      message: 'Warning sent to Sentry. Check Issues in the dashboard.',
    });
  }

  if (mode === 'exception') {
    reportException(new Error('Sentry staging test exception'), {
      source: 'sentry-test',
      mode: 'exception',
      timestamp: new Date().toISOString(),
    });
    await flushSentryEvents();

    return NextResponse.json({
      ok: true,
      message: 'Exception sent to Sentry. Check Issues in the dashboard.',
    });
  }

  reportException(new Error('Sentry staging test message'), {
    source: 'sentry-test',
    mode: 'message',
  });
  await flushSentryEvents();

  return NextResponse.json({
    ok: true,
    message: 'Test error sent to Sentry. Check Issues in the dashboard (may take ~30 seconds).',
    modes: {
      message: '/api/sentry-test',
      warning: '/api/sentry-test?mode=warning',
      exception: '/api/sentry-test?mode=exception',
    },
  });
}
