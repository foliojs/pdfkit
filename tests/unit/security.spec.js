import PDFSecurity from '../../lib/security';

// Mock document object
function createMockDocument(id = null) {
  const mockId =
    id ||
    new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  return {
    _id: mockId,
    ref: (obj) => ({
      data: obj,
      end: jest.fn(),
    }),
  };
}

describe('PDFSecurity', () => {
  describe('generateFileID', () => {
    test('returns 16-byte Buffer', () => {
      const info = {
        CreationDate: new Date('2024-01-01T00:00:00Z'),
        Title: 'Test',
      };
      const result = PDFSecurity.generateFileID(info);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBe(16);
    });

    test('same input produces same output', () => {
      const info = {
        CreationDate: new Date('2024-01-01T00:00:00Z'),
        Title: 'Test',
      };
      const result1 = PDFSecurity.generateFileID(info);
      const result2 = PDFSecurity.generateFileID(info);
      expect(result1).toEqual(result2);
    });

    test('different input produces different output', () => {
      const info1 = {
        CreationDate: new Date('2024-01-01T00:00:00Z'),
        Title: 'Test1',
      };
      const info2 = {
        CreationDate: new Date('2024-01-01T00:00:00Z'),
        Title: 'Test2',
      };
      const result1 = PDFSecurity.generateFileID(info1);
      const result2 = PDFSecurity.generateFileID(info2);
      expect(result1).not.toEqual(result2);
    });
  });

  describe('generateRandomWordArray', () => {
    test('returns Uint8Array of correct length', () => {
      const result = PDFSecurity.generateRandomWordArray(16);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(16);
    });

    test('returns different values each time', () => {
      const result1 = PDFSecurity.generateRandomWordArray(16);
      const result2 = PDFSecurity.generateRandomWordArray(16);
      expect(result1).not.toEqual(result2);
    });
  });

  describe('create', () => {
    test('returns null when no password provided', () => {
      const doc = createMockDocument();
      const result = PDFSecurity.create(doc, {});
      expect(result).toBeNull();
    });

    test('returns PDFSecurity instance when password provided', () => {
      const doc = createMockDocument();
      const result = PDFSecurity.create(doc, { userPassword: 'test' });
      expect(result).toBeInstanceOf(PDFSecurity);
    });
  });

  describe('constructor', () => {
    test('throws when no password provided', () => {
      const doc = createMockDocument();
      expect(() => new PDFSecurity(doc, {})).toThrow(
        'None of owner password and user password is defined.',
      );
    });
  });

  describe('Version 1 (PDF 1.3, 40-bit RC4)', () => {
    test('sets correct encryption parameters', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        ownerPassword: 'owner',
        pdfVersion: '1.3',
      });

      expect(security.version).toBe(1);
      expect(security.keyBits).toBe(40);
      expect(security.dictionary.data.V).toBe(1);
      expect(security.dictionary.data.R).toBe(2);
    });

    test('generates O and U entries', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        ownerPassword: 'owner',
        pdfVersion: '1.3',
      });

      expect(Buffer.isBuffer(security.dictionary.data.O)).toBe(true);
      expect(Buffer.isBuffer(security.dictionary.data.U)).toBe(true);
      expect(security.dictionary.data.O.length).toBe(32);
      expect(security.dictionary.data.U.length).toBe(32);
    });

    test('getEncryptFn returns function that encrypts data', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.3',
      });

      const encryptFn = security.getEncryptFn(1, 0);
      expect(typeof encryptFn).toBe('function');

      const plaintext = Buffer.from('Hello, World!');
      const encrypted = encryptFn(plaintext);
      expect(Buffer.isBuffer(encrypted)).toBe(true);
      expect(encrypted.length).toBe(plaintext.length);
      expect(encrypted).not.toEqual(plaintext);
    });
  });

  describe('Version 2 (PDF 1.4/1.5, 128-bit RC4)', () => {
    test('sets correct encryption parameters for PDF 1.4', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        pdfVersion: '1.4',
      });

      expect(security.version).toBe(2);
      expect(security.keyBits).toBe(128);
      expect(security.dictionary.data.V).toBe(2);
      expect(security.dictionary.data.R).toBe(3);
      expect(security.dictionary.data.Length).toBe(128);
    });

    test('sets correct encryption parameters for PDF 1.5', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        pdfVersion: '1.5',
      });

      expect(security.version).toBe(2);
      expect(security.keyBits).toBe(128);
    });

    test('getEncryptFn returns function that encrypts data', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.4',
      });

      const encryptFn = security.getEncryptFn(1, 0);
      const plaintext = Buffer.from('Test data');
      const encrypted = encryptFn(plaintext);

      expect(Buffer.isBuffer(encrypted)).toBe(true);
      expect(encrypted).not.toEqual(plaintext);
    });
  });

  describe('Version 4 (PDF 1.6/1.7, 128-bit AES)', () => {
    test('sets correct encryption parameters for PDF 1.6', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        pdfVersion: '1.6',
      });

      expect(security.version).toBe(4);
      expect(security.keyBits).toBe(128);
      expect(security.dictionary.data.V).toBe(4);
      expect(security.dictionary.data.R).toBe(4);
      expect(security.dictionary.data.CF.StdCF.CFM).toBe('AESV2');
    });

    test('sets correct encryption parameters for PDF 1.7', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        pdfVersion: '1.7',
      });

      expect(security.version).toBe(4);
      expect(security.dictionary.data.StmF).toBe('StdCF');
      expect(security.dictionary.data.StrF).toBe('StdCF');
    });

    test('getEncryptFn returns function that encrypts with AES', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.6',
      });

      const encryptFn = security.getEncryptFn(1, 0);
      const plaintext = Buffer.from('Test data for AES');
      const encrypted = encryptFn(plaintext);

      expect(Buffer.isBuffer(encrypted)).toBe(true);
      // AES output includes 16-byte IV prefix
      expect(encrypted.length).toBeGreaterThan(plaintext.length);
      // First 16 bytes are IV
      expect(encrypted.length).toBe(16 + 32); // IV + padded ciphertext
    });
  });

  describe('Version 5 (PDF 1.7ext3, 256-bit AES)', () => {
    test('sets correct encryption parameters', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        ownerPassword: 'owner',
        pdfVersion: '1.7ext3',
      });

      expect(security.version).toBe(5);
      expect(security.keyBits).toBe(256);
      expect(security.dictionary.data.V).toBe(5);
      expect(security.dictionary.data.R).toBe(5);
      expect(security.dictionary.data.CF.StdCF.CFM).toBe('AESV3');
    });

    test('generates all required entries', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'user',
        ownerPassword: 'owner',
        pdfVersion: '1.7ext3',
      });

      expect(Buffer.isBuffer(security.dictionary.data.O)).toBe(true);
      expect(Buffer.isBuffer(security.dictionary.data.U)).toBe(true);
      expect(Buffer.isBuffer(security.dictionary.data.OE)).toBe(true);
      expect(Buffer.isBuffer(security.dictionary.data.UE)).toBe(true);
      expect(Buffer.isBuffer(security.dictionary.data.Perms)).toBe(true);

      expect(security.dictionary.data.O.length).toBe(48);
      expect(security.dictionary.data.U.length).toBe(48);
      expect(security.dictionary.data.OE.length).toBe(32);
      expect(security.dictionary.data.UE.length).toBe(32);
      expect(security.dictionary.data.Perms.length).toBe(16);
    });

    test('getEncryptFn returns function that encrypts with AES-256', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.7ext3',
      });

      const encryptFn = security.getEncryptFn(1, 0);
      const plaintext = Buffer.from('Test data for AES-256');
      const encrypted = encryptFn(plaintext);

      expect(Buffer.isBuffer(encrypted)).toBe(true);
      expect(encrypted.length).toBeGreaterThan(plaintext.length);
    });
  });

  describe('Permissions', () => {
    test('R2 permissions (PDF 1.3)', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.3',
        permissions: {
          printing: true,
          modifying: true,
          copying: true,
          annotating: true,
        },
      });

      const p = security.dictionary.data.P;
      expect(p & 0b000000000100).toBeTruthy(); // printing
      expect(p & 0b000000001000).toBeTruthy(); // modifying
      expect(p & 0b000000010000).toBeTruthy(); // copying
      expect(p & 0b000000100000).toBeTruthy(); // annotating
    });

    test('R3 permissions (PDF 1.4+)', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.4',
        permissions: {
          printing: 'highResolution',
          modifying: true,
          copying: true,
          annotating: true,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: true,
        },
      });

      const p = security.dictionary.data.P;
      expect(p & 0b100000000100).toBeTruthy(); // high res printing
      expect(p & 0b000000001000).toBeTruthy(); // modifying
      expect(p & 0b000100000000).toBeTruthy(); // fillingForms
      expect(p & 0b001000000000).toBeTruthy(); // contentAccessibility
      expect(p & 0b010000000000).toBeTruthy(); // documentAssembly
    });

    test('low resolution printing', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.4',
        permissions: {
          printing: 'lowResolution',
        },
      });

      const p = security.dictionary.data.P;
      expect(p & 0b000000000100).toBeTruthy(); // printing allowed
      expect(p & 0b100000000000).toBeFalsy(); // but not high res
    });
  });

  describe('Password handling', () => {
    test('user password only', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'userpass',
        pdfVersion: '1.4',
      });

      expect(security.dictionary.data.O).toBeDefined();
      expect(security.dictionary.data.U).toBeDefined();
    });

    test('owner password only', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        ownerPassword: 'ownerpass',
        pdfVersion: '1.4',
      });

      expect(security.dictionary.data.O).toBeDefined();
      expect(security.dictionary.data.U).toBeDefined();
    });

    test('both passwords', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'userpass',
        ownerPassword: 'ownerpass',
        pdfVersion: '1.4',
      });

      expect(security.dictionary.data.O).toBeDefined();
      expect(security.dictionary.data.U).toBeDefined();
    });

    test('invalid password character throws', () => {
      const doc = createMockDocument();
      expect(() => {
        new PDFSecurity(doc, {
          userPassword: 'password\u0100', // Character > 0xFF
          pdfVersion: '1.3',
        });
      }).toThrow('Password contains one or more invalid characters.');
    });

    test('unicode password in R5', () => {
      const doc = createMockDocument();
      // R5 supports Unicode via SASLprep
      expect(() => {
        new PDFSecurity(doc, {
          userPassword: 'пароль', // Russian word for "password"
          pdfVersion: '1.7ext3',
        });
      }).not.toThrow();
    });
  });

  describe('Encryption consistency', () => {
    test('same password produces same encryption key', () => {
      const doc1 = createMockDocument();
      const doc2 = createMockDocument();

      const security1 = new PDFSecurity(doc1, {
        userPassword: 'test',
        pdfVersion: '1.4',
      });
      const security2 = new PDFSecurity(doc2, {
        userPassword: 'test',
        pdfVersion: '1.4',
      });

      expect(security1.encryptionKey).toEqual(security2.encryptionKey);
    });

    test('different object numbers produce different encrypted output', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.4',
      });

      const encryptFn1 = security.getEncryptFn(1, 0);
      const encryptFn2 = security.getEncryptFn(2, 0);

      const plaintext = Buffer.from('Same content');
      const encrypted1 = encryptFn1(plaintext);
      const encrypted2 = encryptFn2(plaintext);

      expect(encrypted1).not.toEqual(encrypted2);
    });
  });

  describe('end', () => {
    test('calls dictionary.end', () => {
      const doc = createMockDocument();
      const security = new PDFSecurity(doc, {
        userPassword: 'test',
        pdfVersion: '1.4',
      });

      security.end();
      expect(security.dictionary.end).toHaveBeenCalled();
    });
  });
});
