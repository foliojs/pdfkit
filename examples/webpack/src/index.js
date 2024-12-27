import fs from 'fs';
import PDFDocument from 'pdfkit';
import ace from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import { waitForData } from './pdfkitHelpers.js';
import { fetchFile } from './httpHelpers.js';
// testImage is an URL
import testImageURL from './lazy-assets/test.jpeg';
// bundle font and image files and register them in the virtual fs
import './registerStaticFiles.js';

var lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;\nMauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.';

fetchFile(testImageURL)
  .then(testImageData => {
    fs.writeFileSync('images/test.jpg', testImageData);
  })
  .catch(error => {
    console.error(error);
  });

var initialFnCode = `// create a document
var doc = new PDFDocument();

doc.registerFont('Roboto', 'fonts/Roboto-Regular.ttf');

// draw some text
doc.fontSize(25).text('Here is some vector graphics...', 100, 80);

// some vector graphics
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

// and some justified text wrapped into columns
doc
  .font('Roboto')
  .text('And here is some wrapped text...', 100, 300)
  .fontSize(13)
  .moveDown()
  .text(lorem, {
    width: 412,
    align: 'justify',
    indent: 30,
    columns: 2,
    height: 300,
    ellipsis: true
  });

doc.addPage();

doc
  .fontSize(25)
  .font('Courier')
  .text('And an image...')
  .image('images/bee.png');

doc.font('Courier-Bold').text('Finish...');

doc.addPage();

doc
  .font('Roboto')
  .fontSize(18)
  .text('Not yet. Lets try to show an image lazy loaded');

try {
  doc.image('images/test.jpg');
} catch (error) {
  doc.moveDown().text(\`\${error}\`);
  doc.text('Image not loaded. Try again later.');
}

// waitForData must be called before call to doc.end()
waitForData(doc)
  .then(dataUrl => {
    // display the document in the iframe to the right
    iframe.src = dataUrl;
  })
  .catch(error => {
    console.log(error);
  });

doc.end();`;

function executeFn(code, PDFDocument, lorem, waitForData, iframe) {
  var fn = new Function('PDFDocument', 'lorem', 'waitForData', 'iframe', code);
  fn(PDFDocument, lorem, waitForData, iframe);
}

var editor = ace.edit('editor');
editor.setTheme('ace/theme/monokai');
editor.getSession().setMode('ace/mode/javascript');
editor.setValue(initialFnCode);
editor
  .getSession()
  .getSelection()
  .clearSelection();

var iframe = document.querySelector('iframe');

executeFn(initialFnCode, PDFDocument, lorem, waitForData, iframe);

editor.getSession().on('change', function() {
  try {
    executeFn(editor.getValue(), PDFDocument, lorem, waitForData, iframe);
  } catch (e) {
    console.error(e);
  }
});
