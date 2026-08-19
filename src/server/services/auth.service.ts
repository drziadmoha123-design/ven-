import { PrismaClient, UserRole, User, AuditAction } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma";
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  generateReferralCode,
} from "../../lib/security/crypto";
import { normalizeEgyptianPhone } from "../../lib/security/phone";
import { assertLoginRateLimit, rateLimiter } from "../../lib/security/rate-limiter";
import {
  ValidationError,
  UnauthenticatedError,
  ForbiddenError,
  ConflictError,
  InvalidReferralCodeError,
  SelfReferralError,
  RateLimitExceededError,
} from "../../domain/errors";
import { RATE_LIMITS } from "../../domain/constants";
import {
  RegisterInput,
  LoginInput,
  GoogleOAuthInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../validators/auth.schema";
import { UserDTO, toUserDTO } from "../../domain/types/auth";
import { SESSION_MAX_AGE_SECONDS } from "../auth/session";

export interface RegisterResult {
  user: UserDTO;
  sessionToken: string;
  verificationToken: string;
}

export interface LoginResult {
  user: UserDTO;
  sessionToken: string;
}

export interface GoogleOAuthResult {
  user: UserDTO;
  sessionToken: string;
  isNewUser: boolean;
}

export class AuthService {
  private prisma: PrismaClient;
  private googleClient: OAuth2Client | null = null;

  constructor(db: PrismaClient = prisma) {
    this.prisma = db;
  }

  private getGoogleClient(): OAuth2Client {
    if (!this.googleClient) {
      const clientId = process.env.GOOGLE_CLIENT_ID || "ven-google-client-id";
      this.googleClient = new OAuth2Client(clientId);
    }
    return this.googleClient;
  }

  /**
   * Customer Registration
   * - Normalizes email & phone
   * - Hashes password with Argon2id
   * - Enforces unique email
   * - Validates & attributes single referrer
   * - Generates unique immutable referral code
   * - Issues hashed email verification token
   * - Creates initial session & user cart in a transaction
   */
  public async register(
    input: RegisterInput,
    clientIp: string = "127.0.0.1"
  ): Promise<RegisterResult> {
    // Rate limit registration by IP
    const regLimit = await rateLimiter.consume(
      `register:ip:${clientIp}`,
      RATE_LIMITS.REGISTRATIONS_PER_15_MIN_IP,
      15 * 60
    );
    if (!regLimit.allowed) {
      throw new RateLimitExceededError("Too many registration attempts. Please try again later.");
    }

    const email = input.email.trim().toLowerCase();
    const phone = input.phone ? normalizeEgyptianPhone(input.phone) : null;

    // Check duplicate email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictError("An account with this email address already exists.");
    }

    // Optional phone duplicate check if provided
    if (phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone },
      });
      if (existingPhone) {
        throw new ConflictError("An account with this phone number already exists.");
      }
    }

    // Referral code attribution validation
    let referrer: User | null = null;
    if (input.referralCode) {
      const normalizedRefCode = input.referralCode.trim().toUpperCase();
      referrer = await this.prisma.user.findUnique({
        where: { referralCode: normalizedRefCode },
      });
      if (!referrer) {
        throw new InvalidReferralCodeError("The provided referral code is invalid.");
      }
      if (!referrer.isActive || referrer.archivedAt !== null) {
        throw new InvalidReferralCodeError("The referral code belongs to an inactive account.");
      }
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(input.password);

    // Generate unique referral code for this new customer
    let newReferralCode = generateReferralCode();
    let collisionCheck = await this.prisma.user.findUnique({
      where: { referralCode: newReferralCode },
    });
    let attempts = 0;
    while (collisionCheck && attempts < 5) {
      newReferralCode = generateReferralCode();
      collisionCheck = await this.prisma.user.findUnique({
        where: { referralCode: newReferralCode },
      });
      attempts++;
    }

    // Generate raw tokens
    const rawVerificationToken = generateSecureToken(32);
    const verificationTokenHash = hashToken(rawVerificationToken);
    const sessionToken = generateSecureToken(32);

    const now = new Date();
    const sessionExpiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
    const verificationExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    // Execute atomic registration transaction
    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: input.fullName.trim(),
          phone,
          role: UserRole.CUSTOMER, // Always CUSTOMER upon registration
          referralCode: newReferralCode,
          referredById: referrer ? referrer.id : null,
          pointsBalance: 0,
          isActive: true,
        },
      });

      // Create user cart
      await tx.cart.create({
        data: {
          userId: user.id,
        },
      });

      // Create email verification token
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: verificationTokenHash,
          expiresAt: verificationExpiresAt,
        },
      });

      // Create session
      await tx.session.create({
        data: {
          userId: user.id,
          sessionToken,
          expiresAt: sessionExpiresAt,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: AuditAction.CREATE,
          entity: "User",
          entityId: user.id,
          summary: `User registration: ${user.email}`,
          details: {
            email: user.email,
            role: user.role,
            referredById: user.referredById,
            clientIp,
          },
          ipAddress: clientIp,
        },
      });

      return user;
    });

    return {
      user: toUserDTO(createdUser),
      sessionToken,
      verificationToken: rawVerificationToken,
    };
  }

  /**
   * User Login
   * - Normalized email
   * - Argon2id password verification
   * - Generic invalid credentials error
   * - Account active check
   * - Sliding-window rate limiting
   * - Creates secure database session
   */
  public async login(input: LoginInput, clientIp: string = "127.0.0.1"): Promise<LoginResult> {
    const email = input.email.trim().toLowerCase();

    // Assert rate limiting
    await assertLoginRateLimit(clientIp, email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Timing-safe verification & generic error
    if (!user || !user.passwordHash) {
      // Dummy verify to mitigate timing attacks
      await verifyPassword(
        "$argon2id$v=19$m=65536,t=3,p=4$dummyhashdummyhashdummyhash$dummyhashdummyhashdummyhash",
        input.password
      );
      throw new UnauthenticatedError("Invalid email or password");
    }

    const isValidPassword = await verifyPassword(user.passwordHash, input.password);
    if (!isValidPassword) {
      throw new UnauthenticatedError("Invalid email or password");
    }

    if (!user.isActive || user.archivedAt !== null) {
      throw new ForbiddenError("Account is inactive or disabled. Please contact support.");
    }

    // Create session
    const sessionToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: AuditAction.SECURITY_EVENT,
        entity: "Session",
        entityId: user.id,
        summary: `User login success: ${user.email}`,
        details: {
          event: "LOGIN_SUCCESS",
          clientIp,
        },
        ipAddress: clientIp,
      },
    });

    return {
      user: toUserDTO(user),
      sessionToken,
    };
  }

  /**
   * Google OAuth Flow
   * Critical Invariants:
   * - Google OAuth MUST NEVER create or elevate an ADMIN
   * - New OAuth users MUST be CUSTOMER
   * - Safely links existing verified accounts
   */
  public async googleOAuth(
    input: GoogleOAuthInput,
    clientIp: string = "127.0.0.1"
  ): Promise<GoogleOAuthResult> {
    let googleId: string;
    let email: string;
    let fullName: string;

    try {
      const client = this.getGoogleClient();
      const ticket = await client.verifyIdToken({
        idToken: input.idToken,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new ValidationError("Invalid Google ID token payload");
      }
      googleId = payload.sub;
      email = payload.email.trim().toLowerCase();
      fullName = payload.name || payload.email.split("@")[0];
    } catch (err: unknown) {
      // In development or test if google client token is mocked
      if (process.env.NODE_ENV !== "production" && input.idToken.startsWith("mock_token_")) {
        googleId = `google_${input.idToken}`;
        email = `mock_${input.idToken.replace("mock_token_", "")}@example.com`.toLowerCase();
        fullName = "Mock Google User";
      } else {
        throw new UnauthenticatedError(
          `Google authentication failed: ${err instanceof Error ? err.message : "Invalid token"}`
        );
      }
    }

    // 1. Check if OAuth account already linked
    const existingOAuth = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleId,
        },
      },
      include: { user: true },
    });

    if (existingOAuth) {
      const user = existingOAuth.user;
      if (!user.isActive || user.archivedAt !== null) {
        throw new ForbiddenError("Account is inactive or disabled.");
      }

      const sessionToken = generateSecureToken(32);
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

      await this.prisma.session.create({
        data: {
          userId: user.id,
          sessionToken,
          expiresAt,
        },
      });

      return {
        user: toUserDTO(user),
        sessionToken,
        isNewUser: false,
      };
    }

    // 2. Check if User with same email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.isActive || existingUser.archivedAt !== null) {
        throw new ForbiddenError("Account is inactive or disabled.");
      }

      // Link OAuth account to existing user (does NOT change existing user role)
      const sessionToken = generateSecureToken(32);
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

      await this.prisma.$transaction(async (tx) => {
        await tx.oAuthAccount.create({
          data: {
            userId: existingUser.id,
            provider: "google",
            providerAccountId: googleId,
            email,
          },
        });

        // Set email as verified if not already
        if (!existingUser.emailVerifiedAt) {
          await tx.user.update({
            where: { id: existingUser.id },
            data: { emailVerifiedAt: new Date() },
          });
        }

        await tx.session.create({
          data: {
            userId: existingUser.id,
            sessionToken,
            expiresAt,
          },
        });
      });

      return {
        user: toUserDTO(existingUser),
        sessionToken,
        isNewUser: false,
      };
    }

    // 3. New User Registration via Google OAuth
    // Critical Invariant: New OAuth user is strictly CUSTOMER
    let referrer: User | null = null;
    if (input.referralCode) {
      const normalizedRefCode = input.referralCode.trim().toUpperCase();
      referrer = await this.prisma.user.findUnique({
        where: { referralCode: normalizedRefCode },
      });
      if (!referrer || !referrer.isActive || referrer.archivedAt !== null) {
        // Invalid referral code ignored or caught
        referrer = null;
      }
    }

    let newReferralCode = generateReferralCode();
    const sessionToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: null,
          fullName,
          role: UserRole.CUSTOMER, // MUST ALWAYS BE CUSTOMER
          referralCode: newReferralCode,
          referredById: referrer ? referrer.id : null,
          pointsBalance: 0,
          emailVerifiedAt: new Date(), // Google verified email
          isActive: true,
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: "google",
          providerAccountId: googleId,
          email,
        },
      });

      await tx.cart.create({
        data: {
          userId: user.id,
        },
      });

      await tx.session.create({
        data: {
          userId: user.id,
          sessionToken,
          expiresAt,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          actorRole: user.role,
          action: AuditAction.CREATE,
          entity: "User",
          entityId: user.id,
          summary: `OAuth user registered/linked: ${user.email}`,
          details: {
            provider: "google",
            email: user.email,
            role: user.role,
            clientIp,
          },
          ipAddress: clientIp,
        },
      });

      return user;
    });

    return {
      user: toUserDTO(newUser),
      sessionToken,
      isNewUser: true,
    };
  }

  /**
   * User Logout
   */
  public async logout(sessionToken: string): Promise<void> {
    if (!sessionToken) return;
    await this.prisma.session.deleteMany({
      where: { sessionToken },
    });
  }

  /**
   * Request Password Reset
   * - Generic anti-enumeration response
   * - Generates cryptographically secure SHA-256 hashed token
   * - 1 hour expiration
   */
  public async requestPasswordReset(
    input: ForgotPasswordInput,
    clientIp: string = "127.0.0.1"
  ): Promise<{ success: true; message: string; debugToken?: string }> {
    const email = input.email.trim().toLowerCase();

    // Check rate limit per IP & email
    const ipLimit = await rateLimiter.consume(
      `pwd_reset:ip:${clientIp}`,
      RATE_LIMITS.PASSWORD_RESET_PER_15_MIN_IP,
      15 * 60
    );
    if (!ipLimit.allowed) {
      throw new RateLimitExceededError("Too many password reset requests. Please try again later.");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    let rawToken: string | undefined;

    if (user && user.isActive && user.archivedAt === null) {
      rawToken = generateSecureToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.prisma.$transaction(async (tx) => {
        // Invalidate prior unused tokens
        await tx.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            usedAt: null,
          },
          data: {
            usedAt: new Date(),
          },
        });

        // Create new reset token
        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: user.id,
            actorEmail: user.email,
            actorRole: user.role,
            action: AuditAction.SECURITY_EVENT,
            entity: "PasswordResetToken",
            entityId: user.id,
            summary: `Password reset requested for ${user.email}`,
            details: {
              event: "PASSWORD_RESET_REQUESTED",
              clientIp,
            },
            ipAddress: clientIp,
          },
        });
      });
    }

    return {
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
      debugToken: process.env.NODE_ENV !== "production" ? rawToken : undefined,
    };
  }

  /**
   * Reset Password
   * - Verifies unconsumed, non-expired token
   * - Hashes new password with Argon2id
   * - One-time consumption of token
   * - Invalidates all active sessions for this user
   */
  public async resetPassword(
    input: ResetPasswordInput,
    clientIp: string = "127.0.0.1"
  ): Promise<{ success: true; message: string }> {
    const tokenHash = hashToken(input.token);

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
      throw new ValidationError("Invalid, expired, or already used password reset token.");
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await this.prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });

      // Update password hash
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash: newPasswordHash },
      });

      // CRITICAL: Invalidate all existing active sessions
      await tx.session.deleteMany({
        where: { userId: tokenRecord.userId },
      });

      await tx.auditLog.create({
        data: {
          actorId: tokenRecord.userId,
          actorEmail: tokenRecord.user.email,
          actorRole: tokenRecord.user.role,
          action: AuditAction.SECURITY_EVENT,
          entity: "User",
          entityId: tokenRecord.userId,
          summary: `Password reset completed for ${tokenRecord.user.email}`,
          details: {
            event: "PASSWORD_RESET_COMPLETED",
            clientIp,
          },
          ipAddress: clientIp,
        },
      });
    });

    return {
      success: true,
      message: "Password has been successfully reset. Please log in with your new credentials.",
    };
  }

  /**
   * Verify Email
   * - Verifies token hash
   * - Checks expiration and one-time use
   * - Sets emailVerifiedAt
   */
  public async verifyEmail(
    input: VerifyEmailInput,
    clientIp: string = "127.0.0.1"
  ): Promise<{ success: true; message: string }> {
    const tokenHash = hashToken(input.token);

    const tokenRecord = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
      throw new ValidationError("Invalid, expired, or already used email verification token.");
    }

    await this.prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });

      // Update emailVerifiedAt
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerifiedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorId: tokenRecord.userId,
          actorEmail: tokenRecord.user.email,
          actorRole: tokenRecord.user.role,
          action: AuditAction.SECURITY_EVENT,
          entity: "User",
          entityId: tokenRecord.userId,
          summary: `Email verified for ${tokenRecord.user.email}`,
          details: {
            event: "EMAIL_VERIFIED",
            clientIp,
          },
          ipAddress: clientIp,
        },
      });
    });

    return {
      success: true,
      message: "Email address has been successfully verified.",
    };
  }

  /**
   * Resend Verification Email
   */
  public async resendVerificationEmail(
    user: User,
    clientIp: string = "127.0.0.1"
  ): Promise<{ success: true; message: string; debugToken?: string }> {
    if (user.emailVerifiedAt) {
      return {
        success: true,
        message: "Email address is already verified.",
      };
    }

    const rateLimit = await rateLimiter.consume(
      `resend_verify:${user.id}`,
      RATE_LIMITS.EMAIL_VERIFICATION_RESEND_PER_HOUR,
      60 * 60
    );
    if (!rateLimit.allowed) {
      throw new RateLimitExceededError(
        "Too many verification email requests. Please try again later."
      );
    }

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    return {
      success: true,
      message: "A new email verification link has been sent.",
      debugToken: process.env.NODE_ENV !== "production" ? rawToken : undefined,
    };
  }
}

export const authService = new AuthService();
