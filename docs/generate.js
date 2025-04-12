const fs = require('fs');
const vm = require('vm');
const { markdown } = require('markdown');
const CodeMirror = require('codemirror/addon/runmode/runmode.node');
const PDFDocument = require('../');

process.chdir(__dirname);

// setup code mirror javascript mode
const filename = require.resolve('codemirror/mode/javascript/javascript');
const jsMode = fs.readFileSync(filename, 'utf8');
vm.runInNewContext(jsMode, { CodeMirror });

// style definitions for markdown
const styles = {
  h1: {
    font: 'fonts/Alegreya-Bold.ttf',
    fontSize: 25,
    padding: 15,
  },
  h2: {
    font: 'fonts/Alegreya-Bold.ttf',
    fontSize: 18,
    padding: 10,
  },
  h3: {
    font: 'fonts/Alegreya-Bold.ttf',
    fontSize: 18,
    padding: 10,
  },
  para: {
    font: 'fonts/Merriweather-Regular.ttf',
    fontSize: 10,
    padding: 10,
  },
  code: {
    font: 'fonts/SourceCodePro-Regular.ttf',
    fontSize: 9,
  },
  code_block: {
    padding: 10,
    background: '#2c2c2c',
  },
  inlinecode: {
    font: 'fonts/SourceCodePro-Bold.ttf',
    fontSize: 10,
  },
  listitem: {
    font: 'fonts/Merriweather-Regular.ttf',
    fontSize: 10,
    padding: 6,
  },
  link: {
    font: 'fonts/Merriweather-Regular.ttf',
    fontSize: 10,
    color: 'blue',
    underline: true,
  },
  example: {
    font: 'Helvetica',
    fontSize: 9,
    color: 'black',
    padding: 10,
  },
};

// syntax highlighting colors
// based on Github's theme
const colors = {
  keyword: '#cb4b16',
  atom: '#d33682',
  number: '#009999',
  def: '#2aa198',
  variable: '#108888',
  'variable-2': '#b58900',
  'variable-3': '#6c71c4',
  property: '#2aa198',
  operator: '#6c71c4',
  comment: '#999988',
  string: '#dd1144',
  'string-2': '#009926',
  meta: '#768E04',
  qualifier: '#b58900',
  builtin: '#d33682',
  bracket: '#cb4b16',
  tag: '#93a1a1',
  attribute: '#2aa198',
  header: '#586e75',
  quote: '#93a1a1',
  link: '#93a1a1',
  special: '#6c71c4',
  default: '#002b36',
};

// shared lorem ipsum text so we don't need to copy it into every example
const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;';

let codeBlocks = [];
let lastType = null;

// This class represents a node in the markdown tree, and can render it to pdf
class Node {
  constructor(tree) {
    // special case for text nodes
    if (typeof tree === 'string') {
      this.type = 'text';
      this.text = tree;
      return;
    }

    this.type = tree.shift();
    this.attrs = {};

    if (typeof tree[0] === 'object' && !Array.isArray(tree[0])) {
      this.attrs = tree.shift();
    }

    // parse sub nodes
    this.content = [];
    while (tree.length) {
      this.content.push(new Node(tree.shift()));
    }

    switch (this.type) {
      case 'header':
        this.type = `h${this.attrs.level}`;
        break;

      case 'code_block':
        // use code mirror to syntax highlight the code block
        var code = this.content[0].text;
        this.content = [];
        CodeMirror.runMode(code, 'javascript', (text, style) => {
          const color = colors[style] || colors.default;
          const opts = {
            color,
            continued: text !== '\n',
          };

          return this.content.push(new Node(['code', opts, text]));
        });

        if (this.content.length) {
          this.content[this.content.length - 1].attrs.continued = false;
        }
        codeBlocks.push(code);
        break;

      case 'img':
        // images are used to generate inline example output
        // stores the JS so it can be run
        // in the render method
        this.type = 'example';
        code = codeBlocks[this.attrs.alt];
        if (code) {
          this.code = code;
        }
        this.height = +this.attrs.title || 0;
        break;
    }

    this.style = styles[this.type] || styles.para;
  }

  // sets the styles on the document for this node
  setStyle(doc) {
    if (this.style.font) {
      doc.font(this.style.font);
    }

    if (this.style.fontSize) {
      doc.fontSize(this.style.fontSize);
    }

    if (this.style.color || this.attrs.color) {
      doc.fillColor(this.style.color || this.attrs.color);
    } else {
      doc.fillColor('black');
    }

    const options = {};
    options.align = this.style.align;
    options.link = this.attrs.href || null; // override continued link
    if (this.attrs.continued != null) {
      options.continued = this.attrs.continued;
    }
    return options;
  }

