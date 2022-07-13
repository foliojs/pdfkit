import { runDocTest } from '../helpers';

describe('pdfmake', function() {
  test('orientation', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('EXIF ', 40, 10, {
        lineBreak: false,
        textWidth: 27.2109375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('orientation ', 67.2109375, 10, {
        lineBreak: false,
        textWidth: 60.509765625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text("data ", 127.720703125, 10, {
        lineBreak: false,
        textWidth: 26.712890625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('may ', 154.43359375, 10, {
        lineBreak: false,
        textWidth: 25.60546875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('be ', 180.0390625, 10, {
        lineBreak: false,
        textWidth: 16.060546875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('present ', 196.099609375, 10, {
        lineBreak: false,
        textWidth: 43.095703125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('on ', 239.1953125, 10, {
        lineBreak: false,
        textWidth: 16.435546875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('some ', 255.630859375, 10, {
        lineBreak: false,
        textWidth: 32.876953125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('JPEG ', 288.5078125, 10, {
        lineBreak: false,
        textWidth: 32.15625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('images. ', 320.6640625, 10, {
        lineBreak: false,
        textWidth: 42.205078125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('There ', 362.869140625, 10, {
        lineBreak: false,
        textWidth: 33.404296875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('are ', 396.2734375, 10, {
        lineBreak: false,
        textWidth: 19.8046875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('8 ', 416.078125, 10, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('exif ', 425.787109375, 10, {
        lineBreak: false,
        textWidth: 22.353515625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('orientation ', 448.140625, 10, {
        lineBreak: false,
        textWidth: 60.509765625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('values:', 508.650390625, 10, {
        lineBreak: false,
        textWidth: 37.23046875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('1 ', 40, 30, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 30, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('No ', 55.990234375, 30, {
        lineBreak: false,
        textWidth: 18.369140625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('orientation ', 74.359375, 30, {
        lineBreak: false,
        textWidth: 60.509765625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('needed', 134.869140625, 30, {
        lineBreak: false,
        textWidth: 39.228515625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-1.jpeg', 40, 44.0625, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 30, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 30, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 30, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-1-output.jpeg', 320, 44.0625, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('2 ', 40, 124.0625, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 124.0625, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Flip ', 55.990234375, 124.0625, {
        lineBreak: false,
        textWidth: 22.16015625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('horizontal', 78.150390625, 124.0625, {
        lineBreak: false,
        textWidth: 53.103515625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-2.jpeg', 40, 138.125, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 124.0625, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 124.0625, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 124.0625, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-2-output.jpeg', 320, 138.125, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('3 ', 40, 218.125, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 218.125, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Rotate ', 55.990234375, 218.125, {
        lineBreak: false,
        textWidth: 37.927734375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('180 ', 93.91796875, 218.125, {
        lineBreak: false,
        textWidth: 23.185546875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('degrees', 117.103515625, 218.125, {
        lineBreak: false,
        textWidth: 42.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-3.jpeg', 40, 232.1875, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 218.125, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 218.125, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 218.125, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-3-output.jpeg', 320, 232.1875, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('4 ', 40, 312.1875, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 312.1875, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Flip ', 55.990234375, 312.1875, {
        lineBreak: false,
        textWidth: 22.16015625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('vertically', 78.150390625, 312.1875, {
        lineBreak: false,
        textWidth: 47.58984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-4.jpeg', 40, 326.25, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 312.1875, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 312.1875, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 312.1875, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-4-output.jpeg', 320, 326.25, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('5 ', 40, 406.25, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 406.25, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Flip ', 55.990234375, 406.25, {
        lineBreak: false,
        textWidth: 22.16015625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('horizontally ', 78.150390625, 406.25, {
        lineBreak: false,
        textWidth: 64.6640625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('and ', 142.814453125, 406.25, {
        lineBreak: false,
        textWidth: 22.88671875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('rotate ', 165.701171875, 406.25, {
        lineBreak: false,
        textWidth: 34.482421875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('270 ', 200.18359375, 406.25, {
        lineBreak: false,
        textWidth: 23.185546875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('degrees ', 223.369140625, 406.25, {
        lineBreak: false,
        textWidth: 45.6796875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('CW', 269.048828125, 406.25, {
        lineBreak: false,
        textWidth: 18.45703125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-5.jpeg', 40, 420.3125, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 406.25, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 406.25, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 406.25, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-5-output.jpeg', 320, 420.3125, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('6 ', 40, 500.3125, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 500.3125, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Rotate ', 55.990234375, 500.3125, {
        lineBreak: false,
        textWidth: 37.927734375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('90 ', 93.91796875, 500.3125, {
        lineBreak: false,
        textWidth: 16.447265625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('degrees ', 110.365234375, 500.3125, {
        lineBreak: false,
        textWidth: 45.6796875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('CW', 156.044921875, 500.3125, {
        lineBreak: false,
        textWidth: 18.45703125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-6.jpeg', 40, 514.375, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 500.3125, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 500.3125, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 500.3125, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-6-output.jpeg', 320, 514.375, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('7 ', 40, 594.375, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 594.375, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Flip ', 55.990234375, 594.375, {
        lineBreak: false,
        textWidth: 22.16015625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('horizontally ', 78.150390625, 594.375, {
        lineBreak: false,
        textWidth: 64.6640625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('and ', 142.814453125, 594.375, {
        lineBreak: false,
        textWidth: 22.88671875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('rotate ', 165.701171875, 594.375, {
        lineBreak: false,
        textWidth: 34.482421875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('90 ', 200.18359375, 594.375, {
        lineBreak: false,
        textWidth: 16.447265625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('degrees ', 216.630859375, 594.375, {
        lineBreak: false,
        textWidth: 45.6796875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('CW', 262.310546875, 594.375, {
        lineBreak: false,
        textWidth: 18.45703125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-7.jpeg', 40, 608.4375, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 594.375, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 594.375, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 594.375, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-7-output.jpeg', 320, 608.4375, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('8 ', 40, 688.4375, {
        lineBreak: false,
        textWidth: 9.708984375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('- ', 49.708984375, 688.4375, {
        lineBreak: false,
        textWidth: 6.28125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Rotate ', 55.990234375, 688.4375, {
        lineBreak: false,
        textWidth: 37.927734375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('270 ', 93.91796875, 688.4375, {
        lineBreak: false,
        textWidth: 23.185546875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('degrees ', 117.103515625, 688.4375, {
        lineBreak: false,
        textWidth: 45.6796875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('CW', 162.783203125, 688.4375, {
        lineBreak: false,
        textWidth: 18.45703125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-8.jpeg', 40, 702.5, {
        height: 80,
        obeyOrientation: false
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('(', 320, 688.4375, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('output', 324.171875, 688.4375, {
        lineBreak: false,
        textWidth: 34.646484375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(')', 358.818359375, 688.4375, {
        lineBreak: false,
        textWidth: 4.171875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/orientation-8-output.jpeg', 320, 702.5, {
        height: 80,
        obeyOrientation: true
      });
      doc.save();
      doc.restore();
    });
  });
});
