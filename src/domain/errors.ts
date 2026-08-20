/**
 * VEN+ Standard Error Taxonomy
 * Section 135 of MASTER_PROMPT.md
 */

export type ErrorTaxonomyCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_STATE_TRANSITION"
  | "INSUFFICIENT_STOCK"
  | "INVALID_REFERRAL_CODE"
  | "SELF_REFERRAL"
  | "REFERRAL_ALREADY_ASSIGNED"
  | "IDEMPOTENCY_CONFLICT"
  | "ALREADY_PROCESSED"
  | "PROTECTED_FIELD"
  | "IMPORT_INVALID"
  | "RATE_LIMITED"
  | "STORAGE_ERROR"
  | "EMAIL_ERROR"
  | "OAUTH_ERROR"
  | "INTERNAL_ERROR";

export class DomainError extends Error {
  public readonly code: ErrorTaxonomyCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorTaxonomyCode,
    message: string,
    statusCode: number = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class UnauthenticatedError extends DomainError {
  constructor(message: string = "Authentication required") {
    super("UNAUTHENTICATED", message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = "Access denied") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super("NOT_FOUND", `${entity}${id ? ` (${id})` : ""} not found`, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("CONFLICT", message, 409, details);
  }
}

export class InsufficientStockError extends DomainError {
  constructor(message: string = "Insufficient stock available for one or more items") {
    super("INSUFFICIENT_STOCK", message, 409);
  }
}

export class InvalidReferralCodeError extends DomainError {
  constructor(message: string = "Provided referral code is invalid or does not exist") {
    super("INVALID_REFERRAL_CODE", message, 400);
  }
}

export class SelfReferralError extends DomainError {
  constructor(message: string = "Self-referral is prohibited") {
    super("SELF_REFERRAL", message, 400);
  }
}

export class ReferralAlreadyAssignedError extends DomainError {
  constructor(message: string = "Referral code can only be set once during registration") {
    super("REFERRAL_ALREADY_ASSIGNED", message, 409);
  }
}

export class IdempotencyConflictError extends DomainError {
  constructor(message: string = "Request fingerprint does not match existing idempotency key") {
    super("IDEMPOTENCY_CONFLICT", message, 409);
  }
}

export class AlreadyProcessedError extends DomainError {
  constructor(message: string = "Operation has already been processed") {
    super("ALREADY_PROCESSED", message, 200);
  }
}

export class ProtectedFieldMutationError extends DomainError {
  constructor(field: string) {
    super("PROTECTED_FIELD", `Modification of protected field '${field}' is strictly prohibited`, 403);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor(message: string = "Invalid email or password") {
    super("UNAUTHENTICATED", message, 401);
  }
}

export class RateLimitExceededError extends DomainError {
  constructor(message: string = "Too many requests. Please try again later.") {
    super("RATE_LIMITED", message, 429);
  }
}

export class UnverifiedEmailError extends DomainError {
  constructor(message: string = "Email verification is required to perform this action") {
    super("FORBIDDEN", message, 403);
  }
}

export class OAuthError extends DomainError {
  constructor(message: string = "OAuth authentication failed") {
    super("OAUTH_ERROR", message, 400);
  }
}

