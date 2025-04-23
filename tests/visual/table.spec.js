import { runDocTest } from './helpers';

describe('table', function () {
  test('simple table', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.table({
        data: [
          ['Column 1', 'Column 2', 'Column 3'],
          ['One value goes here', 'Another one here', 'OK?'],
        ],
      });
    });
  });
  test('defining column widths', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.table({
        columnStyles: [100, '*', 200, '*'],
        data: [
          ['width=100', 'star-sized', 'width=200', 'star-sized'],
          [
            'fixed-width cells have exactly the specified width',
            { text: 'nothing interesting here', textColor: 'grey' },
            { text: 'nothing interesting here', textColor: 'grey' },
            { text: 'nothing interesting here', textColor: 'grey' },
          ],
        ],
      });
    });
  });
  test('defining row heights', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.table({
        rowStyles: [20, 50, 70],
        data: [
          ['row 1 with height 20', 'column B'],
          ['row 2 with height 50', 'column B'],
          ['row 3 with height 70', 'column B'],
        ],
      });
      doc.moveDown();
      doc.text('With same height:');
      doc.table({
        rowStyles: 40,
        data: [
          ['row 1', 'column B'],
          ['row 2', 'column B'],
          ['row 3', 'column B'],
        ],
      });
      doc.moveDown();
      doc.text('With height from function:');
      doc.table({
        rowStyles: (row) => (row + 1) * 25,
        data: [
          ['row 1', 'column B'],
          ['row 2', 'column B'],
          ['row 3', 'column B'],
        ],
      });
    });
  });
  test('column/row spans', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.table({
        columnStyles: [200, '*', '*'],
        rowStyles: (i) => {
          return i < 2
            ? {
                font: { src: 'tests/fonts/Roboto-MediumItalic.ttf' },
                align: { x: 'center' },
              }
            : {
                textColor: 'grey',
              };
        },
        data: [
          [{ colSpan: 2, text: 'Header with Colspan = 2' }, 'Header 3'],
          ['Header 1', 'Header 2', 'Header 3'],
          ['Sample value 1', 'Sample value 2', 'Sample value 3'],
          [
            {
              rowSpan: 3,
              text: 'rowspan set to 3\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor',
            },
            'Sample value 2',
            'Sample value 3',
          ],
          ['Sample value 2', 'Sample value 3'],
          ['Sample value 2', 'Sample value 3'],
          [
            'Sample value 1',
            {
              colSpan: 2,
              rowSpan: 2,
              text: 'Both:\nrowspan and colspan\ncan be defined at the same time',
            },
          ],
          ['Sample value 1'],
        ],
      });
    });
  });
  test('styling tables', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.text('noBorders:').moveDown(1);
      doc
        .table({
          rowStyles: { border: false },
          data: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
          ],
        })
        .moveDown(2)
        .text('headerLineOnly:')
        .moveDown(1)
        .table({
          rowStyles: (i) => {
            return i < 1 ? { border: [0, 0, 1, 0] } : { border: false };
          },
          data: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
          ],
        })
        .moveDown(2)
        .text('lightHorizontalLines:')
        .moveDown(1)
        .table({
          rowStyles: (i) => {
            return i < 1
              ? {
                  border: [0, 0, 2, 0],
                  borderColor: 'black',
                }
              : {
                  border: [0, 0, 1, 0],
                  borderColor: '#aaa',
                };
          },
          data: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
          ],
        })
        .moveDown(2)
        .text('but you can provide a custom styler as well')
        .moveDown(1)
        .table({
          defaultStyle: { border: 1, borderColor: 'gray' },
          columnStyles: (i) => {
            if (i === 0) {
              return { border: { left: 2 }, borderColor: { left: 'black' } };
            }
            if (i === 2) {
              return { border: { right: 2 }, borderColor: { right: 'black' } };
            }
          },
          rowStyles: (i) => {
            if (i === 0) {
              return { border: { top: 2 }, borderColor: { top: 'black' } };
            }
            if (i === 3) {
              return {
                border: { bottom: 2 },
                borderColor: { bottom: 'black' },
              };
            }
          },
          data: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
          ],
        })
        .moveDown(2)
        .text('zebra style')
        .moveDown(1)
        .table({
          rowStyles: (i) => {
            if (i % 2 === 0) return { backgroundColor: '#ccc' };
          },
          data: [
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
          ],
        });
    });
  });

  test('optional border', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.table({
        data: [
          [
            {
              border: [true, false, false, false],
              backgroundColor: '#eee',
              text: 'border:\n[true, false, false, false]',
            },
            {
              border: false,
              backgroundColor: '#ddd',
              text: 'border:\nfalse',
            },
            {
              border: true,
              backgroundColor: '#eee',
              text: 'border:\ntrue',
            },
          ],
          [
            {
              rowSpan: 3,
              border: true,
              backgroundColor: '#eef',
              text: 'rowSpan: 3\n\nborder:\ntrue',
            },
            {
              border: undefined,
              backgroundColor: '#eee',
              text: 'border:\nundefined (default)',
            },
            {
              border: [false, false, false, true],
              backgroundColor: '#ddd',
              text: 'border:\n[false, false, false, true]',
            },
          ],
          [
            {
              colSpan: 2,
              border: true,
              backgroundColor: '#efe',
              text: 'colSpan: 2\n\nborder:\ntrue',
            },
          ],
          [
            {
              border: 0,
              backgroundColor: '#eee',
              text: 'border:\n0 (same as false)',
            },
            {
              border: [false, true, true, false],
              backgroundColor: '#ddd',
              text: 'border:\n[false, true, true, false]',
            },
          ],
        ],
      });

      doc.moveDown(2);

      doc.table({
        defaultStyle: { border: false, width: 60 },
        data: [
          ['', 'column 1', 'column 2', 'column 3'],
          [
            'row 1',
            {
              rowSpan: 3,
              colSpan: 3,
              border: true,
              backgroundColor: '#ccc',
              text: 'rowSpan: 3\ncolSpan: 3\n\nborder:\n[true, true, true, true]',
            },
          ],
          ['row 2'],
          ['row 3'],
        ],
      });
    });
  });

  test('iterables', function () {
    return runDocTest(async function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');

      const syncIterator = (function* () {
        yield ['1', '2'];
        yield ['3', '4'];
      })();

      doc.table({ data: syncIterator });
    });
  });

  test('rotated text', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.fontSize(7);
      doc.table({
        debug: true,
        defaultStyle: { height: 50, width: 50, padding: 4 },
        columnStyles: (i) => ({ textOptions: { rotation: i * 45 } }),
        rowStyles: [
          { align: { x: 'left', y: 'top' } },
          { align: { x: 'left', y: 'center' } },
          { align: { x: 'left', y: 'bottom' } },
          { align: { x: 'center', y: 'top' } },
          { align: { x: 'center', y: 'center' } },
          { align: { x: 'center', y: 'bottom' } },
          { align: { x: 'right', y: 'top' } },
          { align: { x: 'right', y: 'center' } },
          { align: { x: 'right', y: 'bottom' } },
          { align: { x: 'justify', y: 'top' } },
          { align: { x: 'justify', y: 'center' } },
          { align: { x: 'justify', y: 'bottom' } },
        ],
        data: [
          Array(9)
            .fill(null)
            .map((_, i) => `L,T @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `L,C @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `L,B @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `C,T @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `C,C @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `C,B @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `R,T @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `R,C @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `R,B @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `J,T @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `J,C @${(i * 45).toString().padStart(3, '0')}`),
          Array(9)
            .fill(null)
            .map((_, i) => `J,B @${(i * 45).toString().padStart(3, '0')}`),
        ],
      });
    });
  });

  test('line flowing rotated text', function () {
    return runDocTest(
      { layout: 'landscape', margin: 19 },
      async function (doc) {
        doc.font('tests/fonts/Roboto-Italic.ttf');
        doc.table({
          debug: true,
          defaultStyle: { align: 'center' },
          columnStyles: [{ width: 200, textOptions: { rotation: 45 } }],
          data: [
            [
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent laoreet pulvinar velit, at interdum velit ullamcorper at. Sed a velit vulputate, tristique metus eu, hendrerit nisi. Ut vitae nisl in sapien ultricies commodo et consectetur. nibh. Etiam tempor in orci quis viverra. Ut commodo, purus ac elementum ultricies, diam risus ultricies turpis, ac accumsan orci turpis a libero. Curabitur convallis nisi sed nisi elementum sollicitudin. Aenean eget urna luctus, blandit nulla eget, dapibus neque. Aliquam ut arcu erat.',
            ],
          ],
        });
      },
    );
  });

  test('multi line rotated text', function () {
    return runDocTest(
      { layout: 'landscape', margin: 19 },
      async function (doc) {
        doc.font('tests/fonts/Roboto-Italic.ttf');
        doc.table({
          debug: true,
          defaultStyle: { align: 'center', width: 200, height: 200 },
          columnStyles: [{ textOptions: { rotation: 90 } }],
          data: [['Hello\nWorld']],
        });
      },
    );
  });

  test('multi page table', function () {
    return runDocTest({ size: [500, 300] }, function (doc) {
      doc.font('tests/fonts/Roboto-Italic.ttf');
      doc.table({
        debug: true,
        data: [
          [
            {
              rowSpan: 3,
              text: 'LEFT_COLUMN',
            },
            'RIGHT_COLUM_ROW_1\n'.repeat(5),
          ],
          ['RIGHT_COLUM_ROW_2\n'.repeat(5)],
          ['RIGHT_COLUM_ROW_3'],
        ],
      });
    });
  });
});
