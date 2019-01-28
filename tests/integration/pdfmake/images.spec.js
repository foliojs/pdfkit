var { runDocTest } = require('../helpers');
var { jpeg: bee } = require('../../images/bee');

describe('pdfmake', function() {
  test('images', function() {
    return runDocTest(function(doc) {
      const images = { bee: bee };

      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('pdfmake ', 40, 40, {
        lineBreak: false,
        textWidth: 50.00390625,
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
      doc.text('(since ', 90.00390625, 40, {
        lineBreak: false,
        textWidth: 35.431640625,
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
      doc.text("it's ", 125.435546875, 40, {
        lineBreak: false,
        textWidth: 17.61328125,
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
      doc.text('based ', 143.048828125, 40, {
        lineBreak: false,
        textWidth: 35.54296875,
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
      doc.text('on ', 178.591796875, 40, {
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
      doc.text('pdfkit) ', 195.02734375, 40, {
        lineBreak: false,
        textWidth: 37.72265625,
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
      doc.text('supports ', 232.75, 40, {
        lineBreak: false,
        textWidth: 50.54296875,
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
      doc.text('JPEG ', 283.29296875, 40, {
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
      doc.text('and ', 315.44921875, 40, {
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
      doc.text('PNG ', 338.3359375, 40, {
        lineBreak: false,
        textWidth: 27.26953125,
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
      doc.text('format', 365.60546875, 40, {
        lineBreak: false,
        textWidth: 36.03515625,
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
      doc.text('If ', 40, 54.0625, {
        lineBreak: false,
        textWidth: 10.400390625,
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
      doc.text('no ', 50.400390625, 54.0625, {
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
      doc.text('width/', 66.8359375, 54.0625, {
        lineBreak: false,
        textWidth: 34.171875,
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
      doc.text('height/', 101.0078125, 54.0625, {
        lineBreak: false,
        textWidth: 38.0859375,
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
      doc.text('fit ', 139.09375, 54.0625, {
        lineBreak: false,
        textWidth: 13.53515625,
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
      doc.text('is ', 152.62890625, 54.0625, {
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
      doc.text('provided, ', 164.69921875, 54.0625, {
        lineBreak: false,
        textWidth: 51.375,
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
      doc.text('image ', 216.07421875, 54.0625, {
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
      doc.text('original ', 252.091796875, 54.0625, {
        lineBreak: false,
        textWidth: 42.4921875,
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
      doc.text('size ', 294.583984375, 54.0625, {
        lineBreak: false,
        textWidth: 24.28125,
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
      doc.text('will ', 318.865234375, 54.0625, {
        lineBreak: false,
        textWidth: 20.724609375,
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
      doc.text('be ', 339.58984375, 54.0625, {
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
      doc.text('used', 355.650390625, 54.0625, {
        lineBreak: false,
        textWidth: 25.927734375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/sampleImage.jpg', 40, 68.125, {
        width: 695,
        height: 310
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('If ', 40, 378.125, {
        lineBreak: false,
        textWidth: 10.400390625,
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
      doc.text('you ', 50.400390625, 378.125, {
        lineBreak: false,
        textWidth: 22.01953125,
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
      doc.text('specify ', 72.419921875, 378.125, {
        lineBreak: false,
        textWidth: 41.28515625,
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
      doc.text('width, ', 113.705078125, 378.125, {
        lineBreak: false,
        textWidth: 34.552734375,
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
      doc.text('image ', 148.2578125, 378.125, {
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
      doc.text('will ', 184.275390625, 378.125, {
        lineBreak: false,
        textWidth: 20.724609375,
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
      doc.text('scale ', 205, 378.125, {
        lineBreak: false,
        textWidth: 31.236328125,
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
      doc.text('proportionally', 236.236328125, 378.125, {
        lineBreak: false,
        textWidth: 73.775390625,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/sampleImage.jpg', 40, 392.1875, {
        width: 150,
        height: 66.90647482014388
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('If ', 40, 459.0939748201439, {
        lineBreak: false,
        textWidth: 10.400390625,
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
      doc.text('you ', 50.400390625, 459.0939748201439, {
        lineBreak: false,
        textWidth: 22.01953125,
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
      doc.text('specify ', 72.419921875, 459.0939748201439, {
        lineBreak: false,
        textWidth: 41.28515625,
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
      doc.text('both ', 113.705078125, 459.0939748201439, {
        lineBreak: false,
        textWidth: 27.076171875,
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
      doc.text('width ', 140.78125, 459.0939748201439, {
        lineBreak: false,
        textWidth: 32.197265625,
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
      doc.text('and ', 172.978515625, 459.0939748201439, {
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
      doc.text('height ', 195.865234375, 459.0939748201439, {
        lineBreak: false,
        textWidth: 36.111328125,
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
      doc.text('- ', 231.9765625, 459.0939748201439, {
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
      doc.text('image ', 238.2578125, 459.0939748201439, {
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
      doc.text('will ', 274.275390625, 459.0939748201439, {
        lineBreak: false,
        textWidth: 20.724609375,
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
      doc.text('be ', 295, 459.0939748201439, {
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
      doc.text('stretched', 311.060546875, 459.0939748201439, {
        lineBreak: false,
        textWidth: 50.349609375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/sampleImage.jpg', 40, 473.1564748201439, {
        width: 150,
        height: 150
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('You ', 40, 623.1564748201439, {
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
      doc.text('can ', 63.255859375, 623.1564748201439, {
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
      doc.text('also ', 85.65625, 623.1564748201439, {
        lineBreak: false,
        textWidth: 25.44140625,
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
      doc.text('fit ', 111.09765625, 623.1564748201439, {
        lineBreak: false,
        textWidth: 13.53515625,
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
      doc.text('the ', 124.6328125, 623.1564748201439, {
        lineBreak: false,
        textWidth: 19.857421875,
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
      doc.text('image ', 144.490234375, 623.1564748201439, {
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
      doc.text('inside ', 180.5078125, 623.1564748201439, {
        lineBreak: false,
        textWidth: 34.728515625,
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
      doc.text('a ', 215.236328125, 623.1564748201439, {
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
      doc.text('rectangle', 224.734375, 623.1564748201439, {
        lineBreak: false,
        textWidth: 49.658203125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image('tests/images/sampleImage.jpg', 40, 637.2189748201439, {
        width: 100,
        height: 44.60431654676259
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
      doc.text('Images ', 40, 40, {
        lineBreak: false,
        textWidth: 42.556640625,
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
      doc.text('can ', 82.556640625, 40, {
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
      doc.text('be ', 104.95703125, 40, {
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
      doc.text('also ', 121.017578125, 40, {
        lineBreak: false,
        textWidth: 25.44140625,
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
      doc.text('provided ', 146.458984375, 40, {
        lineBreak: false,
        textWidth: 49.01953125,
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
      doc.text('in ', 195.478515625, 40, {
        lineBreak: false,
        textWidth: 12.50390625,
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
      doc.text('dataURL ', 207.982421875, 40, {
        lineBreak: false,
        textWidth: 48.33984375,
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
      doc.text('format', 256.322265625, 40, {
        lineBreak: false,
        textWidth: 36.03515625,
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
      doc.text('(the ', 40, 54.0625, {
        lineBreak: false,
        textWidth: 23.958984375,
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
      doc.text('one ', 63.958984375, 54.0625, {
        lineBreak: false,
        textWidth: 22.79296875,
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
      doc.text('below ', 86.751953125, 54.0625, {
        lineBreak: false,
        textWidth: 34.833984375,
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
      doc.text('was ', 121.5859375, 54.0625, {
        lineBreak: false,
        textWidth: 24.703125,
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
      doc.text('taken ', 146.2890625, 54.0625, {
        lineBreak: false,
        textWidth: 32.361328125,
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
      doc.text('from ', 178.650390625, 54.0625, {
        lineBreak: false,
        textWidth: 28.44140625,
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
      doc.text('http://', 207.091796875, 54.0625, {
        lineBreak: false,
        textWidth: 32.666015625,
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
      doc.text('www.clipartbest.com/', 239.7578125, 54.0625, {
        lineBreak: false,
        textWidth: 118.06640625,
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
      doc.text('clipart-', 357.82421875, 54.0625, {
        lineBreak: false,
        textWidth: 36.94921875,
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
      doc.text('dT7zx5rT9)', 394.7734375, 54.0625, {
        lineBreak: false,
        textWidth: 61.4296875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image(images['bee'], 40, 68.125, {
        width: 200,
        height: 195.59902200488997
      });
      doc.save();
      doc.restore();
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('or ', 40, 263.72402200489, {
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
      doc.text('be ', 53.875, 263.72402200489, {
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
      doc.text('defined ', 69.935546875, 263.72402200489, {
        lineBreak: false,
        textWidth: 42.486328125,
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
      doc.text('in ', 112.421875, 263.72402200489, {
        lineBreak: false,
        textWidth: 12.50390625,
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
      doc.text('the ', 124.92578125, 263.72402200489, {
        lineBreak: false,
        textWidth: 19.857421875,
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
      doc.text('"images" ', 144.783203125, 263.72402200489, {
        lineBreak: false,
        textWidth: 49.880859375,
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
      doc.text('dictionary, ', 194.6640625, 263.72402200489, {
        lineBreak: false,
        textWidth: 57.328125,
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
      doc.text('which ', 251.9921875, 263.72402200489, {
        lineBreak: false,
        textWidth: 34.400390625,
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
      doc.text('can ', 286.392578125, 263.72402200489, {
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
      doc.text('be ', 308.79296875, 263.72402200489, {
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
      doc.text('referenced ', 324.853515625, 263.72402200489, {
        lineBreak: false,
        textWidth: 59.994140625,
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
      doc.text('by ', 384.84765625, 263.72402200489, {
        lineBreak: false,
        textWidth: 15.31640625,
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
      doc.text('name:', 400.1640625, 263.72402200489, {
        lineBreak: false,
        textWidth: 32.9296875,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.image(images['bee'], 40, 277.78652200489, {
        width: 200,
        height: 195.59902200488997
      });
      doc.save();
      doc.restore();
    });
  });
});
