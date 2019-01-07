const jade = require('jade');
const { markdown } = require('markdown');
const fs = require('fs');
const vm = require('vm');
const { exec } = require('child_process');
const PDFDocument = require('../');

process.chdir(__dirname);

if (!fs.existsSync('img')) {
  fs.mkdirSync('img');
}

const files = [
  '../README.md',
  'getting_started.md',
  'vector.md',
  'text.md',
  'images.md',
  'annotations.md'
];

// shared lorem ipsum text so we don't need to copy it into every example
const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;';

const extractHeaders = function(tree) {
  const headers = [];

  for (let index = 0; index < tree.length; index++) {
    const node = tree[index];
    if (node[0] === 'header' && (headers.length === 0 || node[1].level > 1)) {
      if (node[1].level > 2) {
        node[1].level = 2;
      }
      const hash = node[2].toLowerCase().replace(/\s+/g, '_');
      node[1].id = hash;
      headers.push({
        hash,
        title: node[2]
      });
    }
  }

  return headers;
};

let imageIndex = 0;
const generateImages = function(tree) {
  // find code blocks
  const codeBlocks = [];
  for (var node of tree) {
    if (node[0] === 'code_block') {
      codeBlocks.push(node[1]);
    }
  }

  for (node of tree) {
    if (node[0] === 'para' && Array.isArray(node[1]) && node[1][0] === 'img') {
      // compile the code
      const attrs = node[1][1];
      let code = codeBlocks[attrs.alt];
      delete attrs.height; // used for pdf generation

      // create a PDF and run the example
      const doc = new PDFDocument();
      const f = `img/${imageIndex++}`;
      var file = fs.createWriteStream(`${f}.pdf`);
      doc.pipe(file);

      doc.translate(doc.x, doc.y);
      doc.scale(0.8);
      doc.x = doc.y = 0;

      vm.runInNewContext(code, {
        doc,
        lorem
      });

      delete attrs.title;
      delete attrs.alt;
      attrs.href = `${f}.png`;

      // write the PDF, convert to PNG using the mac `sips`
      // command line tool, and trim with graphicsmagick

      file.on('finish', () =>
        exec(`sips -s format png ${f}.pdf --out ${f}.png`, function() {
          fs.unlink(`${f}.pdf`);
          exec(`gm convert ${f}.png -trim ${f}.png`);
        })
      );
    }
  }
};

const pages = [];
for (let file of Array.from(files)) {
  let content = fs.readFileSync(file, 'utf8');

  // turn github highlighted code blocks into normal markdown code blocks
  content = content.replace(
    /^```javascript\n((:?.|\n)*?)\n```/gm,
    (m, $1) => `    ${$1.split('\n').join('\n    ')}`
  );

  const tree = markdown.parse(content);
  const headers = extractHeaders(tree);
  generateImages(tree);

  file = file.replace(/README\.md/, 'index').replace(/\.md$/, '');

  pages.push({
    file,
    url: `/docs/${file}.html`,
    title: headers[0].title,
    headers: headers.slice(1),
    content: markdown.toHTML(tree)
  });
}

for (let index = 0; index < pages.length; index++) {
  const page = pages[index];
  page.pages = pages;
  page.index = index;
  const html = jade.renderFile('template.jade', page);
  fs.writeFileSync(page.file + '.html', html, 'utf8');
}
