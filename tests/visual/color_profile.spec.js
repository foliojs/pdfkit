import { runDocTest } from './helpers';
const fs = require('fs');

describe('color profile', function () {
  test('cmyk', function () {
    return runDocTest(function (doc) {
      const profileData = fs.readFileSync('tests/profiles/eciCMYK_v2.icc');
      doc.iccProfile('DefaultCMYK', profileData, 4, 'DeviceCMYK');
      doc.beingColorProfile('DefaultCMYK');

      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(100);
      doc
        .fillColor([(142 / 255) * 100, 0, (39 / 255) * 100, 0])
        .text('C', 100, 100);
      doc
        .fillColor([(67 / 255) * 100, (222 / 255) * 100, 0, 0])
        .text('M', 210, 100);
      doc
        .fillColor([(2 / 255) * 100, (4 / 255) * 100, (232 / 255) * 100, 0])
        .text('Y', 310, 100);
      doc
        .fillColor([
          (253 / 255) * 100,
          (251 / 255) * 100,
          (223 / 255) * 100,
          (230 / 255) * 100,
        ])
        .text('K', 410, 100);
    });
  });
});
