import { runDocTest } from './helpers';

describe('text', function() {
  test('simple text', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text('Really simple text', 100, 100);
    });
  });

  test('alignment', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text('Left aligned text', { align: 'left' });
      doc.text('Right aligned text', { align: 'right' });
      doc.text(
        'Justified aligned text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus.',
        { align: 'justify' }
      );
    });
  });

  test('soft hyphen', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text(
        'Text with soft hyphen - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lo ip\u00ADsum',
        { align: 'justify' }
      );
      doc.text(
        'Text with soft hyphen on the edge - ttttestttestttestttestttestttestttestttestttestttestttes\u00ADtt\u00ADt',
        { align: 'justify' }
      );
    });
  });

  test('decoration', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fillColor('blue').text('Here is a link!', 100, 100, {
        link: 'http://google.com/',
        underline: true
      });
      doc.text('Strike', 100, 130, {
        strike: true
      });
      doc.text('Strike', 100, 160, {
        underline: true,
        strike: true
      });
    });
  });

  test('list', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fillColor('#000').list(['One', 'Two', 'Three'], 100, 150);
    });
  });

  test('list with line breaks in items', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.list(['Foo\nBar', 'Foo\rBar', 'Foo\r\nBar'], [100, 150]);
    })
  })
});
