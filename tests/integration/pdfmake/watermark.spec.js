var { runDocTest } = require('../helpers');

describe('pdfmake', function() {
  test('watermark', function() {
    return runDocTest(function(doc) {
      doc.font('Helvetica');
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.font('tests/fonts/Roboto-Medium.ttf');
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Test ', 40, 40, {
        lineBreak: false,
        textWidth: 26.015625,
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
      doc.text('page ', 66.015625, 40, {
        lineBreak: false,
        textWidth: 29.3203125,
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
      doc.text('of ', 95.3359375, 40, {
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
      doc.text('watermark.', 109.31640625, 40, {
        lineBreak: false,
        textWidth: 60.228515625,
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
      doc.text('', 40, 54.0625, {
        lineBreak: false,
        textWidth: 0,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.fill('black');
      doc.fillColor('black');
      doc.fillOpacity(undefined);
      doc.fontSize(12);
      doc.text('Lorem ', 40, 68.125, {
        lineBreak: false,
        textWidth: 37.095703125,
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
      doc.text('ipsum ', 77.095703125, 68.125, {
        lineBreak: false,
        textWidth: 35.935546875,
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
      doc.text('dolor ', 113.03125, 68.125, {
        lineBreak: false,
        textWidth: 30.3984375,
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
      doc.text('sit ', 143.4296875, 68.125, {
        lineBreak: false,
        textWidth: 15.990234375,
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
      doc.text('amet, ', 159.419921875, 68.125, {
        lineBreak: false,
        textWidth: 32.6484375,
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
      doc.text('consectetur ', 192.068359375, 68.125, {
        lineBreak: false,
        textWidth: 66.416015625,
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
      doc.text('adipiscing ', 258.484375, 68.125, {
        lineBreak: false,
        textWidth: 57.556640625,
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
      doc.text('elit. ', 316.041015625, 68.125, {
        lineBreak: false,
        textWidth: 22.23046875,
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
      doc.text('Donec ', 338.271484375, 68.125, {
        lineBreak: false,
        textWidth: 36.943359375,
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
      doc.text('id ', 375.21484375, 68.125, {
        lineBreak: false,
        textWidth: 12.650390625,
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
      doc.text('semper ', 387.865234375, 68.125, {
        lineBreak: false,
        textWidth: 43.18359375,
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
      doc.text('massa, ', 431.048828125, 68.125, {
        lineBreak: false,
        textWidth: 41.2734375,
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
      doc.text('nec ', 472.322265625, 68.125, {
        lineBreak: false,
        textWidth: 22.23046875,
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
      doc.text('dapibus ', 494.552734375, 68.125, {
        lineBreak: false,
        textWidth: 45.4453125,
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
      doc.text('mauris. ', 40, 82.1875, {
        lineBreak: false,
        textWidth: 42.94921875,
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
      doc.text('Mauris ', 82.94921875, 82.1875, {
        lineBreak: false,
        textWidth: 39.75,
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
      doc.text('in ', 122.69921875, 82.1875, {
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
      doc.text('mattis ', 135.203125, 82.1875, {
        lineBreak: false,
        textWidth: 36.955078125,
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
      doc.text('nibh. ', 172.158203125, 82.1875, {
        lineBreak: false,
        textWidth: 29.00390625,
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
      doc.text('Aenean ', 201.162109375, 82.1875, {
        lineBreak: false,
        textWidth: 43.283203125,
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
      doc.text('feugiat ', 244.4453125, 82.1875, {
        lineBreak: false,
        textWidth: 40.060546875,
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
      doc.text('volutpat ', 284.505859375, 82.1875, {
        lineBreak: false,
        textWidth: 46.166015625,
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
      doc.text('aliquam. ', 330.671875, 82.1875, {
        lineBreak: false,
        textWidth: 48.9609375,
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
      doc.text('Donec ', 379.6328125, 82.1875, {
        lineBreak: false,
        textWidth: 36.943359375,
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
      doc.text('sed ', 416.576171875, 82.1875, {
        lineBreak: false,
        textWidth: 22.283203125,
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
      doc.text('tellus ', 438.859375, 82.1875, {
        lineBreak: false,
        textWidth: 31.875,
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
      doc.text('feugiat, ', 470.734375, 82.1875, {
        lineBreak: false,
        textWidth: 42.416015625,
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
      doc.text('dignissim ', 40, 96.25, {
        lineBreak: false,
        textWidth: 54.720703125,
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
      doc.text('lectus ', 94.720703125, 96.25, {
        lineBreak: false,
        textWidth: 35.244140625,
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
      doc.text('id, ', 129.96484375, 96.25, {
        lineBreak: false,
        textWidth: 15.005859375,
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
      doc.text('eleifend ', 144.970703125, 96.25, {
        lineBreak: false,
        textWidth: 45.28125,
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
      doc.text('tortor. ', 190.251953125, 96.25, {
        lineBreak: false,
        textWidth: 35.115234375,
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
      doc.text('Ut ', 225.3671875, 96.25, {
        lineBreak: false,
        textWidth: 14.671875,
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
      doc.text('at ', 240.0390625, 96.25, {
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
      doc.text('mauris ', 253.45703125, 96.25, {
        lineBreak: false,
        textWidth: 39.791015625,
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
      doc.text('vel ', 293.248046875, 96.25, {
        lineBreak: false,
        textWidth: 17.9765625,
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
      doc.text('dui ', 311.224609375, 96.25, {
        lineBreak: false,
        textWidth: 19.265625,
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
      doc.text('euismod ', 330.490234375, 96.25, {
        lineBreak: false,
        textWidth: 49.171875,
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
      doc.text('accumsan. ', 379.662109375, 96.25, {
        lineBreak: false,
        textWidth: 61.6875,
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
      doc.text('Cras ', 441.349609375, 96.25, {
        lineBreak: false,
        textWidth: 27.322265625,
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
      doc.text('sodales, ', 468.671875, 96.25, {
        lineBreak: false,
        textWidth: 47.109375,
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
      doc.text('ante ', 515.78125, 96.25, {
        lineBreak: false,
        textWidth: 26.396484375,
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
      doc.text('sit ', 542.177734375, 96.25, {
        lineBreak: false,
        textWidth: 15.990234375,
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
      doc.text('amet ', 40, 110.3125, {
        lineBreak: false,
        textWidth: 30.29296875,
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
      doc.text('varius ', 70.29296875, 110.3125, {
        lineBreak: false,
        textWidth: 34.998046875,
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
      doc.text('dapibus, ', 105.291015625, 110.3125, {
        lineBreak: false,
        textWidth: 47.80078125,
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
      doc.text('dolor ', 153.091796875, 110.3125, {
        lineBreak: false,
        textWidth: 30.3984375,
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
      doc.text('neque ', 183.490234375, 110.3125, {
        lineBreak: false,
        textWidth: 35.7421875,
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
      doc.text('finibus ', 219.232421875, 110.3125, {
        lineBreak: false,
        textWidth: 38.68359375,
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
      doc.text('justo, ', 257.916015625, 110.3125, {
        lineBreak: false,
        textWidth: 31.640625,
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
      doc.text('vel ', 289.556640625, 110.3125, {
        lineBreak: false,
        textWidth: 17.9765625,
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
      doc.text('ornare ', 307.533203125, 110.3125, {
        lineBreak: false,
        textWidth: 37.330078125,
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
      doc.text('arcu ', 344.86328125, 110.3125, {
        lineBreak: false,
        textWidth: 26.34375,
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
      doc.text('dolor ', 371.20703125, 110.3125, {
        lineBreak: false,
        textWidth: 30.3984375,
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
      doc.text('vitae ', 401.60546875, 110.3125, {
        lineBreak: false,
        textWidth: 28.5,
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
      doc.text('tellus. ', 430.10546875, 110.3125, {
        lineBreak: false,
        textWidth: 35.033203125,
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
      doc.text('Aenean ', 465.138671875, 110.3125, {
        lineBreak: false,
        textWidth: 43.283203125,
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
      doc.text('faucibus ', 508.421875, 110.3125, {
        lineBreak: false,
        textWidth: 49.0078125,
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
      doc.text('egestas ', 40, 124.375, {
        lineBreak: false,
        textWidth: 45.240234375,
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
      doc.text('urna ', 85.240234375, 124.375, {
        lineBreak: false,
        textWidth: 26.794921875,
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
      doc.text('in ', 112.03515625, 124.375, {
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
      doc.text('interdum. ', 124.5390625, 124.375, {
        lineBreak: false,
        textWidth: 53.7890625,
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
      doc.text('Mauris ', 178.328125, 124.375, {
        lineBreak: false,
        textWidth: 39.75,
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
      doc.text('convallis ', 218.078125, 124.375, {
        lineBreak: false,
        textWidth: 49.892578125,
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
      doc.text('dolor ', 267.970703125, 124.375, {
        lineBreak: false,
        textWidth: 30.3984375,
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
      doc.text('a ', 298.369140625, 124.375, {
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
      doc.text('condimentum ', 307.8671875, 124.375, {
        lineBreak: false,
        textWidth: 76.9453125,
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
      doc.text('sagittis. ', 384.8125, 124.375, {
        lineBreak: false,
        textWidth: 45.427734375,
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
      doc.text('Suspendisse ', 430.240234375, 124.375, {
        lineBreak: false,
        textWidth: 71.015625,
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
      doc.text('non ', 501.255859375, 124.375, {
        lineBreak: false,
        textWidth: 23.056640625,
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
      doc.text('laoreet ', 40, 138.4375, {
        lineBreak: false,
        textWidth: 39.837890625,
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
      doc.text('nisl. ', 79.837890625, 138.4375, {
        lineBreak: false,
        textWidth: 24.76171875,
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
      doc.text('Curabitur ', 104.599609375, 138.4375, {
        lineBreak: false,
        textWidth: 51.990234375,
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
      doc.text('sed ', 156.58984375, 138.4375, {
        lineBreak: false,
        textWidth: 22.283203125,
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
      doc.text('pharetra ', 178.873046875, 138.4375, {
        lineBreak: false,
        textWidth: 47.419921875,
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
      doc.text('ipsum. ', 226.29296875, 138.4375, {
        lineBreak: false,
        textWidth: 39.09375,
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
      doc.text('Curabitur ', 265.38671875, 138.4375, {
        lineBreak: false,
        textWidth: 51.990234375,
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
      doc.text('aliquet ', 317.376953125, 138.4375, {
        lineBreak: false,
        textWidth: 39.03515625,
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
      doc.text('purus ', 356.412109375, 138.4375, {
        lineBreak: false,
        textWidth: 33.181640625,
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
      doc.text('vitae ', 389.59375, 138.4375, {
        lineBreak: false,
        textWidth: 28.5,
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
      doc.text('pharetra ', 418.09375, 138.4375, {
        lineBreak: false,
        textWidth: 47.419921875,
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
      doc.text('tincidunt. ', 465.513671875, 138.4375, {
        lineBreak: false,
        textWidth: 52.69921875,
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
      doc.text('Cras ', 518.212890625, 138.4375, {
        lineBreak: false,
        textWidth: 27.322265625,
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
      doc.text('aliquam ', 40, 152.5, {
        lineBreak: false,
        textWidth: 45.802734375,
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
      doc.text('tempor ', 85.802734375, 152.5, {
        lineBreak: false,
        textWidth: 41.40234375,
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
      doc.text('justo ', 127.205078125, 152.5, {
        lineBreak: false,
        textWidth: 29.28515625,
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
      doc.text('sit ', 156.490234375, 152.5, {
        lineBreak: false,
        textWidth: 15.990234375,
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
      doc.text('amet ', 172.48046875, 152.5, {
        lineBreak: false,
        textWidth: 30.29296875,
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
      doc.text('euismod. ', 202.7734375, 152.5, {
        lineBreak: false,
        textWidth: 52.330078125,
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
      doc.text('Praesent ', 255.103515625, 152.5, {
        lineBreak: false,
        textWidth: 50.337890625,
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
      doc.text('risus ', 305.44140625, 152.5, {
        lineBreak: false,
        textWidth: 28.93359375,
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
      doc.text('magna, ', 334.375, 152.5, {
        lineBreak: false,
        textWidth: 42.251953125,
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
      doc.text('lobortis ', 376.626953125, 152.5, {
        lineBreak: false,
        textWidth: 43.67578125,
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
      doc.text('eget ', 420.302734375, 152.5, {
        lineBreak: false,
        textWidth: 26.337890625,
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
      doc.text('dictum ', 446.640625, 152.5, {
        lineBreak: false,
        textWidth: 39.984375,
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
      doc.text('sit ', 486.625, 152.5, {
        lineBreak: false,
        textWidth: 15.990234375,
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
      doc.text('amet, ', 502.615234375, 152.5, {
        lineBreak: false,
        textWidth: 32.6484375,
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
      doc.text('tristique ', 40, 166.5625, {
        lineBreak: false,
        textWidth: 46.67578125,
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
      doc.text('vel ', 86.67578125, 166.5625, {
        lineBreak: false,
        textWidth: 17.9765625,
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
      doc.text('enim. ', 104.65234375, 166.5625, {
        lineBreak: false,
        textWidth: 32.537109375,
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
      doc.text('Duis ', 137.189453125, 166.5625, {
        lineBreak: false,
        textWidth: 26.5546875,
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
      doc.text('aliquet, ', 163.744140625, 166.5625, {
        lineBreak: false,
        textWidth: 41.390625,
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
      doc.text('urna ', 205.134765625, 166.5625, {
        lineBreak: false,
        textWidth: 26.794921875,
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
      doc.text('maximus ', 231.9296875, 166.5625, {
        lineBreak: false,
        textWidth: 52.1953125,
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
      doc.text('sollicitudin ', 284.125, 166.5625, {
        lineBreak: false,
        textWidth: 60.767578125,
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
      doc.text('lobortis, ', 344.892578125, 166.5625, {
        lineBreak: false,
        textWidth: 46.03125,
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
      doc.text('mi ', 390.923828125, 166.5625, {
        lineBreak: false,
        textWidth: 16.400390625,
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
      doc.text('nunc ', 407.32421875, 166.5625, {
        lineBreak: false,
        textWidth: 29.109375,
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
      doc.text('dignissim ', 436.43359375, 166.5625, {
        lineBreak: false,
        textWidth: 54.720703125,
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
      doc.text('ligula, ', 491.154296875, 166.5625, {
        lineBreak: false,
        textWidth: 33.9375,
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
      doc.text('et ', 525.091796875, 166.5625, {
        lineBreak: false,
        textWidth: 13.248046875,
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
      doc.text('lacinia ', 40, 180.625, {
        lineBreak: false,
        textWidth: 37.6640625,
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
      doc.text('magna ', 77.6640625, 180.625, {
        lineBreak: false,
        textWidth: 39.896484375,
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
      doc.text('leo ', 117.560546875, 180.625, {
        lineBreak: false,
        textWidth: 19.083984375,
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
      doc.text('non ', 136.64453125, 180.625, {
        lineBreak: false,
        textWidth: 23.056640625,
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
      doc.text('sem.', 159.701171875, 180.625, {
        lineBreak: false,
        textWidth: 26.220703125,
        characterSpacing: 0,
        wordCount: 1,
        link: null
      });
      doc.save();
      doc.restore();
      doc.fill('blue');
      doc.fillColor('blue');
      doc.fillOpacity(undefined);
      doc.opacity(0.3);
      doc.save();
      doc.rotate(-54.73679578231538, { origin: [297.64, 420.945] });
      doc.fontSize(122.55859375);
      doc.text('test watermark', -114.73473487854005, 385.1822131347656, {
        lineBreak: false
      });
      doc.save();
      doc.restore();
      doc.restore();
    });
  });
});
