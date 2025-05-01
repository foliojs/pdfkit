/**
 * @import PDFDocument from '../../lib/document';
 */

/**
 * @typedef {object} TextStream
 * @property {string} text
 * @property {string} font
 * @property {number} fontSize
 *
 * @typedef {string | Buffer} PDFDataItem
 * @typedef {Array<PDFDataItem>} PDFData
 *
 * @typedef {object} PDFDataObject
 * @property {PDFDataItem[]} items
 */

/**
 * @param {PDFDocument} doc
 * @return {PDFData}
 */
function logData(doc) {
  const loggedData = [];
  const originalMethod = doc._write;
  doc._write = function (data) {
    loggedData.push(data);
    originalMethod.call(this, data);
  };
  return loggedData;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function joinTokens(...args) {
  let a = args.map((i) => escapeRegExp(i));
  let r = new RegExp('^' + a.join('\\s*') + '$');
  return r;
}

/**
 * @description
 * Returns an array of objects from the PDF data. Object items are surrounded by /\d 0 obj/ and 'endobj'.
 * @param {PDFData} data
 * @return {Array<PDFDataObject>}
 */
function getObjects(data) {
  const objects = [];
  let currentObject = null;
  for (const item of data) {
    if (item instanceof Buffer) {
      if (currentObject) {
        currentObject.items.push(item);
      }
    } else if (typeof item === 'string') {
      if (/^\d+\s0\sobj/.test(item)) {
        currentObject = { items: [] };
        objects.push(currentObject);
      } else if (item === 'endobj') {
        currentObject = null;
      } else if (currentObject) {
        currentObject.items.push(item);
      }
    }
  }
  return objects;
}

/**
 * @param {Buffer} textStream
 * @return {TextStream | undefined}
 */
function parseTextStream(textStream) {
  const decodedStream = textStream.toString('utf8');

  // Extract font and font size
  const fontMatch = decodedStream.match(/\/([A-Za-z0-9]+)\s+(\d+)\s+Tf/);

  if (!fontMatch) {
    return undefined;
  }

  const font = fontMatch[1];
  const fontSize = parseInt(fontMatch[2], 10);

  // Extract hex strings inside TJ array
  const tjMatch = decodedStream.match(/\[([^\]]+)\]\s+TJ/);
  if (!tjMatch) {
    return undefined;
  }
  let text = '';

  // this is a simplified version
  // the correct way is to retrieve the encoding from /Resources /Font dictionary and decode using it
  // https://stackoverflow.com/a/29468049/5724645

  // Match all hex strings like <...>
  const hexMatches = [...tjMatch[1].matchAll(/<([0-9a-fA-F]+)>/g)];
  for (const m of hexMatches) {
    // Convert hex to string
    const hex = m[1];
    for (let i = 0; i < hex.length; i += 2) {
      const code = parseInt(hex.substr(i, 2), 16);
      let char = String.fromCharCode(code);
      // Handle special cases
      if (code === 0x0a) {
        char = '\n'; // Newline
      } else if (code === 0x0d) {
        char = '\r'; // Carriage return
      } else if (code === 0x85) {
        char = '...';
      }
      text += char;
    }
  }

  return { text, font, fontSize };
}

export { logData, joinTokens, parseTextStream, getObjects };
