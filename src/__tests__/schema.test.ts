import { describe, it, expect } from "vitest";
import {
  UserRole,
  PurchaseMode,
  FundingMode,
  PaymentMethod,
  OrderStatus,
  ConfirmationStatus,
  ConfirmationMethod,
  ConfirmationAttemptResult,
  OrderAmendmentStatus,
  PointsTransactionType,
  InventoryTransactionType,
  ReturnStatus,
  NotificationType,
  NotificationSeverity,
  ImportType,
  ImportStatus,
  ImportRowStatus,
  AuditAction,
} from "@prisma/client";
import {
  DOMAIN_DEFAULTS,
  SYSTEM_SETTING_KEYS,
  CONFIRMATION_EDITABLE_FIELDS,
  EXCEL_IMPORT_ALLOWED_FIELDS,
  RATE_LIMITS,
  RETENTION_POLICY_DAYS,
} from "@/domain/constants";

describe("VEN+ Phase 01 Schema & Domain Specification Audit", () => {
  describe("Enums & Domain Vocabulary", () => {
    it("should enforce exact UserRole values", () => {
      expect(UserRole.CUSTOMER).toBe("CUSTOMER");
      expect(UserRole.ADMIN).toBe("ADMIN");
      expect(Object.keys(UserRole)).toEqual(["CUSTOMER", "ADMIN"]);
    });

    it("should enforce exact PurchaseMode values", () => {
      expect(PurchaseMode.CASH).toBe("CASH");
      expect(PurchaseMode.POINTS).toBe("POINTS");
    });

    it("should enforce exact FundingMode values", () => {
      expect(FundingMode.CASH_ONLY).toBe("CASH_ONLY");
      expect(FundingMode.POINTS_ONLY).toBe("POINTS_ONLY");
      expect(FundingMode.MIXED).toBe("MIXED");
    });

    it("should enforce single PaymentMethod as CASH_ON_DELIVERY in Phase 1", () => {
      expect(PaymentMethod.CASH_ON_DELIVERY).toBe("CASH_ON_DELIVERY");
      expect(Object.keys(PaymentMethod)).toEqual(["CASH_ON_DELIVERY"]);
    });

    it("should define all valid OrderStatus lifecycle states", () => {
      const statuses = [
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CUSTOMER_REFUSED,
        OrderStatus.CANCELLED,
      ];
      expect(statuses).toHaveLength(7);
      expect(statuses).toContain("PENDING_CONFIRMATION");
      expect(statuses).toContain("CUSTOMER_REFUSED");
    });

    it("should define append-only PointsTransaction types", () => {
      const types = Object.values(PointsTransactionType);
      expect(types).toContain("ORDER_DELIVERED");
      expect(types).toContain("POINTS_PRODUCT_REDEMPTION");
      expect(types).toContain("POINTS_PRODUCT_REFUND");
      expect(types).toContain("FREE_SHIPPING_REDEMPTION");
      expect(types).toContain("FREE_SHIPPING_REFUND");
      expect(types).toContain("POINTS_REVERSAL");
      expect(types).toContain("REFERRAL_REWARD");
      expect(types).toContain("ADMIN_ADJUSTMENT");
    });

    it("should define append-only InventoryTransaction types", () => {
      const types = Object.values(InventoryTransactionType);
      expect(types).toContain("SALE_DEDUCTION");
      expect(types).toContain("CANCELLATION_RESTORATION");
      expect(types).toContain("RETURN_RESTORATION");
      expect(types).toContain("ADMIN_ADJUSTMENT");
      expect(types).toContain("AMENDMENT_ADJUSTMENT");
    });

    it("should define return verification workflow statuses", () => {
      const statuses = Object.values(ReturnStatus);
      expect(statuses).toContain("RETURN_IN_TRANSIT");
      expect(statuses).toContain("WAREHOUSE_RECEIVED");
      expect(statuses).toContain("WAREHOUSE_RETURN_VERIFIED");
      expect(statuses).toContain("REJECTED");
    });
  });

  describe("Commercial Defaults & Constants (Sections 23, 26, 33, 34, 36, 84)", () => {
    it("should verify standard Global Shipping Price is 70 EGP", () => {
      expect(DOMAIN_DEFAULTS.GLOBAL_SHIPPING_PRICE).toBe(70);
      expect(SYSTEM_SETTING_KEYS.GLOBAL_SHIPPING_PRICE).toBe("GLOBAL_SHIPPING_PRICE");
    });

    it("should verify Free Shipping Points Threshold is 200 Points", () => {
      expect(DOMAIN_DEFAULTS.FREE_SHIPPING_POINTS_THRESHOLD).toBe(200);
      expect(SYSTEM_SETTING_KEYS.FREE_SHIPPING_POINTS_THRESHOLD).toBe("FREE_SHIPPING_POINTS_THRESHOLD");
    });

    it("should verify Expected Delivery Duration is 2–3 Days", () => {
      expect(DOMAIN_DEFAULTS.EXPECTED_DELIVERY_DURATION).toBe("2–3 Days");
    });

    it("should verify Points Purchase Delivery Reward default is FALSE", () => {
      expect(DOMAIN_DEFAULTS.AWARD_DELIVERY_POINTS_ON_POINTS_REDEMPTION).toBe(false);
    });

    it("should verify Referral Reward is exactly 50 Points", () => {
      expect(DOMAIN_DEFAULTS.REFERRAL_REWARD_POINTS).toBe(50);
    });

    it("should verify Low Stock Threshold is 5 units", () => {
      expect(DOMAIN_DEFAULTS.LOW_STOCK_THRESHOLD).toBe(5);
    });
  });

  describe("Protected Field & Confirmation Whitelists (Sections 46, 94)", () => {
    it("should enforce confirmation editable field whitelist", () => {
      expect(CONFIRMATION_EDITABLE_FIELDS).toContain("fullName");
      expect(CONFIRMATION_EDITABLE_FIELDS).toContain("primaryPhone");
      expect(CONFIRMATION_EDITABLE_FIELDS).toContain("governorate");
      expect(CONFIRMATION_EDITABLE_FIELDS).toContain("cityOrCenter");

      // Critical forbidden mutations in standard confirmation
      const forbidden = ["total", "price", "unitPrice", "status", "pointsPrice", "quantity", "role"];
      forbidden.forEach((field) => {
        expect((CONFIRMATION_EDITABLE_FIELDS as readonly string[]).includes(field)).toBe(false);
      });
    });

    it("should enforce excel import editable field whitelist", () => {
      expect(EXCEL_IMPORT_ALLOWED_FIELDS).toContain("governorateSnapshot");
      expect(EXCEL_IMPORT_ALLOWED_FIELDS).toContain("citySnapshot");
      expect(EXCEL_IMPORT_ALLOWED_FIELDS).toContain("whatsappNumberSnapshot");

      const forbidden = ["cashSubtotal", "totalCashDue", "status", "orderStatus", "fundingMode"];
      forbidden.forEach((field) => {
        expect((EXCEL_IMPORT_ALLOWED_FIELDS as readonly string[]).includes(field)).toBe(false);
      });
    });
  });

  describe("Rate Limit & Retention Baselines (Sections 100, 101)", () => {
    it("should reflect authoritative rate limits", () => {
      expect(RATE_LIMITS.LOGIN_FAILED_ATTEMPTS_PER_15_MIN).toBe(5);
      expect(RATE_LIMITS.REGISTRATIONS_PER_15_MIN_IP).toBe(5);
      expect(RATE_LIMITS.PASSWORD_RESET_PER_15_MIN_IP).toBe(3);
      expect(RATE_LIMITS.CHECKOUT_ATTEMPTS_PER_MINUTE_USER).toBe(5);
      expect(RATE_LIMITS.ORDER_EXCEL_IMPORT_PER_HOUR_ADMIN).toBe(5);
      expect(RATE_LIMITS.DELIVERY_EXCEL_IMPORT_PER_HOUR_ADMIN).toBe(5);
    });

    it("should reflect authoritative retention durations", () => {
      expect(RETENTION_POLICY_DAYS.IDEMPOTENCY_RECORDS).toBe(7);
      expect(RETENTION_POLICY_DAYS.AUDIT_LOGS_MONTHS).toBe(24);
      expect(RETENTION_POLICY_DAYS.CUSTOMER_NOTIFICATIONS).toBe(90);
      expect(RETENTION_POLICY_DAYS.ADMIN_NOTIFICATIONS).toBe(180);
      expect(RETENTION_POLICY_DAYS.DATABASE_BACKUPS).toBe(30);
    });
  });
});
