import { createServiceClient } from './supabase/service';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if an IP address is within rate limits
 * @param ipAddress - The IP address to check
 * @param limit - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns Rate limit check result
 */
async function checkRateLimitWindow(
  ipAddress: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const supabase = createServiceClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  // Query rate limit records within the time window
  const { data, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', ipAddress)
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Rate limit query error:', error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: limit,
      resetTime: now.getTime() + windowSeconds * 1000,
    };
  }

  const count = data?.length || 0;
  const allowed = count < limit;
  const remaining = Math.max(0, limit - count);
  
  // Calculate reset time (oldest request in window + window duration)
  let resetTime = now.getTime() + windowSeconds * 1000;
  if (data && data.length > 0) {
    const oldestRequest = new Date(data[data.length - 1].created_at);
    resetTime = oldestRequest.getTime() + windowSeconds * 1000;
  }

  return {
    allowed,
    remaining,
    resetTime,
    retryAfter: allowed ? undefined : Math.ceil((resetTime - now.getTime()) / 1000),
  };
}

/**
 * Record a rate limit entry for an IP address
 * @param ipAddress - The IP address to record
 */
async function recordRateLimit(ipAddress: string): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('rate_limits')
    .insert({
      identifier: ipAddress,
      identifier_type: 'ip',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to record rate limit:', error);
    // Don't throw - rate limit recording failure shouldn't block the request
  }
}

/**
 * Check IP-based rate limits (5 per hour, 15 per day)
 * @param ipAddress - The IP address to check
 * @returns Rate limit check result
 */
export async function checkIPRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const HOUR_LIMIT = 5;
  const HOUR_WINDOW = 3600; // 1 hour in seconds
  const DAY_LIMIT = 15;
  const DAY_WINDOW = 86400; // 24 hours in seconds

  // Check hourly limit
  const hourlyCheck = await checkRateLimitWindow(ipAddress, HOUR_LIMIT, HOUR_WINDOW);
  if (!hourlyCheck.allowed) {
    return {
      allowed: false,
      remaining: hourlyCheck.remaining,
      resetTime: hourlyCheck.resetTime,
      retryAfter: hourlyCheck.retryAfter,
    };
  }

  // Check daily limit
  const dailyCheck = await checkRateLimitWindow(ipAddress, DAY_LIMIT, DAY_WINDOW);
  if (!dailyCheck.allowed) {
    return {
      allowed: false,
      remaining: dailyCheck.remaining,
      resetTime: dailyCheck.resetTime,
      retryAfter: dailyCheck.retryAfter,
    };
  }

  // Both checks passed
  return {
    allowed: true,
    remaining: Math.min(hourlyCheck.remaining, dailyCheck.remaining),
    resetTime: Math.min(hourlyCheck.resetTime, dailyCheck.resetTime),
  };
}

/**
 * Record a rate limit entry for an IP address
 * Call this after a successful request
 */
export async function recordIPRateLimit(ipAddress: string): Promise<void> {
  await recordRateLimit(ipAddress);
}

/**
 * Extract IP address from NextRequest
 * Handles X-Forwarded-For header (for Netlify/proxies)
 */
export function getIPAddress(request: { headers: Headers }): string {
  // Try X-Forwarded-For first (Netlify provides this)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0] || 'unknown';
  }

  // Fallback to other headers
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Try CF-Connecting-IP (Cloudflare) as another fallback
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  // Last resort
  return 'unknown';
}

