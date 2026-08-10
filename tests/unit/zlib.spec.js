import zlib from 'zlib';
import nodeZlib from '../../lib/zlib/node';
import browserZlib from '../../lib/zlib/browser';

describe('zlib', () => {
  const data = Buffer.from('PDF FlateDecode stream '.repeat(50), 'binary');

  test.each([
    ['node', nodeZlib],
    ['browser', browserZlib],
  ])('%s deflateSync output inflates back to the input', (_, impl) => {
    const compressed = impl.deflateSync(data);

    expect(compressed).toBeInstanceOf(Uint8Array);
    expect(compressed.length).toBeLessThan(data.length);
    expect(Buffer.from(zlib.inflateSync(compressed))).toEqual(data);
  });
});
