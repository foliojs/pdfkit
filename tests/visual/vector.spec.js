import { runDocTest } from './helpers';
var tiger = require('../../examples/tiger');

describe('vector', function() {
  test('simple shapes', function() {
    return runDocTest(function(doc) {
      doc
        .save()
        .moveTo(100, 150)
        .lineTo(100, 250)
        .lineTo(200, 250)
        .fill('#FF3300');

      doc.circle(280, 200, 50).fill('#6600FF');

      // an SVG path
      doc
        .scale(0.6)
        .translate(470, 130)
        .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
        .fill('red', 'even-odd')
        .restore();
    });
  });

  test('complex svg', function() {
    return runDocTest(function(doc) {
      var i, len, part;
      doc.translate(220, 300);
      for (i = 0, len = tiger.length; i < len; i++) {
        part = tiger[i];
        doc.save();
        doc.path(part.path);
        if (part['stroke-width']) {
          doc.lineWidth(part['stroke-width']);
        }
        if (part.fill !== 'none' && part.stroke !== 'none') {
          doc.fillAndStroke(part.fill, part.stroke);
        } else {
          if (part.fill !== 'none') {
            doc.fill(part.fill);
          }
          if (part.stroke !== 'none') {
            doc.stroke(part.stroke);
          }
        }
        doc.restore();
      }
    });
  });

  test('svg path', function() {
    return runDocTest(function(doc) {
      // extracted from https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
      // lines
      doc.path('M10 10 H 90 V 90 H 10 L 10 10');
      doc.stroke('#000');
      doc.translate(0, 100);

      doc.path('M10 10 H 90 V 90 H 10 Z');
      doc.stroke('#000');
      doc.translate(0, 100);

      doc.path('M10 10 h 80 v 80 h -80 Z');
      doc.stroke('#000');
      doc.translate(0, 100);

      // bezier curves

      doc.path('M10 10 C 20 20, 40 20, 50 10');
      doc.stroke('#000');

      doc.path('M70 10 C 70 20, 110 20, 110 10');
      doc.stroke('#000');

      doc.path('M130 10 C 120 20, 180 20, 170 10');
      doc.stroke('#000');

      doc.path('M10 60 C 20 80, 40 80, 50 60');
      doc.stroke('#000');

      doc.path('M70 60 C 70 80, 110 80, 110 60');
      doc.stroke('#000');

      doc.path('M130 60 C 120 80, 180 80, 170 60');
      doc.stroke('#000');

      doc.path('M10 110 C 20 140, 40 140, 50 110');
      doc.stroke('#000');

      doc.path('M70 110 C 70 140, 110 140, 110 110');
      doc.stroke('#000');

      doc.path('M130 110 C 120 140, 180 140, 170 110');
      doc.stroke('#000');

      doc.translate(0, 120);
      doc.path('M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80');
      doc.stroke('#000');

      doc.translate(0, 120);
      doc.path('M10 80 Q 95 10 180 80');
      doc.stroke('#000');

      doc.translate(0, 120);
      doc.path('M10 80 Q 52.5 10, 95 80 T 180 80');
      doc.stroke('#000');

      // arcs
      doc.addPage();
      doc.path(`M10 315
      L 110 215
      A 30 50 0 0 1 162.55 162.45
      L 172.55 152.45
      A 30 50 -45 0 1 215.1 109.9
      L 315 10`);
      doc.fillAndStroke('#73B373', '#000');

      doc.translate(0, 180);
      doc.path(`M10 315
      L 110 215
      A 36 60 0 0 1 150.71 170.29
      L 172.55 152.45
      A 30 50 -45 0 1 215.1 109.9
      L 315 10`);
      doc.fillAndStroke('#73B373', '#000');

      doc.translate(0, 180);
      doc.path(`M80 80
      A 45 45, 0, 0, 0, 125 125
      L 125 80 Z`);
      doc.fillAndStroke('#73B373', '#000');

      doc.path(`M230 80
      A 45 45, 0, 1, 0, 275 125
      L 275 80 Z`);
      doc.fillAndStroke('#F67676', '#000');

      doc.path(`M80 230
      A 45 45, 0, 0, 1, 125 275
      L 125 230 Z`);
      doc.fillAndStroke('#AF6FAF', '#000');

      doc.path(`M230 230
      A 45 45, 0, 1, 1, 275 275
      L 275 230 Z`);
      doc.fillAndStroke('#6F6FEF', '#000');
    });
  });
});
