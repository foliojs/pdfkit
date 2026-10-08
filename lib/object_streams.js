/*
PDFObjectStreams - packs objects without a stream into compressed object
streams, and writes a cross-reference stream instead of the xref table (PDF 1.5)
*/

import PDFObject from './object';
import { fromBinaryString } from './binary';

// objects per object stream, and so the most held in memory at a time
const OBJECTS_PER_STREAM = 200;

// cross-reference stream entries: a 1-byte type, then 4-byte and 2-byte fields
const ENTRY_WIDTHS = [1, 4, 2];
const ENTRY_SIZE = 7;
const FREE = 0;
const UNCOMPRESSED = 1;
const COMPRESSED = 2;

class PDFObjectStreams {
  constructor(document, options) {
    if (document.version < 1.5) {
      throw new Error(
        "The objectStreams option requires a pdfVersion of '1.5' or higher",
      );
    }
    if (/^PDF\/A-1/.test(options.subset)) {
      throw new Error('PDF/A-1 does not allow object streams');
    }
    if (options.userPassword || options.ownerPassword) {
      throw new Error(
        'The objectStreams option cannot be used with encryption',
      );
    }

    this.document = document;
    this.pending = [];
    this.locations = new Map(); // object id -> [object stream id, index]
  }

  add(ref) {
    this.pending.push({ id: ref.id, body: PDFObject.convert(ref.data) });
    if (this.pending.length >= OBJECTS_PER_STREAM) {
      this.flush();
    }
  }

  flush() {
    if (!this.pending.length) {
      return;
    }

    const objects = this.pending;
    this.pending = [];

    // "id offset" pairs, then the objects, offsets relative to First
    let offset = 0;
    const pairs = [];
    for (const { id, body } of objects) {
      pairs.push(id, offset);
      offset += body.length + 1;
    }
    const header = pairs.join(' ') + '\n';

    const stream = this.document.ref({
      Type: 'ObjStm',
      N: objects.length,
      First: header.length,
    });
    stream.end(
      fromBinaryString(header + objects.map((o) => o.body).join('\n')),
    );

    objects.forEach(({ id }, index) => {
      this.locations.set(id, [stream.id, index]);
    });
  }

  finalize() {
    const doc = this.document;
    this.flush();

    const xref = doc.ref({
      Type: 'XRef',
      Root: doc._root,
      Info: doc._info,
      ID: [doc._id, doc._id],
    });
    const xrefOffset = doc._offset;
    if (xrefOffset > 0xffffffff) {
      // offsets are written in 4 bytes
      throw new Error('The objectStreams option cannot write files over 4 GB');
    }
    doc._offsets[xref.id - 1] = xrefOffset;

    // entries of [type, offset or object stream id, generation or index]
    const size = doc._offsets.length + 1;
    const table = new DataView(new ArrayBuffer(size * ENTRY_SIZE));
    const put = (id, type, field2, field3) => {
      const start = id * ENTRY_SIZE;
      table.setUint8(start, type);
      table.setUint32(start + 1, field2);
      table.setUint16(start + 5, field3);
    };

    put(0, FREE, 0, 0xffff);
    for (let id = 1; id < size; id++) {
      const location = this.locations.get(id);
      if (location) {
        put(id, COMPRESSED, ...location);
      } else {
        put(id, UNCOMPRESSED, doc._offsets[id - 1], 0);
      }
    }

    xref.data.Size = size;
    xref.data.W = ENTRY_WIDTHS;
    xref.end(new Uint8Array(table.buffer));

    doc._write('startxref');
    doc._write(`${xrefOffset}`);
    doc._write('%%EOF');
  }
}

export default PDFObjectStreams;
