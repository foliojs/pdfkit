var { runDocTest } = require('../helpers');
var { jpeg: bee } = require('../../images/bee');

describe('pdfmake', function() {
  // somehow the generated pdf changes at each run
  test('absolute', function() {
    return runDocTest(function(doc) {
      const images = { bee: bee };

      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.image(images['bee'], 100, 100, { width: 50, height: 50 });
      doc.save();
      doc.restore();
      doc.image(images['bee'], 150, 150, { width: 50, height: 50 });
      doc.save();
      doc.restore();
      doc.image(images['bee'], 200, 200, { width: 50, height: 50 });
      doc.save();
      doc.restore();
      doc.image(images['bee'], 250, 150, { width: 50, height: 50 });
      doc.save();
      doc.restore();
      doc.image(images['bee'], 300, 100, { width: 50, height: 50 });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('You ', 40, 40, {
        lineBreak: false,
        textWidth: 23.255859375,
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
      doc.text('can ', 63.255859375, 40, {
        lineBreak: false,
        textWidth: 22.400390625,
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
      doc.text('put ', 85.65625, 40, {
        lineBreak: false,
        textWidth: 20.23828125,
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
      doc.text('images ', 105.89453125, 40, {
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
      doc.text('at ', 148.099609375, 40, {
        lineBreak: false,
        textWidth: 13.41796875,
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
      doc.text('any ', 161.517578125, 40, {
        lineBreak: false,
        textWidth: 21.796875,
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
      doc.text('position', 183.314453125, 40, {
        lineBreak: false,
        textWidth: 42.97265625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.addPage({
        size: [595.28, 841.89],
        bufferPages: false,
        autoFirstPage: false,
        compress: false
      });
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('As', 100, 100, {
        lineBreak: false,
        textWidth: 14.015625,
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
      doc.text('well', 150, 150, {
        lineBreak: false,
        textWidth: 21.19921875,
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
      doc.text('as', 200, 200, {
        lineBreak: false,
        textWidth: 12.71484375,
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
      doc.text('text', 250, 150, {
        lineBreak: false,
        textWidth: 20.14453125,
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
      doc.text('!!!', 300, 100, {
        lineBreak: false,
        textWidth: 9.263671875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.addPage({
        size: [595.28, 841.89],
        bufferPages: false,
        autoFirstPage: false,
        compress: false
      });
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('And ', 40, 40, {
        lineBreak: false,
        textWidth: 24.1875,
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
      doc.text('this ', 64.1875, 40, {
        lineBreak: false,
        textWidth: 22.599609375,
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
      doc.text('is ', 86.787109375, 40, {
        lineBreak: false,
        textWidth: 12.0703125,
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
      doc.text('a ', 98.857421875, 40, {
        lineBreak: false,
        textWidth: 9.498046875,
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
      doc.text('table ', 108.35546875, 40, {
        lineBreak: false,
        textWidth: 29.419921875,
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
      doc.text('on ', 137.775390625, 40, {
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
      doc.text('top ', 154.2109375, 40, {
        lineBreak: false,
        textWidth: 20.349609375,
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
      doc.text('of ', 174.560546875, 40, {
        lineBreak: false,
        textWidth: 13.98046875,
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
      doc.text('an ', 188.541015625, 40, {
        lineBreak: false,
        textWidth: 16.119140625,
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
      doc.text('image ', 204.66015625, 40, {
        lineBreak: false,
        textWidth: 36.017578125,
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
      doc.text('at ', 240.677734375, 40, {
        lineBreak: false,
        textWidth: 13.41796875,
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
      doc.text('x:100 ', 254.095703125, 40, {
        lineBreak: false,
        textWidth: 32.0390625,
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
      doc.text('y:100', 286.134765625, 40, {
        lineBreak: false,
        textWidth: 28.798828125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image(images['bee'], 100, 100, { width: 100, height: 100 });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(100, 100.5);
      doc.lineTo(473.5185546875, 100.5);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Column ', 105, 103, {
        lineBreak: false,
        textWidth: 44.291015625,
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
      doc.text('1', 149.291015625, 103, {
        lineBreak: false,
        textWidth: 6.73828125,
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
      doc.text('Column ', 247.5, 103, {
        lineBreak: false,
        textWidth: 44.291015625,
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
      doc.text('2', 291.791015625, 103, {
        lineBreak: false,
        textWidth: 6.73828125,
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
      doc.text('Column ', 357.4140625, 103, {
        lineBreak: false,
        textWidth: 44.291015625,
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
      doc.text('3', 401.705078125, 103, {
        lineBreak: false,
        textWidth: 6.73828125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(100.5, 100);
      doc.lineTo(100.5, 120.0625);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(243, 100);
      doc.lineTo(243, 120.0625);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(352.9140625, 100);
      doc.lineTo(352.9140625, 120.0625);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(474.0185546875, 100);
      doc.lineTo(474.0185546875, 120.0625);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(100, 119.5625);
      doc.lineTo(473.5185546875, 119.5625);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text(`Let's `, 105, 122.0625, {
        lineBreak: false,
        textWidth: 27.515625,
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
      doc.text('try ', 132.515625, 122.0625, {
        lineBreak: false,
        textWidth: 16.734375,
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
      doc.text('an ', 149.25, 122.0625, {
        lineBreak: false,
        textWidth: 16.119140625,
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
      doc.text('unordered ', 165.369140625, 122.0625, {
        lineBreak: false,
        textWidth: 57.19921875,
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
      doc.text('list', 222.568359375, 122.0625, {
        lineBreak: false,
        textWidth: 15.931640625,
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
      doc.text('item ', 117.8671875, 136.125, {
        lineBreak: false,
        textWidth: 26.677734375,
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
      doc.text('1', 144.544921875, 136.125, {
        lineBreak: false,
        textWidth: 6.73828125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.ellipse(107, 143.2578125, 2, 2);
      doc.moveTo(105, 143.2578125);
      doc.bezierCurveTo(
        105,
        142.15324300033842,
        105.8954305003384,
        141.2578125,
        107,
        141.2578125
      );
      doc.bezierCurveTo(
        108.1045694996616,
        141.2578125,
        109,
        142.15324300033842,
        109,
        143.2578125
      );
      doc.bezierCurveTo(
        109,
        144.36238199966158,
        108.1045694996616,
        145.2578125,
        107,
        145.2578125
      );
      doc.bezierCurveTo(
        105.8954305003384,
        145.2578125,
        105,
        144.36238199966158,
        105,
        143.2578125
      );
      doc.closePath();
      doc.fillColor('black', 1);
      doc.fillOpacity(1);
      doc.fill();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('item ', 117.8671875, 150.1875, {
        lineBreak: false,
        textWidth: 26.677734375,
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
      doc.text('2', 144.544921875, 150.1875, {
        lineBreak: false,
        textWidth: 6.73828125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.ellipse(107, 157.3203125, 2, 2);
      doc.moveTo(105, 157.3203125);
      doc.bezierCurveTo(
        105,
        156.21574300033842,
        105.8954305003384,
        155.3203125,
        107,
        155.3203125
      );
      doc.bezierCurveTo(
        108.1045694996616,
        155.3203125,
        109,
        156.21574300033842,
        109,
        157.3203125
      );
      doc.bezierCurveTo(
        109,
        158.42488199966158,
        108.1045694996616,
        159.3203125,
        107,
        159.3203125
      );
      doc.bezierCurveTo(
        105.8954305003384,
        159.3203125,
        105,
        158.42488199966158,
        105,
        157.3203125
      );
      doc.closePath();
      doc.fillColor('black', 1);
      doc.fillOpacity(1);
      doc.fill();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('or ', 247.5, 122.0625, {
        lineBreak: false,
        textWidth: 13.875,
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
      doc.text('a ', 261.375, 122.0625, {
        lineBreak: false,
        textWidth: 9.498046875,
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
      doc.text('nested ', 270.873046875, 122.0625, {
        lineBreak: false,
        textWidth: 39.181640625,
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
      doc.text('table', 310.0546875, 122.0625, {
        lineBreak: false,
        textWidth: 26.44921875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(247.5, 136.625);
      doc.lineTo(347.4140625, 136.625);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Col1', 252.5, 139.125, {
        lineBreak: false,
        textWidth: 24.3046875,
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
      doc.text('Col2', 285.8046875, 139.125, {
        lineBreak: false,
        textWidth: 24.3046875,
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
      doc.text('Col3', 319.109375, 139.125, {
        lineBreak: false,
        textWidth: 24.3046875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(248, 136.125);
      doc.lineTo(248, 156.1875);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(281.3046875, 136.125);
      doc.lineTo(281.3046875, 156.1875);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(314.609375, 136.125);
      doc.lineTo(314.609375, 156.1875);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(347.9140625, 136.125);
      doc.lineTo(347.9140625, 156.1875);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(247.5, 155.6875);
      doc.lineTo(347.4140625, 155.6875);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('1', 252.5, 158.1875, {
        lineBreak: false,
        textWidth: 6.73828125,
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
      doc.text('2', 285.8046875, 158.1875, {
        lineBreak: false,
        textWidth: 6.73828125,
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
      doc.text('3', 319.109375, 158.1875, {
        lineBreak: false,
        textWidth: 6.73828125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(248, 155.1875);
      doc.lineTo(248, 175.25);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(281.3046875, 155.1875);
      doc.lineTo(281.3046875, 175.25);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(314.609375, 155.1875);
      doc.lineTo(314.609375, 175.25);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(347.9140625, 155.1875);
      doc.lineTo(347.9140625, 175.25);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(247.5, 174.75);
      doc.lineTo(347.4140625, 174.75);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('1', 252.5, 177.25, {
        lineBreak: false,
        textWidth: 6.73828125,
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
      doc.text('2', 285.8046875, 177.25, {
        lineBreak: false,
        textWidth: 6.73828125,
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
      doc.text('3', 319.109375, 177.25, {
        lineBreak: false,
        textWidth: 6.73828125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(248, 174.25);
      doc.lineTo(248, 194.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(281.3046875, 174.25);
      doc.lineTo(281.3046875, 194.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(314.609375, 174.25);
      doc.lineTo(314.609375, 194.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(347.9140625, 174.25);
      doc.lineTo(347.9140625, 194.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(247.5, 193.8125);
      doc.lineTo(347.4140625, 193.8125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Inlines ', 357.4140625, 122.0625, {
        lineBreak: false,
        textWidth: 37.845703125,
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
      doc.text('can ', 395.259765625, 122.0625, {
        lineBreak: false,
        textWidth: 22.400390625,
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
      doc.text('be ', 417.66015625, 122.0625, {
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
      doc.text('styled', 433.720703125, 122.0625, {
        lineBreak: false,
        textWidth: 31.212890625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(10);
      doc.text('easily ', 357.4140625, 136.125, {
        lineBreak: false,
        textWidth: 27.9541015625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(10);
      doc.text('as ', 385.3681640625, 136.125, {
        lineBreak: false,
        textWidth: 13.0712890625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(10);
      doc.text('everywhere ', 398.439453125, 136.125, {
        lineBreak: false,
        textWidth: 52.900390625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(10);
      doc.text('else', 451.33984375, 136.125, {
        lineBreak: false,
        textWidth: 18.1787109375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(100.5, 119.0625);
      doc.lineTo(100.5, 197.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(243, 119.0625);
      doc.lineTo(243, 197.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(352.9140625, 119.0625);
      doc.lineTo(352.9140625, 197.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(474.0185546875, 119.0625);
      doc.lineTo(474.0185546875, 197.3125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
      doc.lineWidth(1);
      doc.undash();
      doc.lineJoin('miter');
      doc.lineCap('butt');
      doc.moveTo(100, 196.8125);
      doc.lineTo(473.5185546875, 196.8125);
      doc.strokeColor('black', 1);
      doc.strokeOpacity(1);
      doc.stroke();
    });
  });
});
