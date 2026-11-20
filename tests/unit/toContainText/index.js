import { getObjects, parseTextStreams } from '../helpers.js';

/**
 * @import { TextStream, PDFDataObject } from '../helpers.js';
 * @import JestMatchedUtils from 'jest-matcher-utils';
 */

/**
 * @typedef {Partial<TextStream> & Pick<Required<TextStream>, 'text'>} TextStreamMatcher
 */

/**
 * @param {JestMatchedUtils} utils
 * @param {TextStreamMatcher} argument
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

// Compare position if provided, using Jest's toBeCloseTo-like logic
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const toBeClose = (received, expected, precision = 2) => {
  if (!isNumber(received) || !isNumber(expected)) return false;
  const tolerance = Math.pow(10, -precision) / 2;
  return Math.abs(received - expected) < tolerance;
};

/**
 * @param {TextStreamMatcher} expected
 * @param {TextStream} actual
 * @return {boolean}
 */
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

  if (isNumber(expected.x)) {
    if (!toBeClose(actual.x, expected.x)) return false;
  }

  if (isNumber(expected.y)) {
    if (!toBeClose(actual.y, expected.y)) return false;
  }

  return true;
}

/**
 * @param {TextStreamMatcher} expected
 * @param {TextStream[]} list
 * @return {boolean}
 */
function containsTextStream(expected, list) {
  return list.some((actual) => textStreamMatches(expected, actual));
}

/**
 * @param {PDFDataObject} object
 * @return {TextStream[] | undefined}
 */
function getTextStreams(object) {
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

  const decodedStream = object.items[2].toString('utf8');

  return parseTextStreams(decodedStream);
}

export default {
  /**
   *
   * @param {(string | Buffer)[]} data
   * @param {TextStreamMatcher} expected
   * @returns
   */
  toContainText(data, expected) {
    const objects = getObjects(data);
    /**
     * @type {TextStream[]}
     */
    const foundTextStreams = [];
    let pass = false;

    for (const object of objects) {
      const textStreamObjects = getTextStreams(object);
      if (!textStreamObjects) {
        continue;
      }
      foundTextStreams.push(...textStreamObjects);

      if (containsTextStream(expected, textStreamObjects)) {
        pass = true;
        break;
      }
    }

    if (pass) {
      return {
        pass: true,
        message: passMessage(this.utils, expected),
      };
    }

    return {
      pass: false,
      message: failMessage(this.utils, foundTextStreams, expected),
    };
  },
};
