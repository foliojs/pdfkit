import { vi } from 'vitest';
import zlib from 'zlib';
import PDFDocument from '../../lib/document';

const options = {
  autoFirstPage: false,
  pdfVersion: '1.5',
  objectStreams: true,
};

// Returns the bytes of a document; `after` can end references once it ended
function build(docOptions, fn = (doc) => doc.addPage(), after) {
  const chunks = [];
  const push = PDFDocument.prototype.push;
  const spy = vi
    .spyOn(PDFDocument.prototype, 'push')
    .mockImplementation(function (chunk) {
      if (chunk) chunks.push(Buffer.from(chunk));
      return push.call(this, chunk);
    });
  try {
    const doc = new PDFDocument(docOptions);
    const state = fn(doc);
    doc.end();
    if (after) after(state);
  } finally {
    spy.mockRestore();
  }
  return Buffer.concat(chunks);
}

// Reads the stream object at offset: its id, dictionary and decoded data
function readStream(file, offset) {
  const text = file.toString('latin1', offset, offset + 2000);
  const [head, id, dict] = /^(\d+) 0 obj\n<<([\s\S]*?)>>\nstream\n/.exec(text);
  const start = offset + head.length;
  let data = file.subarray(
    start,
    start + Number(/\/Length (\d+)/.exec(dict)[1]),
  );
  if (dict.includes('/FlateDecode')) data = zlib.inflateSync(data);
  return { id: Number(id), dict, data };
}

// Resolves every object through the cross-reference stream: id -> the
// offset of a plain object, or the body of an object in an object stream
function parse(file) {
  const text = file.toString('latin1');
  const xref = readStream(
    file,
    Number(/startxref\n(\d+)\n%%EOF\n$/.exec(text)[1]),
  );
  expect(xref.dict).toContain('/Type /XRef');
  expect(xref.dict).toContain('/W [1 4 2]');
  const size = Number(/\/Size (\d+)/.exec(xref.dict)[1]);
  expect(xref.data.length).toBe(size * 7);

  const view = new DataView(xref.data.buffer, xref.data.byteOffset);
  const entry = (id) => [
    view.getUint8(id * 7),
    view.getUint32(id * 7 + 1),
    view.getUint16(id * 7 + 5),
  ];
  expect(entry(0)).toEqual([0, 0, 0xffff]);

  const objects = new Map();
  const streams = new Map();
  for (let id = 1; id < size; id++) {
    const [type, field2, index] = entry(id);
    if (type === 1) {
      expect(text.startsWith(`${id} 0 obj\n`, field2)).toBe(true);
      objects.set(id, { offset: field2 });
      continue;
    }
    expect(type).toBe(2);
    if (!streams.has(field2)) {
      const { dict, data } = readStream(file, entry(field2)[1]);
      expect(dict).toContain('/Type /ObjStm');
      const first = Number(/\/First (\d+)/.exec(dict)[1]);
      const body = data.toString('latin1');
      const pairs = body.slice(0, first).trim().split(' ').map(Number);
      expect(pairs.length).toBe(Number(/\/N (\d+)/.exec(dict)[1]) * 2);
      const members = [];
      for (let i = 0; i < pairs.length; i += 2) {
        const end = pairs[i + 3] ?? body.length - first;
        members.push([pairs[i], body.slice(first + pairs[i + 1], first + end)]);
      }
      streams.set(field2, members);
    }
    const [memberId, body] = streams.get(field2)[index];
    expect(memberId).toBe(id);
    objects.set(id, { body: body.trim() });
  }
  return { text, xref, objects, streams };
}

const bodies = ({ objects }) => [...objects.values()].map((o) => o.body);

describe('object streams', () => {
  test('are off by default', () => {
    const text = build({ autoFirstPage: false }).toString('latin1');
    expect(text).toContain('\nxref\n0 ');
    expect(text).toContain('\ntrailer\n');
    expect(text).not.toContain('/ObjStm');
  });

  test('hold every object without a stream, with a cross-reference stream', () => {
    const pdf = parse(
      build(options, (doc) => {
        doc.addPage();
        doc.text('Hello');
      }),
    );
    expect(pdf.text).not.toContain('\nxref\n');
    expect(pdf.text).not.toContain('\ntrailer\n');
    expect(pdf.xref.dict).toMatch(/\/ID \[<[0-9a-f]+> <[0-9a-f]+>\]/);

    const root = Number(/\/Root (\d+) 0 R/.exec(pdf.xref.dict)[1]);
    expect(pdf.objects.get(root).body).toContain('/Type /Catalog');
    const info = Number(/\/Info (\d+) 0 R/.exec(pdf.xref.dict)[1]);
    expect(pdf.objects.get(info).body).toContain('/Producer');

    // only streams, e.g. the page content, are left as plain objects
    for (const { offset } of pdf.objects.values()) {
      if (offset !== undefined) {
        expect(pdf.text.slice(offset).split('endobj')[0]).toContain(
          '\nstream\n',
        );
      }
    }
  });

  test('hold up to 200 objects each', () => {
    const pdf = parse(
      build(options, (doc) => {
        doc.addPage();
        for (let i = 0; i < 450; i++) doc.ref({ Index: i }).end();
      }),
    );
    const sizes = [...pdf.streams.values()].map((members) => members.length);
    expect(sizes.length).toBeGreaterThanOrEqual(3);
    expect(Math.max(...sizes)).toBe(200);
    const all = bodies(pdf).join(' ');
    for (let i = 0; i < 450; i++) expect(all).toContain(`/Index ${i}\n`);
  });

  test('include references ended after the document', () => {
    const file = build(
      options,
      (doc) => {
        doc.addPage();
        return doc.ref({ Late: true });
      },
      (late) => late.end(),
    );
    expect(bodies(parse(file))).toContainEqual(
      expect.stringContaining('/Late true'),
    );
  });

  test('work without compression', () => {
    const pdf = parse(build({ ...options, compress: false }));
    expect(pdf.xref.dict).not.toContain('/Filter');
    expect(bodies(pdf)).toContainEqual(expect.stringContaining('/Catalog'));
  });

  test('work with tagged PDF/A-2', () => {
    const pdf = parse(
      build(
        { ...options, pdfVersion: '1.7', subset: 'PDF/A-2', tagged: true },
        (doc) => {
          doc.addPage();
          doc.text('Hello');
        },
      ),
    );
    expect(bodies(pdf)).toContainEqual(
      expect.stringContaining('/StructTreeRoot'),
    );
  });

  test('throw when they cannot be used', () => {
    expect(() => new PDFDocument({ objectStreams: true })).toThrow(/1\.5/);
    expect(
      () =>
        new PDFDocument({ ...options, pdfVersion: '1.7', subset: 'PDF/A-1b' }),
    ).toThrow(/PDF\/A-1/);
    expect(
      () => new PDFDocument({ ...options, userPassword: 'secret' }),
    ).toThrow(/encryption/);
    expect(() =>
      build(options, (doc) => {
        doc.addPage();
        doc._offset = 2 ** 32; // as if 4 GB were already written
      }),
    ).toThrow(/4 GB/);
  });
});
