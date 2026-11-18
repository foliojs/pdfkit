import { sha256 } from '@noble/hashes/sha2.js';

export default function sha256Hash(data) {
  return sha256(data);
}
