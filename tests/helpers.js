var PDFDocument = require('../lib/document').default;
var path = require('path');
var fs = require('fs');

function updatePdf (pdfData, testState, snapshotChanges) {
  const pdfDir = path.join(path.dirname(testState.testPath), '__pdfs__');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir);
  }

  const fileRefPath = path.join(pdfDir, testState.currentTestName + '.pdf');
  const fileChangesPath = fileRefPath.replace('.pdf', '[changed].pdf');

  const {matched, added, unmatched, updated} = snapshotChanges;

  if (added || updated || (matched && !fs.existsSync(fileRefPath))) {
    fs.writeFileSync(fileRefPath, pdfData);
  }

  if (updated) {
    if (fs.existsSync(fileChangesPath)) {
      fs.unlinkSync(fileChangesPath);
    }
  }

  if (unmatched) {
    fs.writeFileSync(fileChangesPath, pdfData);
  }
}


function getSnapshotChanges(snapshotState) {
  const {matched, added, unmatched, updated} = snapshotState
  return {matched, added, unmatched, updated}
}

function compareSnapshotChanges(changes, previousChanges) {
  return Object.keys(changes).reduce((result, key) => {
    result[key] = changes[key] - previousChanges[key]
    return result
  }, {})
}

function runDocTest(options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  if (!options.info) {
    options.info = {};
  }
  options.info.CreationDate = new Date(Date.UTC(2018,1,1));

  return new Promise(function(resolve) {
    var doc = new PDFDocument(options);
    var buffers = [];

    fn(doc);

    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const testState = expect.getState()
      const pdfData = Buffer.concat(buffers)
      const previousChanges = getSnapshotChanges(testState.snapshotState)
      expect(pdfData.toString()).toMatchSnapshot()
      const changes = getSnapshotChanges(testState.snapshotState)
      updatePdf(pdfData, testState, compareSnapshotChanges(changes, previousChanges))
      resolve();
    });
    doc.end();
  })
}

module.exports = {
  runDocTest: runDocTest
}