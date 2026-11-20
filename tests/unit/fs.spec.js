import { vi } from 'vitest';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import browserFs, {
  registerFile as registerBrowserFile,
} from '../../lib/fs/browser';
import nodeFs, { registerFile as registerNodeFile } from '../../lib/fs/node';

const browserPath = 'virtual/browser-file.bin';
const nodePath = 'tests/images/bee.jpg';
const nodeFileUrl = pathToFileURL(resolve(nodePath)).href;

describe('browser fs', function () {
  afterEach(() => {
    registerBrowserFile(browserPath, undefined);
    vi.useRealTimers();
  });

  test('readFileSync throws with the offending path', function () {
    expect(() => browserFs.readFileSync('fonts/Roboto.ttf')).toThrow(
      /Cannot read 'fonts\/Roboto\.ttf'/,
    );
  });

  test('statSync throws', function () {
    expect(() => browserFs.statSync('file.txt')).toThrow();
  });

  test('registers and replaces a Uint8Array at an exact path', function () {
    const first = new Uint8Array([1, 2, 3]);
    const replacement = new Uint8Array([4, 5]);

    registerBrowserFile(browserPath, first);
    expect(browserFs.readFileSync(browserPath)).toBe(first);
    expect(() => browserFs.readFileSync(`./${browserPath}`)).toThrow();

    registerBrowserFile(browserPath, replacement);
    expect(browserFs.readFileSync(browserPath)).toBe(replacement);
  });

  test('returns stable registration timestamps', function () {
    const registeredAt = new Date('2026-08-23T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(registeredAt);
    registerBrowserFile(browserPath, new Uint8Array([1]));

    vi.setSystemTime(new Date('2026-08-24T12:00:00Z'));
    const first = browserFs.statSync(browserPath);
    const second = browserFs.statSync(browserPath);

    expect(first.birthtime).toEqual(registeredAt);
    expect(first.ctime).toEqual(registeredAt);
    expect(second).toEqual(first);
    expect(second.birthtime).not.toBe(first.birthtime);
  });

  test('uses optional birthtime and ctime metadata', function () {
    const birthtime = new Date('2020-01-02T03:04:05Z');
    const ctime = new Date('2021-02-03T04:05:06Z');
    const expectedBirthtime = new Date(birthtime);
    const expectedCtime = new Date(ctime);

    registerBrowserFile(browserPath, new Uint8Array([1]), {
      birthtime,
      ctime,
    });
    birthtime.setTime(0);
    ctime.setTime(0);

    expect(browserFs.statSync(browserPath)).toEqual({
      birthtime: expectedBirthtime,
      ctime: expectedCtime,
    });
  });

  test('unregisters a path when data is undefined', function () {
    registerBrowserFile(browserPath, new Uint8Array([1]));
    registerBrowserFile(browserPath, undefined);

    expect(() => browserFs.readFileSync(browserPath)).toThrow();
    expect(() => browserFs.statSync(browserPath)).toThrow();
    expect(() => registerBrowserFile(browserPath, undefined)).not.toThrow();
  });

  test('validates path and data', function () {
    expect(() => registerBrowserFile(undefined, new Uint8Array())).toThrow(
      'Expected a string for path, got undefined',
    );

    for (const data of [new ArrayBuffer(1), 'data:,example', {}, null, 1]) {
      expect(() => registerBrowserFile(browserPath, data)).toThrow(
        `Expected a Uint8Array or undefined for data, got ${typeof data}`,
      );
    }
  });

  test('validates timestamp options', function () {
    const data = new Uint8Array([1]);

    expect(() => registerBrowserFile(browserPath, data, null)).toThrow(
      'Expected options to be an object',
    );
    expect(() =>
      registerBrowserFile(browserPath, data, { birthtime: '2020-01-01' }),
    ).toThrow('Expected options.birthtime to be a valid Date');
    expect(() =>
      registerBrowserFile(browserPath, data, { ctime: new Date('invalid') }),
    ).toThrow('Expected options.ctime to be a valid Date');
  });
});

describe('node fs', function () {
  afterEach(() => {
    registerNodeFile(nodePath, undefined);
    registerNodeFile(nodeFileUrl, undefined);
  });

  test('registered data takes precedence over the native filesystem', function () {
    const data = new Uint8Array([1, 2, 3]);
    registerNodeFile(nodePath, data);

    expect(nodeFs.readFileSync(nodePath)).toBe(data);
  });

  test('unregistering restores the native filesystem fallback', function () {
    registerNodeFile(nodePath, new Uint8Array([1, 2, 3]));
    registerNodeFile(nodePath, undefined);

    const data = nodeFs.readFileSync(nodePath);
    const stats = nodeFs.statSync(nodePath);

    expect(data.length).toBeGreaterThan(3);
    expect(stats.isFile()).toBe(true);
  });

  test('reads unregistered file URL strings from the native filesystem', function () {
    const data = nodeFs.readFileSync(nodeFileUrl);
    const stats = nodeFs.statSync(nodeFileUrl);

    expect(data.length).toBeGreaterThan(3);
    expect(stats.isFile()).toBe(true);
  });

  test('registered data takes precedence over a file URL', function () {
    const data = new Uint8Array([1, 2, 3]);
    registerNodeFile(nodeFileUrl, data);

    expect(nodeFs.readFileSync(nodeFileUrl)).toBe(data);
  });
});
