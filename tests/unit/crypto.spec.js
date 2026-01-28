import { md5Hash, md5Hex } from '../../lib/crypto/md5';
import sha256Hash from '../../lib/crypto/sha256';
import { aesCbcEncrypt, aesEcbEncrypt } from '../../lib/crypto/aes';
import rc4 from '../../lib/crypto/rc4';
import randomBytes from '../../lib/crypto/random';

describe('crypto/md5', () => {
  test('md5Hash returns correct hash for string', () => {
    const result = md5Hash('hello');
    const hex = Array.from(result, (b) => b.toString(16).padStart(2, '0')).join(
      '',
    );
    expect(hex).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  test('md5Hash returns correct hash for Uint8Array', () => {
    const input = new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]); // "hello"
    const result = md5Hash(input);
    const hex = Array.from(result, (b) => b.toString(16).padStart(2, '0')).join(
      '',
    );
    expect(hex).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  test('md5Hex returns hex string', () => {
    expect(md5Hex('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  test('md5Hash empty string', () => {
    const hex = md5Hex('');
    expect(hex).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
});

describe('crypto/sha256', () => {
  test('sha256Hash returns correct hash', () => {
    const input = new TextEncoder().encode('hello');
    const result = sha256Hash(input);
    const hex = Array.from(result, (b) => b.toString(16).padStart(2, '0')).join(
      '',
    );
    expect(hex).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  test('sha256Hash empty input', () => {
    const result = sha256Hash(new Uint8Array(0));
    const hex = Array.from(result, (b) => b.toString(16).padStart(2, '0')).join(
      '',
    );
    expect(hex).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });
});

describe('crypto/rc4', () => {
  test('rc4 encrypts correctly with known test vector', () => {
    // Test vector: Key = "Key", Plaintext = "Plaintext"
    const key = new TextEncoder().encode('Key');
    const plaintext = new TextEncoder().encode('Plaintext');
    const ciphertext = rc4(plaintext, key);

    expect(ciphertext).toEqual(
      new Uint8Array([0xbb, 0xf3, 0x16, 0xe8, 0xd9, 0x40, 0xaf, 0x0a, 0xd3]),
    );
  });

  test('rc4 is symmetric (encrypt then decrypt)', () => {
    const key = new TextEncoder().encode('secret');
    const plaintext = new TextEncoder().encode('Hello, World!');

    const encrypted = rc4(plaintext, key);
    const decrypted = rc4(encrypted, key);

    expect(decrypted).toEqual(plaintext);
  });

  test('rc4 with different keys produces different output', () => {
    const key1 = new TextEncoder().encode('key1');
    const key2 = new TextEncoder().encode('key2');
    const plaintext = new TextEncoder().encode('test');

    const result1 = rc4(plaintext, key1);
    const result2 = rc4(plaintext, key2);

    expect(result1).not.toEqual(result2);
  });
});

describe('crypto/aes', () => {
  test('aesCbcEncrypt with padding', () => {
    // AES-128-CBC test
    const key = new Uint8Array(16).fill(0); // 16 zero bytes
    const iv = new Uint8Array(16).fill(0); // 16 zero bytes
    const plaintext = new TextEncoder().encode('hello'); // 5 bytes

    const result = aesCbcEncrypt(plaintext, key, iv, true);
    expect(result).toBeInstanceOf(Uint8Array);
    // With PKCS7 padding: 5 bytes -> 16 bytes (padded with 11 bytes of 0x0b)
    expect(result.length).toBe(16);
  });

  test('aesCbcEncrypt without padding', () => {
    const key = new Uint8Array(16).fill(0);
    const iv = new Uint8Array(16).fill(0);
    const plaintext = new Uint8Array(16).fill(0x41); // 16 'A's

    const result = aesCbcEncrypt(plaintext, key, iv, false);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(16);
  });

  test('aesCbcEncrypt with 256-bit key', () => {
    const key = new Uint8Array(32).fill(0); // 32 zero bytes (AES-256)
    const iv = new Uint8Array(16).fill(0);
    const plaintext = new TextEncoder().encode('test message'); // 12 bytes

    const result = aesCbcEncrypt(plaintext, key, iv, true);
    expect(result).toBeInstanceOf(Uint8Array);
    // With PKCS7 padding: 12 bytes -> 16 bytes
    expect(result.length).toBe(16);
  });

  test('aesEcbEncrypt', () => {
    const key = new Uint8Array(16).fill(0);
    const plaintext = new Uint8Array(16).fill(0);

    const result = aesEcbEncrypt(plaintext, key);
    expect(result).toEqual(
      // AES-128-ECB with all zeros: known result
      new Uint8Array([
        0x66, 0xe9, 0x4b, 0xd4, 0xef, 0x8a, 0x2c, 0x3b, 0x88, 0x4c, 0xfa, 0x59,
        0xca, 0x34, 0x2b, 0x2e,
      ]),
    );
  });
});

describe('crypto/random', () => {
  test('randomBytes returns Uint8Array of correct length', () => {
    const result = randomBytes(16);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(16);
  });

  test('randomBytes returns different values each time', () => {
    const result1 = randomBytes(16);
    const result2 = randomBytes(16);
    // Very unlikely to be equal
    expect(result1).not.toEqual(result2);
  });

  test('randomBytes with various lengths', () => {
    expect(randomBytes(0).length).toBe(0);
    expect(randomBytes(1).length).toBe(1);
    expect(randomBytes(32).length).toBe(32);
    expect(randomBytes(100).length).toBe(100);
  });
});
