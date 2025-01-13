import {
  deepClone,
  deepMerge,
  definedProps,
  normalizeSides,
} from '../../lib/utils';

describe('normalizeSides', () => {
  test.each([
    [1, { top: 1, right: 1, bottom: 1, left: 1 }],
    [[1, 2], { top: 1, right: 2, bottom: 1, left: 2 }],
    [
      { vertical: 1, horizontal: 2 },
      { top: 1, right: 2, bottom: 1, left: 2 },
    ],
    [[1, 2, 3, 4], { top: 1, right: 2, bottom: 3, left: 4 }],
    [
      { top: 1, right: 2, bottom: 3, left: 4 },
      { top: 1, right: 2, bottom: 3, left: 4 },
    ],
    [
      { a: 'hi' },
      { top: undefined, right: undefined, bottom: undefined, left: undefined },
    ],
    [
      { vertical: 'hi' },
      { top: 'hi', right: undefined, bottom: 'hi', left: undefined },
    ],
    [
      { top: undefined },
      { top: undefined, right: undefined, bottom: undefined, left: undefined },
    ],
    [
      null,
      { top: undefined, right: undefined, bottom: undefined, left: undefined },
    ],
    [
      undefined,
      { top: undefined, right: undefined, bottom: undefined, left: undefined },
    ],
    [true, { top: true, right: true, bottom: true, left: true }],
    [false, { top: false, right: false, bottom: false, left: false }],
  ])('%s -> %s', (size, expected) => {
    expect(normalizeSides(size)).toEqual(expected);
  });

  test('with transformer', () => {
    expect(
      normalizeSides(
        undefined,
        { top: '1', right: '2', bottom: '3', left: '4' },
        Number,
      ),
    ).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
  });
});

describe('definedProps', () => {
  test.each([
    [{}, {}],
    [{ a: 'hi' }, { a: 'hi' }],
    [{ a: undefined }, {}],
    [{ a: undefined, b: 1 }, { b: 1 }],
    [{ a: { b: undefined } }, { a: {} }],
    [{ a: { b: { c: undefined } } }, { a: { b: {} } }],
  ])('%o -> %o', (obj, expected) => {
    expect(definedProps(obj)).toEqual(expected);
  });
});

describe('deepMerge', () => {
  test.each([
    [{ a: 'hello' }, { b: 'world' }, { a: 'hello', b: 'world' }],
    [{ a: 'hello' }, { a: 'world' }, { a: 'world' }],
    [{}, { a: 'hello' }, { a: 'hello' }],
    [{ a: 'hello' }, undefined, { a: 'hello' }],
    [undefined, undefined, undefined],
    [1, 2, 1],
    [1, {}, 1],
    [{ a: 'hello' }, { a: {} }, { a: 'hello' }],
    [{ a: { b: 'hello' } }, { a: { b: 'world' } }, { a: { b: 'world' } }],
  ])('%o -> %o', function () {
    const opts = Array.from(arguments);
    const expected = opts.splice(-1, 1)[0];
    expect(deepMerge(...opts)).toEqual(expected);
  });
});

describe('deepClone', () => {
  test.each([
    [1],
    [true],
    ['hello'],
    [{ a: 'hello' }],
    [{ a: { b: 'hello' } }],
  ])('%s', (a) => {
    expect(deepClone(a)).toEqual(a);
  });
});
