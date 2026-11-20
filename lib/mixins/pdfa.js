import fs from '#fs';

let iccProfilePath;
let iccProfile;

// Resolved on first use rather than at import time: a bundler that folds this
// module into a CommonJS output leaves `import.meta.url` undefined, and a
// document that never produces PDF/A output has no reason to fail over it.
export const getIccProfilePath = () => {
  if (iccProfilePath === undefined) {
    if (import.meta.url == null) {
      throw new Error(
        'pdfkit cannot locate its sRGB ICC profile because import.meta.url ' +
          'is not available in this build. Bundle pdfkit as ESM or mark it ' +
          'as external in the bundler.',
      );
    }

    iccProfilePath = new URL('./data/sRGB_IEC61966_2_1.icc', import.meta.url)
      .href;
  }

  return iccProfilePath;
};

export default {
  initPDFA(pSubset) {
    if (pSubset.charAt(pSubset.length - 3) === '-') {
      this.subset_conformance = pSubset
        .charAt(pSubset.length - 1)
        .toUpperCase();
      this.subset = parseInt(pSubset.charAt(pSubset.length - 2));
    } else {
      // Default to Basic conformance when user doesn't specify
      this.subset_conformance = 'B';
      this.subset = parseInt(pSubset.charAt(pSubset.length - 1));
    }
  },

  endSubset() {
    this._addPdfaMetadata();
    this._addColorOutputIntent();
  },

  _addColorOutputIntent() {
    if (!iccProfile) {
      iccProfile = fs.readFileSync(getIccProfilePath());
    }

    const colorProfileRef = this.ref({
      Length: iccProfile.length,
      N: 3,
    });
    colorProfileRef.write(iccProfile);
    colorProfileRef.end();

    const intentRef = this.ref({
      Type: 'OutputIntent',
      S: 'GTS_PDFA1',
      Info: new String('sRGB IEC61966-2.1'),
      OutputConditionIdentifier: new String('sRGB IEC61966-2.1'),
      DestOutputProfile: colorProfileRef,
    });
    intentRef.end();

    this._root.data.OutputIntents = [intentRef];
  },

  _getPdfaid() {
    return `
        <rdf:Description xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/" rdf:about="">
            <pdfaid:part>${this.subset}</pdfaid:part>
            <pdfaid:conformance>${this.subset_conformance}</pdfaid:conformance>
        </rdf:Description>
        `;
  },

  _addPdfaMetadata() {
    this.appendXML(this._getPdfaid());
  },
};
