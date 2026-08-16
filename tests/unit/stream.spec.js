import { vi } from 'vitest';
import Readable from '../../lib/stream/browser';

const collect = (stream) =>
  new Promise((resolve) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(chunks));
  });

describe('browser stream', function () {
  test('replays chunks pushed before a listener is attached', async function () {
    const stream = new Readable();
    stream.push('a');
    stream.push('b');
    stream.push(null);

    expect(await collect(stream)).toEqual(['a', 'b']);
  });

  test('emits chunks pushed after a listener is attached', async function () {
    const stream = new Readable();
    const collected = collect(stream);

    stream.push('a');
    stream.push(null);

    expect(await collected).toEqual(['a']);
  });

  test('off removes a listener', function () {
    const stream = new Readable();
    const listener = vi.fn();

    stream.on('pageAdded', listener);
    stream.off('pageAdded', listener);
    stream.emit('pageAdded');

    expect(listener).not.toHaveBeenCalled();
  });

  test('once fires a single time', function () {
    const stream = new Readable();
    const listener = vi.fn();

    stream.once('pageAdded', listener);
    stream.emit('pageAdded');
    stream.emit('pageAdded');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('pipe writes every chunk and ends the destination', async function () {
    const stream = new Readable();
    const written = [];
    const destination = {
      write: (chunk) => written.push(chunk),
      end: vi.fn(),
    };

    stream.pipe(destination);
    stream.push('a');
    stream.push('b');
    stream.push(null);

    await new Promise((resolve) => stream.on('end', resolve));

    expect(written).toEqual(['a', 'b']);
    expect(destination.end).toHaveBeenCalled();
  });

  test('pipe waits for drain when the destination is full', async function () {
    const stream = new Readable();
    const written = [];
    let drain;
    const destination = {
      write: (chunk) => {
        written.push(chunk);
        return written.length !== 2;
      },
      end: vi.fn(),
      once: (event, listener) => {
        if (event === 'drain') drain = listener;
      },
    };

    stream.pipe(destination);
    stream.push('a');
    stream.push('b');
    stream.push('c');
    stream.push(null);

    await Promise.resolve();
    expect(written).toEqual(['a', 'b']);
    expect(destination.end).not.toHaveBeenCalled();

    drain();
    await new Promise((resolve) => stream.on('end', resolve));

    expect(written).toEqual(['a', 'b', 'c']);
    expect(destination.end).toHaveBeenCalled();
  });

  test('supports async iteration', async function () {
    const stream = new Readable();
    stream.push('a');
    stream.push('b');
    stream.push(null);

    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);

    expect(chunks).toEqual(['a', 'b']);
  });
});
