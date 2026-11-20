import { readFile } from 'fs/promises';

/**
 * Emits a source file as an asset at a fixed path in the Rollup output.
 */
export default function asset(sourcePath, outputPath) {
  return {
    name: 'asset',
    async buildStart() {
      this.emitFile({
        type: 'asset',
        fileName: outputPath,
        source: await readFile(sourcePath),
      });
    },
  };
}
