import zlib from 'zlib';

export default {
  deflateSync: (data) => zlib.deflateSync(data),
};
