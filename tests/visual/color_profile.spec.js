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
      doc.fillColor([142, 0, 39, 0]).text('C', 100, 100);
      doc.fillColor([67, 222, 0, 0]).text('M', 210, 100);
      doc.fillColor([2, 4, 232, 0]).text('Y', 310, 100);
      doc.fillColor([253, 251, 223, 230]).text('K', 410, 100);
    });
  });
});
