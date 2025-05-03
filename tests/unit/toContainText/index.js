import { getObjects, parseTextStream } from '../helpers.js';

/**
 * @import { TextStream, PDFDataObject } from '../helpers.js';
 * @import JestMatchedUtils from 'jest-matcher-utils';
 */

/**
 * @param {JestMatchedUtils} utils
 * @param {TextStream} argument
 * @return {string}
 */
const passMessage = (utils, argument) => () => {
  return (
    utils.matcherHint('.not.toContainText', 'data', 'textStream') +
    '\n\n' +
    `Expected data not to contain text:\n\n${utils.printExpected(argument)}`
  );
};

/**
 * @param {JestMatchedUtils} utils
 * @param {TextStream[]} received
 * @param {TextStream} argument
 * @return {string}
 */
const failMessage = (utils, received, argument) => () => {
  return (
    utils.matcherHint('.toContainText', 'data', 'textStream') +
    '\n\n' +
    `Expected data to contain text:\n\n${utils.printExpected(argument)}\n\nFound:\n\n${utils.printReceived(received)}`
  );
};

function textStreamMatches(expected, actual) {
  if (expected.text !== actual.text) {
    return false;
  }

  if (expected.font && expected.font !== actual.font) {
    return false;
  }

  if (expected.fontSize && expected.fontSize !== actual.fontSize) {
    return false;
  }

  return true;
}

/**
 * @param {PDFDataObject} object
 * @return {TextStream | undefined}
 */
function getTextStream(object) {
  // text stream objects have 4 items
  // first item is a string containing the Length of the stream
  // second item 'stream'
  // third item is the stream content Buffer
  // fourth item is 'endstream'

  if (object.items.length !== 4) {
    return;
  }
  if (typeof object.items[0] !== 'string') {
    return;
  }
  if (object.items[1] !== 'stream') {
    return;
  }
  if (!(object.items[2] instanceof Buffer)) {
    return;
  }
  if (!/endstream/.test(object.items[3])) {
    return;
  }

  return parseTextStream(object.items[2]);
}

export default {
  /**
   *
   * @param {(string | Buffer)[]} data
   * @param {Partial<TextStream>} textStream
   * @returns
   */
  toContainText(data, textStream) {
    const objects = getObjects(data);
    const foundTextStreams = [];
    let pass = false;

    for (const object of objects) {
      const objectTextStream = getTextStream(object, textStream);
      if (!objectTextStream) {
        continue;
      }
      foundTextStreams.push(objectTextStream);
      if (textStreamMatches(textStream, objectTextStream)) {
        pass = true;
        break;
      }
    }

    if (pass) {
      return {
        pass: true,
        message: passMessage(this.utils, textStream),
      };
    }

    return {
      pass: false,
      message: failMessage(this.utils, foundTextStreams, textStream),
    };
  },
};
