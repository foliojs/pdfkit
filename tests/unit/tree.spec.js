import PDFDocument from '../../lib/document';
import PDFNameTree from '../../lib/name_tree';
import PDFNumberTree from '../../lib/number_tree';
import PDFObject from '../../lib/object';
import { fromBinaryString, toBinaryString } from '../../lib/binary';
import { collectPdf } from './helpers';

// Stand-in for a real cipher: uppercasing keeps the expected output readable
// while still showing that every string went through it individually
const encryptFn = (bytes) =>
  fromBinaryString(toBinaryString(bytes).toUpperCase());

describe.each([
  [
    'PDFNameTree',
    {
      Tree: PDFNameTree,
      keys: ['a', 'b'],
      plain: `<<
  /Limits [(a) (b)]
  /Names [
    (a) (one)
    (b) (two)
]
>>`,
      // the keys are PDF strings, so they get encrypted just like the values
      encrypted: `<<
  /Limits [(A) (B)]
  /Names [
    (A) (ONE)
    (B) (TWO)
]
>>`,
    },
  ],
  [
    'PDFNumberTree',
    {
      Tree: PDFNumberTree,
      keys: [1, 2],
      plain: `<<
  /Limits [1 2]
  /Nums [
    1 (one)
    2 (two)
]
>>`,
      // the keys are numbers rather than strings, so they stay as they are
      encrypted: `<<
  /Limits [1 2]
  /Nums [
    1 (ONE)
    2 (TWO)
]
>>`,
    },
  ],
])('%s', (_treeName, { Tree, keys, plain, encrypted }) => {
  let tree;

  beforeEach(() => {
    tree = new Tree();
    tree.add(keys[0], new String('one'));
    tree.add(keys[1], new String('two'));
  });

  test('is written in plain text without an encryption function', () => {
    expect(PDFObject.convert(tree)).toEqual(plain);
  });

  test('is encrypted with an encryption function', () => {
    expect(PDFObject.convert(tree, encryptFn)).toEqual(encrypted);
  });
});

describe('name trees in a document', () => {
  const names = ['(heading)', '(data.txt)', 'app.alert'];

  const writeDocument = (options = {}) => {
    const document = new PDFDocument(options);
    document.text('link', { destination: 'heading' });
    document.file(Buffer.from('example text'), { name: 'data.txt' });
    document.addNamedJavaScript('hello', 'app.alert("hi")');
    return collectPdf(document);
  };

  test.each(names)('writes %s in plain text when not encrypted', (name) => {
    expect(writeDocument()).toContain(name);
  });

  test.each(names)('never writes %s when encrypted', (name) => {
    expect(writeDocument({ userPassword: 'secret' })).not.toContain(name);
  });
});
