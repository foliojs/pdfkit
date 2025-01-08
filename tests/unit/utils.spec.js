import {normalizeSides} from '../../lib/utils';

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
    [{ a: 'hi' }, { top: { a: 'hi' }, right: { a: 'hi' }, bottom: { a: 'hi' }, left: { a: 'hi' } }],
    [
      { vertical: 'hi' },
      { top: 'hi', right: undefined, bottom: 'hi', left: undefined },
    ],
  ])('%s -> %s', (size, expected) => {
    expect(normalizeSides(size)).toEqual(expected);
  });

  test('with transformer', () => {
    expect(normalizeSides(undefined, { top: '1', right: '2', bottom: '3', left: '4' }, Number)).toEqual({
      top: 1,
      right: 2,
      bottom: 3,
      left: 4,
    });
  });
});
