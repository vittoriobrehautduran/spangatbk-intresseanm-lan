import { NextResponse } from 'next/server';
import { reportException, reportSubmissionWarning } from '@/lib/monitoring';

export const runtime = 'nodejs';

// Staging-only endpoint to verify Sentry is receiving errors.
export async function GET(request: Request) {
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV;

  if (environment !== 'staging') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'message';

  if (mode === 'warning') {
    reportSubmissionWarning('Sentry staging test warning', {
      source: 'sentry-test',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: 'Warning sent to Sentry. Check Issues in the dashboard.',
    });
  }

  if (mode === 'exception') {
    throw new Error('Sentry staging test exception');
  }

  reportException(new Error('Sentry staging test message'), {
    source: 'sentry-test',
    mode: 'message',
  });

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
