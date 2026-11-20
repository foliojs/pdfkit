const pug = require('pug');
const MarkdownIt = require('markdown-it');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { PDFDocument } = require('pdfkit');
const sharp = require('sharp');

const markdown = new MarkdownIt();

process.chdir(__dirname);

if (!fs.existsSync('img')) {
  fs.mkdirSync('img');
}

const files = [
  '../README.md',
  'getting_started.md',
  'paper_sizes.md',
  'vector.md',
  'text.md',
  'images.md',
  'outline.md',
  'annotations.md',
  'forms.md',
  'destinations.md',
  'attachments.md',
  'accessibility.md',
  'table.md',
  'you_made_it.md',
];

// shared lorem ipsum text so we don't need to copy it into every example
const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;';

const getTokenText = function (token) {
  if (token.children) {
    return token.children.map(getTokenText).join('');
  }
  return token.content || '';
};

const extractHeaders = function (tokens) {
  const headers = [];

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (
      token.type === 'heading_open' &&
      (headers.length === 0 || token.tag !== 'h1')
    ) {
      const name = getTokenText(tokens[index + 1]);
      if (Number(token.tag.slice(1)) > 2) {
        token.tag = 'h2';
        tokens[index + 2].tag = 'h2';
      }
      const hash = name.toLowerCase().replace(/\s+/g, '_');
      token.attrSet('id', hash);
      headers.push({
        hash,
        title: name,
      });
    }
  }

  return headers;
};

let imageIndex = 0;
const pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs');

const renderPdf = async function (data, output) {
  const { getDocument } = await pdfjsPromise;
  const loadingTask = getDocument({
    data: new Uint8Array(data),
    useSystemFonts: false,
    standardFontDataUrl: path.join(
      __dirname,
      '../node_modules/pdfjs-dist/standard_fonts/',
    ),
  });
  const pdfDocument = await loadingTask.promise;

  try {
    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale: 150 / 72 });
    const canvasFactory = pdfDocument.canvasFactory;
    const canvasAndContext = canvasFactory.create(
      viewport.width,
      viewport.height,
    );

    try {
      await page.render({
        canvasContext: canvasAndContext.context,
        viewport,
        background: '#fff',
      }).promise;

      const image = canvasAndContext.canvas.toBuffer('image/png');
      await sharp(image).trim({ threshold: 0 }).png().toFile(output);
    } finally {
      page.cleanup();
      canvasFactory.destroy(canvasAndContext);
    }
  } finally {
    await loadingTask.destroy();
  }
};

const generateImages = async function (tokens) {
  // find code blocks
  const codeBlocks = [];
  for (const token of tokens) {
    if (token.type === 'code_block' || token.type === 'fence') {
      codeBlocks.push(token.content);
    }
  }

  for (const token of tokens) {
    if (
      token.type === 'inline' &&
      token.children.length === 1 &&
      token.children[0].type === 'image'
    ) {
      // compile the code
      const image = token.children[0];
      const code = codeBlocks[image.content];

      // create a PDF in memory and run the example
      const doc = new PDFDocument();
      doc.initForm();
      const f = `img/${imageIndex++}`;
      const chunks = [];
      const pdf = new Promise((resolve, reject) => {
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
      });

      doc.translate(doc.x, doc.y);
      doc.scale(0.8);
      doc.x = doc.y = 0;

      vm.runInNewContext(code, {
        doc,
        lorem,
      });

      image.attrs = image.attrs.filter(([name]) => name !== 'title');
      image.content = '';
      image.children = [];
      image.attrSet('src', `${f}.png`);

      doc.end();
      await renderPdf(await pdf, `${f}.png`);
    }
  }
};

const generateWebsite = async function () {
  const pages = [];
  for (let file of Array.from(files)) {
    let content = fs.readFileSync(file, 'utf8');

    // turn github highlighted code blocks into normal markdown code blocks
    content = content.replace(
      /^```(?:javascript|js|bash)\r?\n([\s\S]*?)\r?\n```/gm,
      (m, $1) => `    ${$1.split(/\r?\n/).join('\n    ')}`,
    );

    const tokens = markdown.parse(content, {});
    const headers = extractHeaders(tokens);
    await generateImages(tokens);

    file = file.replace(/README\.md/, 'index').replace(/\.md$/, '');

    pages.push({
      file,
      url: `/docs/${file}.html`,
      title: headers[0].title,
      headers: headers.slice(1),
      content: markdown.renderer.render(tokens, markdown.options, {}),
    });
  }

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    page.pages = pages;
    page.index = index;
    const html = pug.renderFile('template.pug', page);
    fs.writeFileSync(page.file + '.html', html, 'utf8');
  }
};

generateWebsite().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
