var { runDocTest } = require('../helpers');

describe('pdfmake', function() {
  test('basics', function() {
    return runDocTest(function(doc) {
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('First ', 40, 40, {
        lineBreak: false,
        textWidth: 26.68359375,
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
      doc.text('paragraph', 66.68359375, 40, {
        lineBreak: false,
        textWidth: 54.041015625,
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
      doc.text('Another ', 40, 54.0625, {
        lineBreak: false,
        textWidth: 45.2109375,
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
      doc.text('paragraph, ', 85.2109375, 54.0625, {
        lineBreak: false,
        textWidth: 59.3671875,
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
      doc.text('this ', 144.578125, 54.0625, {
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
      doc.text('time ', 167.177734375, 54.0625, {
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
      doc.text('a ', 193.85546875, 54.0625, {
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
      doc.text('little ', 203.353515625, 54.0625, {
        lineBreak: false,
        textWidth: 25.904296875,
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
      doc.text('bit ', 229.2578125, 54.0625, {
        lineBreak: false,
        textWidth: 16.53515625,
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
      doc.text('longer ', 245.79296875, 54.0625, {
        lineBreak: false,
        textWidth: 36.498046875,
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
      doc.text('to ', 282.291015625, 54.0625, {
        lineBreak: false,
        textWidth: 13.6171875,
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
      doc.text('make ', 295.908203125, 54.0625, {
        lineBreak: false,
        textWidth: 32.337890625,
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
      doc.text('sure, ', 328.24609375, 54.0625, {
        lineBreak: false,
        textWidth: 28.435546875,
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
      doc.text('this ', 356.681640625, 54.0625, {
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
      doc.text('line ', 379.28125, 54.0625, {
        lineBreak: false,
        textWidth: 21.7734375,
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
      doc.text('will ', 401.0546875, 54.0625, {
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
      doc.text('be ', 421.779296875, 54.0625, {
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
      doc.text('divided ', 437.83984375, 54.0625, {
        lineBreak: false,
        textWidth: 41.267578125,
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
      doc.text('into ', 479.107421875, 54.0625, {
        lineBreak: false,
        textWidth: 23.150390625,
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
      doc.text('at ', 502.2578125, 54.0625, {
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
      doc.text('least ', 515.67578125, 54.0625, {
        lineBreak: false,
        textWidth: 28.875,
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
      doc.text('two ', 40, 68.125, {
        lineBreak: false,
        textWidth: 22.751953125,
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
      doc.text('lines', 62.751953125, 68.125, {
        lineBreak: false,
        textWidth: 24.990234375,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
    });
  });
});
