import { readFileSync } from 'fs';
import PDFDocument from '../../lib/document';
import { registerFile } from '../../lib/fs/node';
import { logData } from './helpers';

const fontPath = 'virtual/Roboto-Regular.ttf';
const imagePath = 'virtual/bee.jpg';
const attachmentPath = 'virtual/example.txt';

describe('registerFile consumers', () => {
  afterEach(() => {
    registerFile(fontPath, undefined);
    registerFile(imagePath, undefined);
    registerFile(attachmentPath, undefined);
  });

  test('loads a registered font path', () => {
    const font = new Uint8Array(readFileSync('tests/fonts/Roboto-Regular.ttf'));
    registerFile(fontPath, font);

    const document = new PDFDocument({ font: null });
    document.registerFont('Roboto', fontPath);

    expect(() => document.font('Roboto').text('Registered font')).not.toThrow();
    document.end();
  });

  test('loads a registered image path', () => {
    const image = new Uint8Array(readFileSync('tests/images/bee.jpg'));
    registerFile(imagePath, image);

    const document = new PDFDocument();

    expect(document.image(imagePath)).toBe(document);
    document.end();
  });

  test('reuses an attachment loaded from a registered path', () => {
    const document = new PDFDocument();
    const docData = logData(document);
    const birthtime = new Date('2020-01-02T03:04:05Z');
    const ctime = new Date('2021-02-03T04:05:06Z');
    registerFile(
      attachmentPath,
      new Uint8Array(new TextEncoder().encode('example text')),
      { birthtime, ctime },
    );

    document.file(attachmentPath, { name: 'example.txt' });
    document.file(attachmentPath, { name: 'example.txt' });
    document.end();

    const embeddedFiles = docData.filter(
      (item) =>
        typeof item === 'string' &&
        item.startsWith('<<\n/Type /EmbeddedFile\n'),
    );
    expect(embeddedFiles).toHaveLength(1);

    const output = docData.map((item) => item.toString()).join('\n');
    expect(output).toContain('/CreationDate (D:20200102030405Z)');
    expect(output).toContain('/ModDate (D:20210203040506Z)');
  });
});
