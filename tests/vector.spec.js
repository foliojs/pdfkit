var {runDocTest} = require('./helpers');
var tiger = require('../demo/tiger')

describe('text', function () {
  test('simple shapes', function () {
    return runDocTest(function(doc) {
      doc.save()
     .moveTo(100, 150)
     .lineTo(100, 250)
     .lineTo(200, 250)
     .fill("#FF3300");
     
    doc.circle(280, 200, 50)
      .fill("#6600FF");
      
    // an SVG path
    doc.scale(0.6)
      .translate(470, 130)
      .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
      .fill('red', 'even-odd')
      .restore();
    });
  });

  test('complex svg', function () {
    return runDocTest(function(doc) {
      var i, len, part
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
});
