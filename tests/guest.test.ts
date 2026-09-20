import { describe, expect, it } from 'vitest';
import { guestFromSearch } from '../src/utils/guest';

describe('guest invitation details', () => {
  it('reads a valid personalized URL', () => expect(guestFromSearch('?guest=Nguyen%20Van%20A&side=groom')).toEqual({ guest: 'Nguyen Van A', side: 'groom' }));
  it('falls back safely for invalid input', () => expect(guestFromSearch('?guest=%3Cscript%3E&side=other')).toEqual({ guest: 'script', side: 'both' }));
  it('accepts every valid side and defaults a missing side to both', () => {
    expect(guestFromSearch('?side=bride').side).toBe('bride');
    expect(guestFromSearch('?side=both').side).toBe('both');
    expect(guestFromSearch('').side).toBe('both');
  });
  it('normalizes whitespace and limits long guest names', () => {
    const result = guestFromSearch(`?guest=${encodeURIComponent(`  ${'A'.repeat(90)}   Family  `)}`);
    expect(result.guest).toHaveLength(72);
    expect(result.guest.startsWith('A')).toBe(true);
    expect(result.guest).not.toContain('  ');
  });
});
