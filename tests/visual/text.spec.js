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

  describe('implicit column', function() {
    test('column add new page', function() {
      return runDocTest({ bufferPages: true }, function(doc) {
        const loermIpsum =
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';
        const longLoremIpsum = `${loermIpsum} ${loermIpsum} ${loermIpsum} ${loermIpsum}`;
        doc.font('tests/fonts/Roboto-Regular.ttf');
        doc.x = 300;
        doc.fillColor('#000').text(longLoremIpsum, { width: 250 });
      });
    });
    test('column on next page', function() {
      return runDocTest({ bufferPages: true }, function(doc) {
        const loermIpsum =
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';
        const longLoremIpsum = `${loermIpsum} ${loermIpsum} ${loermIpsum} ${loermIpsum}`;
        doc.font('tests/fonts/Roboto-Regular.ttf');

        doc.fillColor('#000').text(loermIpsum, { width: 200 });
        doc.addPage();
        doc.fillColor('#000').text(loermIpsum, { width: 200 });
        doc.switchToPage(0);

        doc.y = doc.page.margins.top;

        doc.x = 300;
        doc.fillColor('#000').text(longLoremIpsum, { width: 250 });
      });
    });
  });
});
