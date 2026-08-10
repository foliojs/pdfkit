import bidiFactory from 'bidi-js';

let bidiInstance = null;
function getBidi() {
  if (bidiInstance == null) {
    bidiInstance = bidiFactory();
  }
  return bidiInstance;
}

const RTL_RANGES = [
  [0x0590, 0x05ff], // Hebrew
  [0xfb1d, 0xfb4f], // Hebrew presentation forms
  [0x0600, 0x06ff], // Arabic
  [0x0700, 0x074f], // Syriac
  [0x0780, 0x07bf], // Thaana
  [0x07c0, 0x07ff], // NKo
  [0x0800, 0x083f], // Samaritan
  [0xfb50, 0xfdff], // Arabic presentation forms-A
  [0xfe70, 0xfeff], // Arabic presentation forms-B
];

export function containsRTL(text) {
  if (!text) return false;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (const [lo, hi] of RTL_RANGES) {
      if (code >= lo && code <= hi) return true;
    }
  }
  return false;
}

export function detectBaseDirection(text) {
  if (!text || !containsRTL(text)) return 'ltr';
  const { paragraphs } = getBidi().getEmbeddingLevels(text);
  return paragraphs[0]?.level === 1 ? 'rtl' : 'ltr';
}

export function resolveLine(text, baseDirection) {
  const bidi = getBidi();
  const { levels, paragraphs } = bidi.getEmbeddingLevels(text, baseDirection);
  const paragraphLevel = paragraphs[0]?.level ?? 0;
  return { levels, paragraphLevel };
}

export function applyMirroring(text, levels) {
  const bidi = getBidi();
  const mirrors = bidi.getMirroredCharactersMap(text, levels);
  if (mirrors.size === 0) return text;
  const chars = text.split('');
  mirrors.forEach((replacement, idx) => {
    chars[idx] = replacement;
  });
  return chars.join('');
}

function segmentRuns(text, levels, start, end) {
  const runs = [];
  let runStart = start;
  let runLevel = levels[start];
  for (let i = start + 1; i < end; i++) {
    if (levels[i] !== runLevel) {
      runs.push({
        text: text.slice(runStart, i),
        level: runLevel,
        start: runStart,
        end: i,
      });
      runStart = i;
      runLevel = levels[i];
    }
  }
  if (runStart < end) {
    runs.push({
      text: text.slice(runStart, end),
      level: runLevel,
      start: runStart,
      end: end,
    });
  }
  return runs;
}

// UAX #9 L2: from highest level to lowest odd, reverse contiguous run sequences
// at that level or higher.
function reorderRunsVisually(runs, paragraphLevel) {
  if (runs.length <= 1) return runs.slice();
  let maxLevel = paragraphLevel;
  for (const run of runs) {
    if (run.level > maxLevel) maxLevel = run.level;
  }
  const result = runs.slice();
  for (let level = maxLevel; level >= 1; level--) {
    let i = 0;
    while (i < result.length) {
      if (result[i].level >= level) {
        let j = i + 1;
        while (j < result.length && result[j].level >= level) j++;
        const segment = result.slice(i, j).reverse();
        result.splice(i, j - i, ...segment);
        i += segment.length;
      } else {
        i++;
      }
    }
  }
  return result;
}

// Resolve a line of text into visual-order runs ready for shaping.
// Each returned run has { text, direction } in visual order; concatenating
// them while drawing LTR at incrementing x produces correct visual output.
export function visualRuns(text, baseDirection) {
  if (!text) return [];
  if (!containsRTL(text)) {
    return [{ text, direction: baseDirection === 'rtl' ? 'rtl' : 'ltr' }];
  }
  const { levels, paragraphLevel } = resolveLine(text, baseDirection);
  const mirrored = applyMirroring(text, levels);
  const runs = segmentRuns(mirrored, levels, 0, text.length);
  const ordered = reorderRunsVisually(runs, paragraphLevel);
  return ordered.map((run) => ({
    text: run.text,
    direction: run.level % 2 === 1 ? 'rtl' : 'ltr',
  }));
}
