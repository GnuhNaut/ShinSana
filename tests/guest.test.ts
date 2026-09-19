import { describe, expect, it } from 'vitest';
import { guestFromSearch } from '../src/utils/guest';

describe('guest invitation details', () => {
  it('reads a valid personalized URL', () => expect(guestFromSearch('?guest=Nguyen%20Van%20A&side=groom')).toEqual({ guest: 'Nguyen Van A', side: 'groom' }));
  it('falls back safely for invalid input', () => expect(guestFromSearch('?guest=%3Cscript%3E&side=other')).toEqual({ guest: 'script', side: 'both' }));
});
