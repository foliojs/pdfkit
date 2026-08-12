const unsupported = (path) => {
  throw new Error(
    `Cannot read '${path}': file paths are not supported outside of Node. ` +
      'Pass a Uint8Array, ArrayBuffer or a data URL instead.',
  );
};

export default {
  readFileSync: unsupported,
  statSync: unsupported,
};
