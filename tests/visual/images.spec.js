import { runDocTest } from './helpers';

describe('images', function() {
  test('orientation', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);

      doc.text('EXIF orientation data may be present on some JPEG images.There are 8 exif orientation values:', 40, 10, {
        lineBreak: false
      });

      doc.text('1 - No orientation needed', 40, 30, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-1.jpeg', 40, 44.0625, {
        height: 80,
      });

      doc.text('(output)', 320, 30, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-1.jpeg', 320, 44.0625, {
        height: 80,
        obeyOrientation: true
      });

      doc.text('2 - Flip horizonatal', 40, 124.0625, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-2.jpeg', 40, 138.125, {
        height: 80,
      });

      doc.text('(output)', 320, 124.0625, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-2.jpeg', 320, 138.125, {
        height: 80,
        obeyOrientation: true
      });

      doc.text('3 - Rotate 180 degrees', 40, 218.125, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-3.jpeg', 40, 232.1875, {
        height: 80,
      });

      doc.text('(output)', 320, 218.125, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-3.jpeg', 320, 232.1875, {
        height: 80,
        obeyOrientation: true
      });

      doc.text('4 - Flip vertically', 40, 312.1875, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-4.jpeg', 40, 326.25, {
        height: 80,
      });

      doc.text('(output)', 320, 312.1875, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-4.jpeg', 320, 326.25, {
        height: 80,
        obeyOrientation: true
      });

      doc.text('5 - Flip horizontally and rotate 270 degrees CW', 40, 406.25, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-5.jpeg', 40, 420.3125, {
        height: 80,
      });

      doc.text('(output)', 320, 406.25, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-5.jpeg', 320, 420.3125, {
        height: 80,
        obeyOrientation: true
      });

      doc.text('6 - Rotate 90 degrees CW', 40, 500.3125, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-6.jpeg', 40, 514.375, {
        height: 80,
      });

      doc.text('(output)', 320, 500.3125, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-6.jpeg', 320, 514.375, {
        height: 80,
        obeyOrientation: true
      });

      doc.text('7 - Flip horizontally and rotate 90 degrees CW', 40, 594.375, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-7.jpeg', 40, 608.4375, {
        height: 80,
      });

      doc.text('(output)', 320, 594.375, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-7.jpeg', 320, 608.4375, {
        height: 80,
        obeyOrientation: true
      });

      doc.text('8 - Rotate 270 degrees CW', 40, 688.4375, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-8.jpeg', 40, 702.5, {
        height: 80,
      });

      doc.text('(output)', 320, 688.4375, {
        lineBreak: false,
      });

      doc.image('tests/images/orientation-8.jpeg', 320, 702.5, {
        height: 80,
        obeyOrientation: true
      });
    });
  });
});
