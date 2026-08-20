import { User, UserRole } from "@prisma/client";

/**
 * Public User Data Transfer Object
 * Strips all sensitive fields (passwordHash, internal secrets, raw tokens)
 */
export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  referralCode: string;
  referredById: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionDTO {
  id: string;
  userId: string;
  user: UserDTO;
  expiresAt: string;
  createdAt: string;
}

export interface AuthSuccessResponse {
  success: true;
  user: UserDTO;
  message?: string;
}

export interface AuthErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

/**
 * Transforms a raw Prisma User record into a safe, non-leaking UserDTO
 */
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    referralCode: user.referralCode,
    referredById: user.referredById,
    emailVerified: user.emailVerifiedAt !== null && user.emailVerifiedAt !== undefined,
    emailVerifiedAt: user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toISOString() : null,
    isActive: user.isActive,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
  };
}
