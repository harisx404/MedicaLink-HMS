import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../utils/encryption';

describe('Encryption Utilities', () => {
  const testData = [
    { label: 'short string', value: 'Hello World' },
    { label: 'email address', value: 'patient@hospital.com' },
    { label: 'PAN number', value: '4111-1111-1111-1111' },
    { label: 'insurance ID', value: 'INS-2026-00012345' },
  ];

  testData.forEach(({ label, value }) => {
    it(`encrypts and decrypts a ${label} correctly`, () => {
      const encrypted = encrypt(value);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(value);
    });
  });

  it('produces ciphertext different from the plaintext', () => {
    const plaintext = 'sensitive-data-123';
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
  });

  it('produces different ciphertexts for the same plaintext (random IV/salt)', () => {
    const plaintext = 'same-input';
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('returns empty/falsy values as-is without encryption', () => {
    expect(encrypt('')).toBe('');
  });

  it('throws on corrupted ciphertext during decryption', () => {
    expect(() => decrypt('definitely-not-valid-base64-encrypted-data')).toThrow();
  });
});
