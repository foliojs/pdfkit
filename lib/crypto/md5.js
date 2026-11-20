import { md5 } from '@noble/hashes/legacy.js';
import { bytesToHex } from '@noble/hashes/utils.js';

export function md5Hash(data) {
  return md5.create().update(data).digest();
}

export function md5Hex(data) {
  return bytesToHex(md5Hash(data));
}
