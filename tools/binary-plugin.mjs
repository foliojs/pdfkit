import { readFile } from 'fs/promises';

/**
 * Bundles binary files (by extension) as base64 strings, so they can be
 * imported without reading them from disk at runtime.
 */
export default function binary(...extensions) {
  return {
    name: 'binary',
    enforce: 'pre',
    async load(id) {
      if (!extensions.some((extension) => id.endsWith(extension))) return null;

      const data = await readFile(id);
      return `export default ${JSON.stringify(data.toString('base64'))};`;
    },
  };
}
