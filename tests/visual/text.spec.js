import { runDocTest } from './helpers';

describe('text', function () {
  test('simple text', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text('Really simple text', 100, 100);
    });
  });

  test('alignment', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text('Left aligned text', { align: 'left' });
      doc.text('Right aligned text', { align: 'right' });
      doc.text(
        'Justified aligned text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus.',
        { align: 'justify' },
      );
    });
  });

  test('soft hyphen', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text(
        'Text with soft hyphen - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lo ip\u00ADsum',
        { align: 'justify' },
      );
      doc.text(
        'Text with soft hyphen on the edge - ttttestttestttestttestttestttestttestttestttestttestttes\u00ADtt\u00ADt',
        { align: 'justify' },
      );
    });
  });

  test('decoration', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fillColor('blue').text('Here is a link!', 100, 100, {
        link: 'http://google.com/',
        underline: true,
      });
      doc.text('Strike', 100, 130, {
        strike: true,
      });
      doc.text('Strike', 100, 160, {
        underline: true,
        strike: true,
      });
    });
  });

  test('list', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fillColor('#000').list(['One', 'Two', 'Three'], 100, 150);
    });
  });

  test('list with line breaks in items', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.list(['Foo\nBar', 'Foo\rBar', 'Foo\r\nBar'], [100, 150]);
    });
  });

  test('list (numbered)', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc
        .fillColor('#000')
        .list(['One', 'Two', 'Three'], 100, 150, { listType: 'numbered' });
    });
  });

  test('list (lettered)', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc
        .fillColor('#000')
        .list(['One', 'Two', 'Three'], 100, 150, { listType: 'lettered' });
    });
  });

  test('list with sub-list (unordered)', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc
        .fillColor('#000')
        .list(['One', ['One.One', 'One.Two'], 'Three'], 100, 150);
    });
  });

  test('list with sub-list (ordered)', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc
        .fillColor('#000')
        .list(['One', ['One.One', 'One.Two'], 'Three'], 100, 150, {
          listType: 'numbered',
        });
    });
  });

  test('continued text with OpenType features', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text('Really simple', 100, 100, {
        features: ['smcp'],
        continued: true,
        lineBreak: false,
      });
      doc.text(' text', { features: [], lineBreak: false });
    });
  });

  test('rotated text', function () {
    let i = 0;
    const cols = [
      '#292f56',
      '#492d73',
      '#8c2f94',
      '#b62d78',
      '#d82d31',
      '#e69541',
      '#ecf157',
      '#acfa70',
    ];
    function randColor() {
      return cols[i++ % cols.length];
    }

    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      for (let i = -360; i < 360; i += 5) {
        const withLabel = i % 45 === 0;
        const margin = i < 0 ? '            ' : ' ';
        let text = `—————————> ${withLabel ? `${margin}${i}` : ''}`;

        if (withLabel) {
          const bounds = doc.boundsOfString(text, 200, 200, { rotation: i });
          doc
            .save()
            .rect(bounds.x, bounds.y, bounds.width, bounds.height)
            .stroke(randColor())
            .restore();
        }

        doc
          .save()
          .fill(withLabel ? 'red' : 'black')
          .text(text, 200, 200, { rotation: i })
          .restore();
      }
      doc.save().circle(200, 200, 1).fill('blue').restore();
    });
  });

  test('rotated multi line text', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

      // Compute text rect
      const textBounds = doc.boundsOfString(text, 300, 300, { rotation: 0 });
      // Compute rotated bounds
      const bounds = doc.boundsOfString(text, 300, 300, { rotation: 45 });
      doc
        // Draw rotated bounds
        .rect(bounds.x, bounds.y, bounds.width, bounds.height)
        .stroke()
        // Draw text
        .text(text, 300, 300, { rotation: 45 })
        // Draw text rect (rotation is negative because of the flipped axis
        .rotate(-45, { origin: [300, 300] })
        .rect(300, 300, textBounds.width, textBounds.height)
        .stroke('pink')
        // Draw origin
        .circle(300, 300, 2)
        .fill('blue');
    });
  });
});
