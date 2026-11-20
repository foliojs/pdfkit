import { toBlob, toBytes } from '../../lib/output';
import Readable from '../../lib/stream/browser';

describe('output helpers', function () {
  test('toBytes concatenates chunks in order', async function () {
    const stream = new Readable();
    const output = toBytes(stream);

    stream.push(new Uint8Array([1, 2]));
    stream.push(new Uint8Array([3]));
    stream.push(new Uint8Array([4, 5]));
    stream.push(null);

    const bytes = await output;

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(Array.from(bytes)).toEqual([1, 2, 3, 4, 5]);
  });

  test('toBlob creates an application/pdf Blob from the chunks', async function () {
    const stream = new Readable();
    const output = toBlob(stream);

    stream.push(new Uint8Array([1, 2]));
    stream.push(new Uint8Array([3, 4]));
    stream.push(null);

    const blob = await output;

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBe(4);
    expect(Array.from(new Uint8Array(await blob.arrayBuffer()))).toEqual([
      1, 2, 3, 4,
    ]);
  });

  test('supports empty output', async function () {
    const stream = new Readable();
    const output = toBytes(stream);

    stream.push(null);

    expect(await output).toEqual(new Uint8Array());
  });

  test('rejects errors and removes its listeners', async function () {
    const stream = new Readable();
    const output = toBytes(stream);
    const error = new Error('output failed');

    stream.emit('error', error);

    await expect(output).rejects.toBe(error);
    expect(stream._listeners.data).toEqual([]);
    expect(stream._listeners.end).toEqual([]);
    expect(stream._listeners.error).toEqual([]);
  });

  test('removes its listeners after successful collection', async function () {
    const stream = new Readable();
    const output = toBytes(stream);

    stream.push(null);
    await output;

    expect(stream._listeners.data).toEqual([]);
    expect(stream._listeners.end).toEqual([]);
    expect(stream._listeners.error).toEqual([]);
  });
});
