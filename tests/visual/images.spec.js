import { runDocTest } from './helpers';

describe('images', function() {
  test('orientation', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);

      doc.text(
        'EXIF orientation data may be present on some JPEG images.There are 8 exif orientation values:',
        40,
        10,
        {
          lineBreak: false
        }
      );

      doc.text('1 - No orientation needed', 40, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 40, 44.0625, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 320, 44.0625, {
        height: 80
      });

      doc.text('2 - Flip horizonatal', 40, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 40, 138.125, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 320, 138.125, {
        height: 80
      });

      doc.text('3 - Rotate 180 degrees', 40, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 40, 232.1875, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 320, 232.1875, {
        height: 80
      });

      doc.text('4 - Flip vertically', 40, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 40, 326.25, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 320, 326.25, {
        height: 80
      });

      doc.text('5 - Flip horizontally and rotate 270 degrees CW', 40, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 40, 420.3125, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 320, 420.3125, {
        height: 80
      });

      doc.text('6 - Rotate 90 degrees CW', 40, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 40, 514.375, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 320, 514.375, {
        height: 80
      });

      doc.text('7 - Flip horizontally and rotate 90 degrees CW', 40, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 40, 608.4375, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 320, 608.4375, {
        height: 80
      });

      doc.text('8 - Rotate 270 degrees CW', 40, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 40, 702.5, {
        height: 80,
        ignoreOrientation: true
      });

      doc.text('(output)', 320, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 320, 702.5, {
        height: 80
      });
    });
  });

  test('orientation - with cover and alignment', function() {
    return runDocTest(function(doc) {
      let options = {
        align: 'center',
        cover: [60, 60],
        valign: 'center'
      };

      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);

      doc.text(
        'Images with EXIF orientation should properly align with fit/cover options:',
        40,
        10,
        {
          lineBreak: false
        }
      );

      // Orientation 1
      doc.text('1 - No orientation needed', 40, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 40, 44.0625, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 44.0625, 60, 60).stroke('red');

      doc.text('(output)', 320, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 320, 44.0625, options);

      doc.rect(320, 44.0625, 60, 60).stroke('red');

      // Orientation 2
      doc.text('2 - Flip horizonatal', 40, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 40, 138.125, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 138.125, 60, 60).stroke('red');

      doc.text('(output)', 320, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 320, 138.125, options);

      doc.rect(320, 138.125, 60, 60).stroke('red');

      // Orientation 3
      doc.text('3 - Rotate 180 degrees', 40, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 40, 232.1875, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 232.1875, 60, 60).stroke('red');

      doc.text('(output)', 320, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 320, 232.1875, options);

      doc.rect(320, 232.1875, 60, 60).stroke('red');

      // Orientation 4
      doc.text('4 - Flip vertically', 40, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 40, 326.25, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 326.25, 60, 60).stroke('red');

      doc.text('(output)', 320, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 320, 326.25, options);

      doc.rect(320, 326.25, 60, 60).stroke('red');

      // Orientation 5
      doc.text('5 - Flip horizontally and rotate 270 degrees CW', 40, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 40, 420.3125, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 420.3125, 60, 60).stroke('red');

      doc.text('(output)', 320, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 320, 420.3125, options);

      doc.rect(320, 420.3125, 60, 60).stroke('red');

      // Orientation 6
      doc.text('6 - Rotate 90 degrees CW', 40, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 40, 514.375, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 514.375, 60, 60).stroke('red');

      doc.text('(output)', 320, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 320, 514.375, options);

      doc.rect(320, 514.375, 60, 60).stroke('red');

      // Orientation 7
      doc.text('7 - Flip horizontally and rotate 90 degrees CW', 40, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 40, 608.4375, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 608.4375, 60, 60).stroke('red');

      doc.text('(output)', 320, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 320, 608.4375, options);

      doc.rect(320, 608.4375, 60, 60).stroke('red');

      // Orientation 8
      doc.text('8 - Rotate 270 degrees CW', 40, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 40, 702.5, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 702.5, 60, 60).stroke('red');

      doc.text('(output)', 320, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 320, 702.5, options);

      doc.rect(320, 702.5, 60, 60).stroke('red');
    });
  });

  test('orientation - with fit and alignment', function() {
    return runDocTest(function(doc) {
      let options = {
        align: 'center',
        fit: [80, 80],
        valign: 'center'
      };

      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);

      doc.text(
        'Images with EXIF orientation should properly align with fit/cover options:',
        40,
        10,
        {
          lineBreak: false
        }
      );

      // Orientation 1
      doc.text('1 - No orientation needed', 40, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 40, 44.0625, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 44.0625, 80, 80).stroke('red');

      doc.text('(output)', 320, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 320, 44.0625, options);

      doc.rect(320, 44.0625, 80, 80).stroke('red');

      // Orientation 2
      doc.text('2 - Flip horizonatal', 40, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 40, 138.125, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 138.125, 80, 80).stroke('red');

      doc.text('(output)', 320, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 320, 138.125, options);

      doc.rect(320, 138.125, 80, 80).stroke('red');

      // Orientation 3
      doc.text('3 - Rotate 180 degrees', 40, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 40, 232.1875, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 232.1875, 80, 80).stroke('red');

      doc.text('(output)', 320, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 320, 232.1875, options);

      doc.rect(320, 232.1875, 80, 80).stroke('red');

      // Orientation 4
      doc.text('4 - Flip vertically', 40, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 40, 326.25, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 326.25, 80, 80).stroke('red');

      doc.text('(output)', 320, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 320, 326.25, options);

      doc.rect(320, 326.25, 80, 80).stroke('red');

      // Orientation 5
      doc.text('5 - Flip horizontally and rotate 270 degrees CW', 40, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 40, 420.3125, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 420.3125, 80, 80).stroke('red');

      doc.text('(output)', 320, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 320, 420.3125, options);

      doc.rect(320, 420.3125, 80, 80).stroke('red');

      // Orientation 6
      doc.text('6 - Rotate 90 degrees CW', 40, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 40, 514.375, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 514.375, 80, 80).stroke('red');

      doc.text('(output)', 320, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 320, 514.375, options);

      doc.rect(320, 514.375, 80, 80).stroke('red');

      // Orientation 7
      doc.text('7 - Flip horizontally and rotate 90 degrees CW', 40, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 40, 608.4375, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 608.4375, 80, 80).stroke('red');

      doc.text('(output)', 320, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 320, 608.4375, options);

      doc.rect(320, 608.4375, 80, 80).stroke('red');

      // Orientation 8
      doc.text('8 - Rotate 270 degrees CW', 40, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 40, 702.5, {
        ...options,
        ignoreOrientation: true
      });

      doc.rect(40, 702.5, 80, 80).stroke('red');

      doc.text('(output)', 320, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 320, 702.5, options);

      doc.rect(320, 702.5, 80, 80).stroke('red');
    });
  });

  test('orientation - document option', function() {
    let options = {
      ignoreOrientation: true
    };

    return runDocTest(options, function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);

      doc.text(
        'EXIF orientation support can be enabled on the entire PDFDocument:',
        40,
        10,
        {
          lineBreak: false
        }
      );

      doc.text('1 - No orientation needed', 40, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 40, 44.0625, {
        height: 80
      });

      doc.text('(output)', 320, 30, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-1.jpeg', 320, 44.0625, {
        height: 80,
        ignoreOrientation: false
      });

      doc.text('2 - Flip horizonatal', 40, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 40, 138.125, {
        height: 80
      });

      doc.text('(output)', 320, 124.0625, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-2.jpeg', 320, 138.125, {
        height: 80,
        ignoreOrientation: false
      });

      doc.text('3 - Rotate 180 degrees', 40, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 40, 232.1875, {
        height: 80
      });

      doc.text('(output)', 320, 218.125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-3.jpeg', 320, 232.1875, {
        height: 80,
        ignoreOrientation: false
      });

      doc.text('4 - Flip vertically', 40, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 40, 326.25, {
        height: 80
      });

      doc.text('(output)', 320, 312.1875, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-4.jpeg', 320, 326.25, {
        height: 80,
        ignoreOrientation: false
      });

      doc.text('5 - Flip horizontally and rotate 270 degrees CW', 40, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 40, 420.3125, {
        height: 80
      });

      doc.text('(output)', 320, 406.25, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-5.jpeg', 320, 420.3125, {
        height: 80,
        ignoreOrientation: false
      });

      doc.text('6 - Rotate 90 degrees CW', 40, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 40, 514.375, {
        height: 80
      });

      doc.text('(output)', 320, 500.3125, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-6.jpeg', 320, 514.375, {
        height: 80,
        ignoreOrientation: false
      });

      doc.text('7 - Flip horizontally and rotate 90 degrees CW', 40, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 40, 608.4375, {
        height: 80
      });

      doc.text('(output)', 320, 594.375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-7.jpeg', 320, 608.4375, {
        height: 80,
        ignoreOrientation: false
      });

      doc.text('8 - Rotate 270 degrees CW', 40, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 40, 702.5, {
        height: 80
      });

      doc.text('(output)', 320, 688.4375, {
        lineBreak: false
      });

      doc.image('tests/images/orientation-8.jpeg', 320, 702.5, {
        height: 80,
        ignoreOrientation: false
      });
    });
  });
});