  // renders this node and its subnodes to the document
  render(doc, continued) {
    let y;
    if (continued == null) {
      continued = false;
    }
    switch (this.type) {
      case 'example':
        this.setStyle(doc);

        // translate all points in the example code to
        // the current point in the document
        doc.moveDown();
        doc.save();
        doc.translate(doc.x, doc.y);
        var { x } = doc;
        ({ y } = doc);
        doc.x = doc.y = 0;

        // Update the page width for those which rely on the width of the document
        var docPageWidth = doc.page.width;
        var docPageHeight = doc.page.height;
        var docPageMargins = doc.page.margins;
        doc.page.width = doc.page.width - x - doc.page.margins.right;
        doc.page.margins = { top: 0, left: 0, right: 0, bottom: 0 };

        // run the example code with the document
        vm.runInNewContext(this.code, {
          doc,
          lorem,
        });

        // restore points and styles
        y += doc.y;
        doc.restore();
        doc.x = x;
        doc.y = y + this.height;
        doc.page.width = docPageWidth;
        doc.page.height = docPageHeight;
        doc.page.margins = docPageMargins;
        break;
      case 'hr':
        doc.addPage();
        break;
      default:
        // loop through subnodes and render them
        for (let index = 0; index < this.content.length; index++) {
          const fragment = this.content[index];

          if (this.type === 'numberlist') {
            let node = new Node(['inlinecode', `${index + 1}. `]);
            fragment.content.splice(0, 0, node);
          }

          if (fragment.type === 'text') {
            // add a new page for each heading, unless it follows another heading
            if (
              ['h1', 'h2'].includes(this.type) &&
              lastType != null &&
              lastType !== 'h1'
            ) {
              doc.addPage();
            }

            if (this.type === 'h1') {
              doc.h1Outline = doc.outline.addItem(fragment.text);
            } else if (this.type === 'h2' && doc.h1Outline !== null) {
              doc.h1Outline.addItem(fragment.text);
            }

            // set styles and whether this fragment is continued (for rich text wrapping)
            const options = this.setStyle(doc);
            if (options.continued == null) {
              options.continued = continued || index < this.content.length - 1;
            }

            // remove newlines unless this is code
            if (this.type !== 'code') {
              fragment.text = fragment.text.replace(/[\r\n]\s*/g, ' ');
            }

            doc.text(fragment.text, options);
          } else {
            fragment.render(
              doc,
              index < this.content.length - 1 && this.type !== 'bulletlist',
            );
          }

          lastType = this.type;
        }
    }

    if (this.style.padding) {
      return (doc.y += this.style.padding);
    }
  }
}

// reads and renders a markdown/literate javascript file to the document
const render = (doc, filename) => {
  codeBlocks = [];
  const tree = markdown.parse(fs.readFileSync(filename, 'utf8'));
  tree.shift();

  const result = [];
  while (tree.length) {
    const node = new Node(tree.shift());
    result.push(node.render(doc));
  }
  return result;
};

// renders the title page of the guide
const renderTitlePage = (doc) => {
  const title = 'PDFKit Guide';
  const author = 'By Devon Govett';
  const version = `Version ${require('../package.json').version}`;

  doc.font('fonts/AlegreyaSans-Light.ttf', 60);
  doc.y = doc.page.height / 2 - doc.currentLineHeight();
  doc.text(title, { align: 'center' });
  const w = doc.widthOfString(title);
  doc.h1Outline = doc.outline.addItem(title);

  doc.fontSize(20);
  doc.y -= 10;
  doc.text(author, {
    align: 'center',
    indent: w - doc.widthOfString(author),
  });

  doc.font(styles.para.font, 10);
  doc.text(version, {
    align: 'center',
    indent: w - doc.widthOfString(version),
  });

  doc.addPage();
};

// render all sections of the guide and write the pdf file
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('guide.pdf'));
renderTitlePage(doc);
render(doc, 'getting_started.md');
render(doc, 'paper_sizes.md');
render(doc, 'vector.md');
render(doc, 'text.md');
render(doc, 'images.md');
render(doc, 'outline.md');
render(doc, 'annotations.md');
render(doc, 'forms.md');
render(doc, 'destinations.md');
render(doc, 'attachments.md');
render(doc, 'accessibility.md');
render(doc, 'table.md');
render(doc, 'you_made_it.md');
doc.end();
