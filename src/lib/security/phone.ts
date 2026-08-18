/**
 * Egyptian Phone Number Normalization & Validation
 * Standard format: 11 digits starting with 010, 011, 012, or 015
 */

const EGYPTIAN_PHONE_REGEX = /^01[0125][0-9]{8}$/;

/**
 * Normalizes an input phone number to standard Egyptian 11-digit mobile format
 */
export function normalizeEgyptianPhone(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digit characters except leading +
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, "");
  
  // Handle international prefixes
  if (cleaned.startsWith("+20")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("0020")) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith("20") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Ensure leading 0 if 10 digits starting with 1
  if (cleaned.length === 10 && /^[1][0125]/.test(cleaned)) {
    cleaned = "0" + cleaned;
  }
  
  return cleaned;
}

/**
 * Validates whether a phone number matches standard Egyptian mobile carrier formats
 */
export function isValidEgyptianPhone(phone: string): boolean {
  const normalized = normalizeEgyptianPhone(phone);
  return EGYPTIAN_PHONE_REGEX.test(normalized);
}
