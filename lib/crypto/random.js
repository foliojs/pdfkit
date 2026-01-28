export default function randomBytes(length) {
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Node.js < 18.4 fallback
    require('crypto').randomFillSync(bytes);
  }
  return bytes;
}
