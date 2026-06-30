// Figure out staging vs production from Netlify branch when env vars are the same everywhere.
export function getAppEnvironment(): string {
  const branch = process.env.BRANCH || process.env.NETLIFY_BRANCH;
  const context = process.env.CONTEXT || process.env.NETLIFY_CONTEXT;

  if (branch === 'staging') {
    return 'staging';
  }

  if (branch === 'main' || context === 'production') {
    return 'production';
  }

  if (context === 'deploy-preview' || context === 'branch-deploy') {
    return 'staging';
  }

  return process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
}

export function isStagingDeploy(): boolean {
  return getAppEnvironment() === 'staging';
}
