const collect = (document) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;

    const cleanup = () => {
      document.off('data', onData);
      document.off('end', onEnd);
      document.off('error', onError);
    };
    const onData = (chunk) => {
      chunks.push(chunk);
      length += chunk.byteLength;
    };
    const onEnd = () => {
      cleanup();
      resolve({ chunks, length });
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };

    document.on('data', onData);
    document.on('end', onEnd);
    document.on('error', onError);
  });

/**
 * Collects a PDF document into a Blob.
 *
 * Call this before ending the document so no output is missed.
 *
 * @experimental This API may change before it is stabilized.
 * @param {PDFDocument} document
 * @returns {Promise<Blob>}
 */
export async function toBlob(document) {
  const { chunks } = await collect(document);
  return new Blob(chunks, { type: 'application/pdf' });
}

/**
 * Collects a PDF document into a contiguous Uint8Array.
 *
 * Call this before ending the document so no output is missed.
 *
 * @experimental This API may change before it is stabilized.
 * @param {PDFDocument} document
 * @returns {Promise<Uint8Array>}
 */
export async function toBytes(document) {
  const { chunks, length } = await collect(document);
  const bytes = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return bytes;
}
