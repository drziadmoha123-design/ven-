import { describe, it, expect } from 'vitest';
import { formatEGP, formatMoney } from '../lib/utils';

describe('Phase 00.5 — Workspace & Environment Baseline', () => {
  it('formats Egyptian Pound currency correctly (EGP / ج.م)', () => {
    const formatted = formatEGP(1500);
    expect(formatted).toContain('ج.م');
  });

  it('formats money correctly', () => {
    const formatted = formatMoney(1500);
    expect(formatted).toContain('ج.م');
  });

  it('verifies Node runtime environment', () => {
    expect(process.version).toBeDefined();
  });
});
