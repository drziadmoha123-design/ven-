import { describe, it, expect } from 'vitest';
import { formatEGP, formatPoints } from '../lib/utils';

describe('Phase 00.5 — Workspace & Environment Baseline', () => {
  it('formats Egyptian Pound currency correctly (EGP / ج.م)', () => {
    const formatted = formatEGP(1500);
    expect(formatted).toContain('ج.م');
  });

  it('formats Points correctly', () => {
    const formatted = formatPoints(500);
    expect(formatted).toContain('نقطة');
  });

  it('verifies Node runtime environment', () => {
    expect(process.version).toBeDefined();
  });
});
