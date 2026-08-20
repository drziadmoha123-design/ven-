/**
 * VEN+ Authoritative Commercial and Domain Constants
 * Single Source of Truth matching MASTER_PROMPT.md specifications
 */

export const DOMAIN_DEFAULTS = {
  /**
   * Section 33 & 84: Global Shipping Price default in EGP
   */
  GLOBAL_SHIPPING_PRICE: 70,

  /**
   * Section 36 & 84: Expected delivery duration label
   */
  EXPECTED_DELIVERY_DURATION: "2–3 Days",

  /**
   * Section 84: Stock threshold that triggers a low stock operational notification
   */
  LOW_STOCK_THRESHOLD: 5,
} as const;

export const SYSTEM_SETTING_KEYS = {
  GLOBAL_SHIPPING_PRICE: "GLOBAL_SHIPPING_PRICE",
  EXPECTED_DELIVERY_DURATION: "EXPECTED_DELIVERY_DURATION",
  LOW_STOCK_THRESHOLD: "LOW_STOCK_THRESHOLD",
} as const;

export const RETENTION_POLICY_DAYS = {
  IDEMPOTENCY_RECORDS: 7,
  OPERATIONAL_LOGS: 90,
  CUSTOMER_NOTIFICATIONS: 90,
  ADMIN_NOTIFICATIONS: 180,
  RAW_IMPORT_FILES: 90,
  DATABASE_BACKUPS: 30,
  AUDIT_LOGS_MONTHS: 24,
  IMPORT_METADATA_MONTHS: 24,
  DIGEST_EXECUTION_MONTHS: 24,
} as const;

export const RATE_LIMITS = {
  LOGIN_FAILED_ATTEMPTS_PER_15_MIN: 5,
  LOGIN_ATTEMPTS_PER_15_MIN_IP: 20,
  REGISTRATIONS_PER_15_MIN_IP: 5,
  REGISTRATIONS_PER_24_HOURS_IP: 20,
  PASSWORD_RESET_PER_15_MIN_IP: 3,
  PASSWORD_RESET_PER_HOUR_EMAIL: 3,
  EMAIL_VERIFICATION_RESEND_PER_HOUR: 3,
  CHECKOUT_ATTEMPTS_PER_MINUTE_USER: 5,
  CHECKOUT_ATTEMPTS_PER_HOUR_USER: 20,
  SEARCH_PER_MINUTE_IP: 60,
  ORDER_EXCEL_IMPORT_PER_HOUR_ADMIN: 5,
  DELIVERY_EXCEL_IMPORT_PER_HOUR_ADMIN: 5,
  IMAGE_UPLOAD_PER_HOUR_ADMIN: 60,
  ADMIN_SENSITIVE_MUTATIONS_PER_MINUTE: 100,
} as const;

/**
 * Fields that can be safely updated during order confirmation or excel order import
 * Section 46 & 94 of MASTER_PROMPT.md
 */
export const CONFIRMATION_EDITABLE_FIELDS = [
  "fullName",
  "primaryPhone",
  "secondaryPhone",
  "whatsappNumber",
  "governorate",
  "cityOrCenter",
  "area",
  "street",
  "buildingNumber",
  "floor",
  "apartmentNumber",
  "landmark",
  "addressNotes",
] as const;

export const EXCEL_IMPORT_ALLOWED_FIELDS = [
  "secondaryPhoneSnapshot",
  "whatsappNumberSnapshot",
  "governorateSnapshot",
  "citySnapshot",
  "areaSnapshot",
  "streetSnapshot",
  "buildingNumberSnapshot",
  "floorSnapshot",
  "apartmentNumberSnapshot",
  "landmarkSnapshot",
  "addressNotesSnapshot",
] as const;
