import { normalizeSides } from '../../lib/utils';

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
