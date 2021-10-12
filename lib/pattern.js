/*
PDF tiling pattern support.
uncolored only for now
*/
class PDFTilingPattern {
  constructor(doc, bBox, xStep, yStep, stream) {
    this.doc = doc;
    this.bBox = bBox;
    this.xStep = xStep;
    this.yStep = yStep;
    this.stream = stream;
  }

  embed() {
    // reused pattern
    if (this.id) return;
    // if id is present then we surely must have embedded the color spaces
    this.doc._embedPatternColorSpaces();

    this.doc._patternCount = this.doc._patternCount + 1;
    this.id = 'P' + this.doc._patternCount;

    // no resources needed for our current usage
    // required entry
    const resources = this.doc.ref();
    resources.end();
    // we don't define the Matrix here since the default identity is OK for our current usage
    // (uses the page initial coordinate system - see 8.7.2 General Properties of Patterns
    // in ISO  32000-1)
    this.pattern = this.doc.ref({
      Type: 'Pattern',
      PatternType: 1, // tiling
      PaintType: 2, // 1-colored, 2-uncolored
      TilingType: 2, // 2-no distortion
      BBox: this.bBox,
      XStep: this.xStep,
      YStep: this.yStep,
      Resources: resources
    });
    this.pattern.end(this.stream);
    this.doc.page.patterns[this.id] = this.pattern;
  }

  apply(stroke, patternColor) {
    this.embed();

    const op = stroke ? 'SCN' : 'scn';

    const normalizedColor = this.doc._normalizeColor(patternColor);
    if (!normalizedColor)
      throw Error(`invalid pattern color. (value: ${patternColor})`);

    const csId = this.doc._getPatternColorSpaceId(
      this.doc._getColorSpace(normalizedColor)
    );
    this.doc._setColorSpace(csId, stroke);

    return this.doc.addContent(
      `${normalizedColor.join(' ')} /${this.id} ${op}`
    );
  }
}

export default { PDFTilingPattern };
