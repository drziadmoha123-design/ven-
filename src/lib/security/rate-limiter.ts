import { RATE_LIMITS } from "../../domain/constants";
import { RateLimitExceededError } from "../../domain/errors";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in ms
}

export interface RateLimiterInterface {
  consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
}

interface TimestampRecord {
  timestamps: number[];
}

export class MemoryRateLimiter implements RateLimiterInterface {
  private store = new Map<string, TimestampRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection every 5 minutes
    if (typeof setInterval !== "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  public async consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0];
      const resetAt = oldest + windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    record.timestamps.push(now);
    const remaining = limit - record.timestamps.length;
    const resetAt = record.timestamps[0] + windowMs;

    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  public async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async clearAll(): Promise<void> {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const maxRetentionMs = 24 * 60 * 60 * 1000; // 24 hours
    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > now - maxRetentionMs);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Global rate limiter singleton
export const rateLimiter = new MemoryRateLimiter();

/**
 * High-level rate limiting guards enforcing Section 84 RATE_LIMITS
 */
export async function assertLoginRateLimit(ip: string, email?: string): Promise<void> {
  const ipResult = await rateLimiter.consume(
    `login:ip:${ip}`,
    RATE_LIMITS.LOGIN_ATTEMPTS_PER_15_MIN_IP,
    15 * 60
  );
  if (!ipResult.allowed) {
    throw new RateLimitExceededError("Too many login attempts from this IP. Please try again in 15 minutes.");
  }

  if (email) {
    const emailResult = await rateLimiter.consume(
      `login:failed:${email.toLowerCase()}`,
      RATE_LIMITS.LOGIN_FAILED_ATTEMPTS_PER_15_MIN,
      15 * 60
    );
    if (!emailResult.allowed) {
      throw new RateLimitExceededError("Account temporarily locked due to failed attempts. Please try again in 15 minutes.");
    }
  }
}

export async function assertRegistrationRateLimit(ip: string): Promise<void> {
  const shortResult = await rateLimiter.consume(
    `reg:15m:${ip}`,
    RATE_LIMITS.REGISTRATIONS_PER_15_MIN_IP,
    15 * 60
  );
  if (!shortResult.allowed) {
    throw new RateLimitExceededError("Too many registration attempts. Please try again later.");
  }

  const dailyResult = await rateLimiter.consume(
    `reg:24h:${ip}`,
    RATE_LIMITS.REGISTRATIONS_PER_24_HOURS_IP,
    24 * 60 * 60
  );
  if (!dailyResult.allowed) {
    throw new RateLimitExceededError("Registration daily limit reached for this IP.");
  }
}

export async function assertPasswordResetRateLimit(ip: string, email: string): Promise<void> {
  const ipResult = await rateLimiter.consume(
    `pwd_reset:ip:${ip}`,
    RATE_LIMITS.PASSWORD_RESET_PER_15_MIN_IP,
    15 * 60
  );
  if (!ipResult.allowed) {
    throw new RateLimitExceededError("Too many password reset attempts. Please try again in 15 minutes.");
  }

  const emailResult = await rateLimiter.consume(
    `pwd_reset:email:${email.toLowerCase()}`,
    RATE_LIMITS.PASSWORD_RESET_PER_HOUR_EMAIL,
    60 * 60
  );
  if (!emailResult.allowed) {
    throw new RateLimitExceededError("Password reset limit exceeded for this email. Please try again in an hour.");
  }
}

export async function assertEmailVerificationResendRateLimit(email: string): Promise<void> {
  const res = await rateLimiter.consume(
    `email_resend:${email.toLowerCase()}`,
    RATE_LIMITS.EMAIL_VERIFICATION_RESEND_PER_HOUR,
    60 * 60
  );
  if (!res.allowed) {
    throw new RateLimitExceededError("Too many email verification requests. Please try again in an hour.");
  }
}
