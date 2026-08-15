import fs from '../../lib/fs/browser';

describe('browser fs', function () {
  test('readFileSync throws with the offending path', function () {
    expect(() => fs.readFileSync('fonts/Roboto.ttf')).toThrow(
      /Cannot read 'fonts\/Roboto\.ttf'/,
    );
  });

  test('statSync throws', function () {
    expect(() => fs.statSync('file.txt')).toThrow();
  });
});
