const passMessage = (utils, chunk) => () =>
  utils.matcherHint('.not.toContainChunk', 'data', 'chunk') +
  '\n\n' +
  'Expected data to contain chunk:\n' +
  `  ${utils.printExpected(chunk)}\n`;

const failMessage = (utils, chunk) => () =>
  utils.matcherHint('.toContainChunk', 'data', 'chunk') +
  '\n\n' +
  'Expected data to contain chunk:\n' +
  `  ${utils.printExpected(chunk)}\n`;

export default {
  toContainChunk(data, chunk) {
    let pass = false;
    let startIndex = data.indexOf(chunk[0]);
    for (let i = 1; i < chunk.length; ++i) {
      pass = this.equals(data[startIndex + i], chunk[i]);
    }

    if (pass) {
      return { pass: true, message: passMessage(this.utils, chunk) };
    }

    return { pass: false, message: failMessage(this.utils, chunk) };
  }
};
