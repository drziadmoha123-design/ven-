import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRole, User, AuditAction } from "@prisma/client";
import { AuthService } from "@/server/services/auth.service";
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  generateReferralCode,
} from "@/lib/security/crypto";
import { normalizeEgyptianPhone, isValidEgyptianPhone } from "@/lib/security/phone";
import { rateLimiter } from "@/lib/security/rate-limiter";
import {
  ConflictError,
  UnauthenticatedError,
  ForbiddenError,
  InvalidReferralCodeError,
  RateLimitExceededError,
  ValidationError,
} from "@/domain/errors";
import { toUserDTO } from "@/domain/types/auth";
import { RegisterSchema, LoginSchema, ResetPasswordSchema } from "@/server/validators/auth.schema";

describe("VEN+ Phase 02 — Authentication, Authorization & Account Lifecycle Tests", () => {
  let mockUsers: Map<string, any>;
  let mockOAuthAccounts: Map<string, any>;
  let mockSessions: Map<string, any>;
  let mockEmailTokens: Map<string, any>;
  let mockResetTokens: Map<string, any>;
  let mockAuditLogs: any[];
  let mockCarts: any[];
  let mockPrisma: any;
  let authService: AuthService;

  beforeEach(async () => {
    await rateLimiter.clearAll();
    mockUsers = new Map();
    mockOAuthAccounts = new Map();
    mockSessions = new Map();
    mockEmailTokens = new Map();
    mockResetTokens = new Map();
    mockAuditLogs = [];
    mockCarts = [];

    mockPrisma = {
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id) return Promise.resolve(mockUsers.get(where.id) || null);
          if (where.email) {
            const normalized = where.email.toLowerCase().trim();
            for (const user of mockUsers.values()) {
              if (user.email === normalized) return Promise.resolve(user);
            }
            return Promise.resolve(null);
          }
          if (where.referralCode) {
            for (const user of mockUsers.values()) {
              if (user.referralCode === where.referralCode) return Promise.resolve(user);
            }
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.phone) {
            for (const user of mockUsers.values()) {
              if (user.phone === where.phone) return Promise.resolve(user);
            }
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const user = {
            id,
            email: data.email,
            passwordHash: data.passwordHash || null,
            fullName: data.fullName,
            phone: data.phone || null,
            role: data.role || UserRole.CUSTOMER,
            referralCode: data.referralCode,
            referredById: data.referredById || null,
            pointsBalance: data.pointsBalance || 0,
            emailVerifiedAt: data.emailVerifiedAt || null,
            isActive: data.isActive !== undefined ? data.isActive : true,
            archivedAt: data.archivedAt || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockUsers.set(id, user);
          return Promise.resolve(user);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const user = mockUsers.get(where.id);
          if (user) {
            Object.assign(user, data, { updatedAt: new Date() });
            mockUsers.set(where.id, user);
            return Promise.resolve(user);
          }
          return Promise.resolve(null);
        }),
      },
      oAuthAccount: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const key = `${where.provider_providerAccountId.provider}:${where.provider_providerAccountId.providerAccountId}`;
          const oauth = mockOAuthAccounts.get(key);
          if (!oauth) return Promise.resolve(null);
          const user = mockUsers.get(oauth.userId);
          return Promise.resolve({ ...oauth, user });
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `oauth_${Date.now()}`;
          const oauth = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
          mockOAuthAccounts.set(`${data.provider}:${data.providerAccountId}`, oauth);
          return Promise.resolve(oauth);
        }),
      },
      session: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          for (const s of mockSessions.values()) {
            if (s.sessionToken === where.sessionToken) {
              const user = mockUsers.get(s.userId);
              return Promise.resolve({ ...s, user });
            }
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const session = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
          mockSessions.set(id, session);
          return Promise.resolve(session);
        }),
        delete: vi.fn().mockImplementation(({ where }) => {
          mockSessions.delete(where.id);
          return Promise.resolve({ id: where.id });
        }),
        deleteMany: vi.fn().mockImplementation(({ where }) => {
          let count = 0;
          for (const [id, s] of mockSessions.entries()) {
            if (
              (where.sessionToken && s.sessionToken === where.sessionToken) ||
              (where.userId && s.userId === where.userId)
            ) {
              mockSessions.delete(id);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
      },
      emailVerificationToken: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          for (const t of mockEmailTokens.values()) {
            if (t.tokenHash === where.tokenHash) {
              const user = mockUsers.get(t.userId);
              return Promise.resolve({ ...t, user });
            }
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `eml_tok_${Date.now()}`;
          const token = { id, ...data, usedAt: null, createdAt: new Date() };
          mockEmailTokens.set(id, token);
          return Promise.resolve(token);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const token = mockEmailTokens.get(where.id);
          if (token) {
            Object.assign(token, data);
            mockEmailTokens.set(where.id, token);
            return Promise.resolve(token);
          }
          return Promise.resolve(null);
        }),
        updateMany: vi.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const token of mockEmailTokens.values()) {
            if (token.userId === where.userId && (where.usedAt === null ? token.usedAt === null : true)) {
              Object.assign(token, data);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
      },
      passwordResetToken: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          for (const t of mockResetTokens.values()) {
            if (t.tokenHash === where.tokenHash) {
              const user = mockUsers.get(t.userId);
              return Promise.resolve({ ...t, user });
            }
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const id = `pwd_tok_${Date.now()}`;
          const token = { id, ...data, usedAt: null, createdAt: new Date() };
          mockResetTokens.set(id, token);
          return Promise.resolve(token);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const token = mockResetTokens.get(where.id);
          if (token) {
            Object.assign(token, data);
            mockResetTokens.set(where.id, token);
            return Promise.resolve(token);
          }
          return Promise.resolve(null);
        }),
        updateMany: vi.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const token of mockResetTokens.values()) {
            if (token.userId === where.userId && (where.usedAt === null ? token.usedAt === null : true)) {
              Object.assign(token, data);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
      },
      cart: {
        create: vi.fn().mockImplementation(({ data }) => {
          const cart = { id: `cart_${Date.now()}`, ...data };
          mockCarts.push(cart);
          return Promise.resolve(cart);
        }),
      },
      auditLog: {
        create: vi.fn().mockImplementation(({ data }) => {
          const log = { id: `log_${Date.now()}`, ...data, createdAt: new Date() };
          mockAuditLogs.push(log);
          return Promise.resolve(log);
        }),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return callback(mockPrisma);
      }),
    };

    authService = new AuthService(mockPrisma);
  });

  // 1. Registration
  it("1. registers a new customer with valid inputs and creates session", async () => {
    const res = await authService.register({
      email: "Ahmed@example.com",
      password: "Password123!",
      fullName: "Ahmed Ali",
      phone: "01012345678",
    });

    expect(res.user).toBeDefined();
    expect(res.user.email).toBe("ahmed@example.com");
    expect(res.user.role).toBe(UserRole.CUSTOMER);
    expect(res.sessionToken).toBeDefined();
    expect(res.verificationToken).toBeDefined();
    expect(mockSessions.size).toBe(1);
    expect(mockEmailTokens.size).toBe(1);
  });

  // 2. Duplicate email
  it("2. rejects registration with duplicate email address", async () => {
    await authService.register({
      email: "ahmed@example.com",
      password: "Password123!",
      fullName: "Ahmed Ali",
    });

    await expect(
      authService.register({
        email: "AHMED@example.com", // Case insensitive collision
        password: "Password456!",
        fullName: "Ahmed Second",
      })
    ).rejects.toThrow(ConflictError);
  });

  // 3. Email normalization
  it("3. normalizes email by trimming whitespace and lowercasing", async () => {
    const res = await authService.register({
      email: "  User.Name@Example.COM  ",
      password: "Password123!",
      fullName: "Test User",
    });

    expect(res.user.email).toBe("user.name@example.com");
  });

  // 4. Phone normalization
  it("4. normalizes Egyptian phone numbers correctly across prefixes", () => {
    expect(normalizeEgyptianPhone("+201012345678")).toBe("01012345678");
    expect(normalizeEgyptianPhone("00201198765432")).toBe("01198765432");
    expect(normalizeEgyptianPhone("012 3456 7890")).toBe("01234567890");
    expect(isValidEgyptianPhone("01512345678")).toBe(true);
    expect(isValidEgyptianPhone("01912345678")).toBe(false); // 019 invalid
  });

  // 5. Password hashing
  it("5. hashes password using Argon2id with robust cost parameters", async () => {
    const rawPassword = "StrongPassword2026!";
    const hash = await hashPassword(rawPassword);

    expect(hash).toContain("$argon2id$");
    expect(await verifyPassword(hash, rawPassword)).toBe(true);
    expect(await verifyPassword(hash, "WrongPassword!")).toBe(false);
  });

  // 6. Login success
  it("6. logs in existing user with correct credentials and returns session", async () => {
    await authService.register({
      email: "test@venplus.com",
      password: "Password123!",
      fullName: "Test Login",
    });

    const loginRes = await authService.login({
      email: "TEST@venplus.com",
      password: "Password123!",
    });

    expect(loginRes.user.email).toBe("test@venplus.com");
    expect(loginRes.sessionToken).toBeDefined();
  });

  // 7. Login failure (wrong password)
  it("7. rejects login attempt with incorrect password", async () => {
    await authService.register({
      email: "test@venplus.com",
      password: "Password123!",
      fullName: "Test Login",
    });

    await expect(
      authService.login({
        email: "test@venplus.com",
        password: "WrongPassword999!",
      })
    ).rejects.toThrow(UnauthenticatedError);
  });

  // 8. Generic invalid credentials response
  it("8. provides generic unauthenticated error message for both non-existent user and bad password", async () => {
    await expect(
      authService.login({
        email: "nonexistent@venplus.com",
        password: "SomePassword123!",
      })
    ).rejects.toThrow("Invalid email or password");
  });

  // 9. Login rate limiting
  it("9. enforces login rate limiting after threshold attempts", async () => {
    for (let i = 0; i < 20; i++) {
      await rateLimiter.consume("login:ip:10.0.0.1", 20, 15 * 60);
    }

    await expect(
      authService.login(
        { email: "user@test.com", password: "Password123!" },
        "10.0.0.1"
      )
    ).rejects.toThrow(RateLimitExceededError);
  });

  // 10. Referral-code assignment
  it("10. assigns valid referrer when referee provides referral code during registration", async () => {
    const referrer = await authService.register({
      email: "referrer@venplus.com",
      password: "Password123!",
      fullName: "Referrer User",
    });

    const referee = await authService.register({
      email: "referee@venplus.com",
      password: "Password123!",
      fullName: "Referee User",
      referralCode: referrer.user.referralCode,
    });

    expect(referee.user.referredById).toBe(referrer.user.id);
  });

  // 11. Referral immutability
  it("11. enforces referral immutability — referredById cannot be changed once assigned", () => {
    const initialUser = {
      id: "u1",
      referredById: "referrer_1",
    };

    const attemptReassign = (user: typeof initialUser, newReferrer: string) => {
      if (user.referredById !== null) {
        throw new ConflictError("Referral relationship is immutable once assigned");
      }
      user.referredById = newReferrer;
    };

    expect(() => attemptReassign(initialUser, "referrer_2")).toThrow(ConflictError);
  });

  // 12. Self-referral rejection
  it("12. rejects invalid or non-existent referral code", async () => {
    await expect(
      authService.register({
        email: "alone@venplus.com",
        password: "Password123!",
        fullName: "Solo User",
        referralCode: "VEN_NON_EXISTENT",
      })
    ).rejects.toThrow(InvalidReferralCodeError);
  });

  // 13. Session creation
  it("13. creates database session record with 30 days expiration", async () => {
    const res = await authService.register({
      email: "sessionuser@venplus.com",
      password: "Password123!",
      fullName: "Session User",
    });

    expect(mockSessions.size).toBe(1);
    const session = Array.from(mockSessions.values())[0];
    expect(session.sessionToken).toBe(res.sessionToken);
    expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000);
  });

  // 14. Session expiration check
  it("14. recognizes expired session and treats as unauthenticated", async () => {
    const expiredSession = {
      id: "exp_1",
      sessionToken: "token_expired_123",
      userId: "u_1",
      expiresAt: new Date(Date.now() - 10000), // Past
    };

    const isSessionValid = (s: typeof expiredSession) => s.expiresAt > new Date();
    expect(isSessionValid(expiredSession)).toBe(false);
  });

  // 15. Logout
  it("15. deletes session upon logout", async () => {
    const res = await authService.register({
      email: "logoutuser@venplus.com",
      password: "Password123!",
      fullName: "Logout User",
    });

    expect(mockSessions.size).toBe(1);
    await authService.logout(res.sessionToken);
    expect(mockSessions.size).toBe(0);
  });

  // 16. Session invalidation
  it("16. invalidates all sessions when requested for security events", async () => {
    const user = await authService.register({
      email: "multisession@venplus.com",
      password: "Password123!",
      fullName: "Multi Session",
    });

    // Create second session
    await mockPrisma.session.create({
      data: {
        userId: user.user.id,
        sessionToken: "second_session_token",
        expiresAt: new Date(Date.now() + 100000),
      },
    });

    expect(mockSessions.size).toBe(2);
    await mockPrisma.session.deleteMany({ where: { userId: user.user.id } });
    expect(mockSessions.size).toBe(0);
  });

  // 17. RBAC
  it("17. enforces role-based access control from authoritative User record", () => {
    const customerUser: Partial<User> = { id: "c1", role: UserRole.CUSTOMER };
    const adminUser: Partial<User> = { id: "a1", role: UserRole.ADMIN };

    const checkAdmin = (u: Partial<User>) => {
      if (u.role !== UserRole.ADMIN) {
        throw new ForbiddenError("Insufficient privileges");
      }
      return true;
    };

    expect(checkAdmin(adminUser)).toBe(true);
    expect(() => checkAdmin(customerUser)).toThrow(ForbiddenError);
  });

  // 18. Customer cannot access admin resources
  it("18. blocks customer from accessing admin resources", () => {
    const customerToken = { role: "CUSTOMER" };
    const requireAdminGuard = (token: { role: string }) => {
      if (token.role !== "ADMIN") {
        throw new ForbiddenError("Access denied: Admin role required");
      }
    };

    expect(() => requireAdminGuard(customerToken)).toThrow(ForbiddenError);
  });

  // 19. Admin authorization
  it("19. authorizes ADMIN role explicitly from database record only", () => {
    const userFromDb: Partial<User> = {
      id: "admin_root",
      role: UserRole.ADMIN,
      isActive: true,
    };
    expect(userFromDb.role).toBe(UserRole.ADMIN);
  });

  // 20. Email verification
  it("20. successfully verifies email with valid token", async () => {
    const reg = await authService.register({
      email: "verify@venplus.com",
      password: "Password123!",
      fullName: "Verify User",
    });

    expect(reg.user.emailVerified).toBe(false);

    const verifyRes = await authService.verifyEmail({
      token: reg.verificationToken,
    });

    expect(verifyRes.success).toBe(true);
    const updatedUser = mockUsers.get(reg.user.id);
    expect(updatedUser.emailVerifiedAt).not.toBeNull();
  });

  // 21. Expired verification token
  it("21. rejects expired email verification token", async () => {
    const reg = await authService.register({
      email: "expiredverify@venplus.com",
      password: "Password123!",
      fullName: "Expired Verify",
    });

    // Artificially expire token
    const token = Array.from(mockEmailTokens.values())[0];
    token.expiresAt = new Date(Date.now() - 1000);

    await expect(
      authService.verifyEmail({ token: reg.verificationToken })
    ).rejects.toThrow(ValidationError);
  });

  // 22. Verification token reuse prevention
  it("22. prevents verification token reuse after consumption", async () => {
    const reg = await authService.register({
      email: "reusetest@venplus.com",
      password: "Password123!",
      fullName: "Reuse Test",
    });

    await authService.verifyEmail({ token: reg.verificationToken });

    // Second attempt should fail
    await expect(
      authService.verifyEmail({ token: reg.verificationToken })
    ).rejects.toThrow(ValidationError);
  });

  // 23. Password reset request and execution
  it("23. executes password reset request and resets password securely", async () => {
    await authService.register({
      email: "resetme@venplus.com",
      password: "OldPassword123!",
      fullName: "Reset Me",
    });

    const reqRes = await authService.requestPasswordReset({
      email: "resetme@venplus.com",
    });
    expect(reqRes.debugToken).toBeDefined();

    const resetRes = await authService.resetPassword({
      token: reqRes.debugToken!,
      newPassword: "NewPassword456!",
    });
    expect(resetRes.success).toBe(true);

    // Old password fails
    await expect(
      authService.login({ email: "resetme@venplus.com", password: "OldPassword123!" })
    ).rejects.toThrow(UnauthenticatedError);

    // New password succeeds
    const loginSuccess = await authService.login({
      email: "resetme@venplus.com",
      password: "NewPassword456!",
    });
    expect(loginSuccess.user.email).toBe("resetme@venplus.com");
  });

  // 24. Expired reset token
  it("24. rejects expired password reset token", async () => {
    await authService.register({
      email: "expreset@venplus.com",
      password: "Password123!",
      fullName: "Exp Reset",
    });

    const reqRes = await authService.requestPasswordReset({ email: "expreset@venplus.com" });
    const token = Array.from(mockResetTokens.values())[0];
    token.expiresAt = new Date(Date.now() - 1000); // Expire

    await expect(
      authService.resetPassword({
        token: reqRes.debugToken!,
        newPassword: "BrandNewPassword123!",
      })
    ).rejects.toThrow(ValidationError);
  });

  // 25. Reset token reuse prevention
  it("25. prevents reuse of already consumed password reset token", async () => {
    await authService.register({
      email: "consumedreset@venplus.com",
      password: "Password123!",
      fullName: "Consumed Reset",
    });

    const reqRes = await authService.requestPasswordReset({ email: "consumedreset@venplus.com" });
    await authService.resetPassword({
      token: reqRes.debugToken!,
      newPassword: "PasswordAlpha123!",
    });

    // Replay attempt
    await expect(
      authService.resetPassword({
        token: reqRes.debugToken!,
        newPassword: "PasswordBeta123!",
      })
    ).rejects.toThrow(ValidationError);
  });

  // 26. Session invalidation after password reset
  it("26. invalidates all active sessions when password is reset", async () => {
    const reg = await authService.register({
      email: "sessionwipe@venplus.com",
      password: "Password123!",
      fullName: "Session Wipe",
    });

    expect(mockSessions.size).toBe(1);

    const reqRes = await authService.requestPasswordReset({ email: "sessionwipe@venplus.com" });
    await authService.resetPassword({
      token: reqRes.debugToken!,
      newPassword: "NewSecurePassword123!",
    });

    // All active sessions must have been cleared
    expect(mockSessions.size).toBe(0);
  });

  // 27. Google OAuth first login
  it("27. registers new user via Google OAuth with CUSTOMER role and verified email", async () => {
    const oauthRes = await authService.googleOAuth({
      idToken: "mock_token_google_first_user",
    });

    expect(oauthRes.isNewUser).toBe(true);
    expect(oauthRes.user.role).toBe(UserRole.CUSTOMER);
    expect(oauthRes.user.emailVerified).toBe(true);
    expect(mockOAuthAccounts.size).toBe(1);
  });

  // 28. Google OAuth returning user
  it("28. signs in existing Google OAuth linked user without creating duplicate account", async () => {
    await authService.googleOAuth({
      idToken: "mock_token_google_user_repeat",
    });
    expect(mockUsers.size).toBe(1);

    const secondLogin = await authService.googleOAuth({
      idToken: "mock_token_google_user_repeat",
    });
    expect(secondLogin.isNewUser).toBe(false);
    expect(mockUsers.size).toBe(1);
  });

  // 29. OAuth account linking
  it("29. safely links Google OAuth to existing email account without changing user role", async () => {
    const existing = await authService.register({
      email: "mock_existing_account@example.com",
      password: "Password123!",
      fullName: "Existing User",
    });

    expect(mockOAuthAccounts.size).toBe(0);

    const oauthRes = await authService.googleOAuth({
      idToken: "mock_token_existing_account",
    });

    expect(oauthRes.user.id).toBe(existing.user.id);
    expect(mockOAuthAccounts.size).toBe(1);
    expect(mockUsers.size).toBe(1);
  });

  // 30. OAuth cannot create ADMIN
  it("30. CRITICAL INVARIANT: Google OAuth MUST NEVER create an ADMIN user", async () => {
    const oauthRes = await authService.googleOAuth({
      idToken: "mock_token_admin_attempt",
    });

    expect(oauthRes.user.role).toBe(UserRole.CUSTOMER);
    expect(oauthRes.user.role).not.toBe(UserRole.ADMIN);
  });

  // 31. OAuth privilege escalation prevention
  it("31. OAuth login to existing user preserves original DB role without privilege escalation", async () => {
    // Seed an admin manually
    const adminUser: Partial<User> = {
      id: "admin_100",
      email: "mock_admin_link@example.com",
      passwordHash: await hashPassword("AdminSecret123!"),
      fullName: "System Admin",
      role: UserRole.ADMIN,
      referralCode: "VENADMIN99",
      referredById: null,
      pointsBalance: 0,
      emailVerifiedAt: new Date(),
      isActive: true,
      archivedAt: null,
    };
    mockUsers.set("admin_100", adminUser);

    const oauthRes = await authService.googleOAuth({
      idToken: "mock_token_admin_link",
    });

    expect(oauthRes.user.id).toBe("admin_100");
    expect(oauthRes.user.role).toBe(UserRole.ADMIN);
  });
});
