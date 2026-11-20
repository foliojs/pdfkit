const unsupported = (path) => {
  throw new Error(
    `Cannot read '${path}': file paths are not supported outside of Node. ` +
      'Pass a Uint8Array, ArrayBuffer or a data URL instead.',
  );
};

const registeredFiles = new Map();

const getTimestamp = (value, name, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeError(`Expected options.${name} to be a valid Date`);
  }

  return value.getTime();
};

/**
 * @param {string} path
 * @param {Uint8Array|undefined} data
 * @param {{birthtime?: Date, ctime?: Date}} [options]
 */
export function registerFile(path, data, options = {}) {
  if (typeof path !== 'string') {
    throw new TypeError(`Expected a string for path, got ${typeof path}`);
  }

  if (data === undefined) {
    registeredFiles.delete(path);
    return;
  }

  if (!(data instanceof Uint8Array)) {
    throw new TypeError(
      `Expected a Uint8Array or undefined for data, got ${typeof data}`,
    );
  }

  if (options === null || typeof options !== 'object') {
    throw new TypeError(`Expected options to be an object`);
  }

  const registeredAt = Date.now();
  registeredFiles.set(path, {
    data,
    birthtime: getTimestamp(options.birthtime, 'birthtime', registeredAt),
    ctime: getTimestamp(options.ctime, 'ctime', registeredAt),
  });
}

export default {
  readFileSync(path) {
    if (registeredFiles.has(path)) {
      return registeredFiles.get(path).data;
    }

    return unsupported(path);
  },
  statSync(path) {
    if (registeredFiles.has(path)) {
      const { birthtime, ctime } = registeredFiles.get(path);
      return {
        birthtime: new Date(birthtime),
        ctime: new Date(ctime),
      };
    }

    return unsupported(path);
  },
};
