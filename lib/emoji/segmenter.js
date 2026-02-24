/**
 * Emoji Segmenter — splits text into plain-text vs emoji runs.
 *
 * Uses Unicode ranges as a heuristic to detect emoji code points,
 * then groups consecutive emoji (including ZWJ sequences, variation
 * selectors, skin-tone modifiers, and regional indicators) into
 * single segments.
 */

// Zero-Width Joiner
const ZWJ = 0x200d;

// Variation Selector 16 (emoji presentation)
const VS16 = 0xfe0f;

// Variation Selector 15 (text presentation)
const VS15 = 0xfe0e;

// Combining Enclosing Keycap
const KEYCAP = 0x20e3;

/**
 * Check if a code point is in an emoji-related Unicode range.
 * This is a heuristic — it catches the vast majority of emoji
 * but may include some non-emoji symbols. The font's glyph
 * lookup is the final authority at render time.
 */
function isEmojiCodePoint(cp) {
  return (
    // Miscellaneous Symbols and Dingbats
    (cp >= 0x2600 && cp <= 0x27bf) ||
    // Supplemental Arrows / Misc Symbols
    (cp >= 0x2b50 && cp <= 0x2b55) ||
    // CJK Symbols (wavy dash, etc.)
    cp === 0x3030 ||
    cp === 0x303d ||
    // Enclosed CJK Letters
    cp === 0x3297 ||
    cp === 0x3299 ||
    // Enclosed Alphanumeric Supplement (circled letters, etc.)
    (cp >= 0x1f100 && cp <= 0x1f1ff) ||
    // Regional Indicator Symbols
    (cp >= 0x1f1e6 && cp <= 0x1f1ff) ||
    // Miscellaneous Symbols and Pictographs
    (cp >= 0x1f300 && cp <= 0x1f5ff) ||
    // Emoticons
    (cp >= 0x1f600 && cp <= 0x1f64f) ||
    // Transport and Map Symbols
    (cp >= 0x1f680 && cp <= 0x1f6ff) ||
    // Supplemental Symbols and Pictographs
    (cp >= 0x1f900 && cp <= 0x1f9ff) ||
    // Symbols and Pictographs Extended-A
    (cp >= 0x1fa00 && cp <= 0x1fa6f) ||
    // Symbols and Pictographs Extended-B
    (cp >= 0x1fa70 && cp <= 0x1faff) ||
    // Miscellaneous Symbols (copyright, registered, etc.)
    cp === 0x00a9 ||
    cp === 0x00ae ||
    // General Punctuation (trade mark, etc.)
    cp === 0x2122 ||
    // Arrows
    (cp >= 0x2190 && cp <= 0x21aa) ||
    // Misc Technical (phone, hourglass, etc.)
    (cp >= 0x2300 && cp <= 0x23ff) ||
    // Enclosed Alphanumerics
    (cp >= 0x24c2 && cp <= 0x24c2) ||
    // Geometric Shapes
    (cp >= 0x25aa && cp <= 0x25fe) ||
    // Playing cards, mahjong
    (cp >= 0x1f004 && cp <= 0x1f0cf) ||
    // Skin tone modifiers (Fitzpatrick)
    (cp >= 0x1f3fb && cp <= 0x1f3ff) ||
    // Tags block (used in flag sequences like England, Scotland)
    (cp >= 0xe0020 && cp <= 0xe007f)
  );
}

/**
 * Check if a code point is a modifier/joiner that extends an emoji sequence.
 */
function isEmojiModifier(cp) {
  return (
    cp === ZWJ ||
    cp === VS16 ||
    cp === KEYCAP ||
    // Skin tone modifiers
    (cp >= 0x1f3fb && cp <= 0x1f3ff) ||
    // Tags block (flag sub-sequences)
    (cp >= 0xe0020 && cp <= 0xe007f)
  );
}

/**
 * Check if a code point is a keycap base character (0-9, #, *).
 * These become emoji when followed by VS16 + Combining Enclosing Keycap.
 */
function isKeycapBase(cp) {
  return (cp >= 0x30 && cp <= 0x39) || cp === 0x23 || cp === 0x2a;
}

/**
 * Check if a code point is a Regional Indicator Symbol letter.
 */
function isRegionalIndicator(cp) {
  return cp >= 0x1f1e6 && cp <= 0x1f1ff;
}

/**
 * Extract code points from a string, handling UTF-16 surrogate pairs.
 * Returns an array of { cp: number, index: number, length: number }
 * where index is the position in the original string and length is the
 * number of UTF-16 code units consumed.
 */
function codePoints(str) {
  const result = [];
  for (let i = 0; i < str.length; ) {
    const code = str.codePointAt(i);
    const len = code > 0xffff ? 2 : 1;
    result.push({ cp: code, index: i, length: len });
    i += len;
  }
  return result;
}

/**
 * Segment a text string into runs of plain text and emoji.
 *
 * @param {string} text - The input text
 * @returns {Array<{type: 'text'|'emoji', text: string}>} Segments in order
 */
function segmentEmojiText(text) {
  if (!text) return [];

  const cps = codePoints(text);
  const segments = [];
  let currentType = null;
  let currentStart = 0;
  let i = 0;

  while (i < cps.length) {
    const { cp } = cps[i];

    // Keycap sequences: digit/# /* + VS16 + KEYCAP (U+20E3)
    // The base character (0-9, #, *) is NOT in the emoji range,
    // so we must detect the full sequence by lookahead.
    if (
      isKeycapBase(cp) &&
      i + 1 < cps.length &&
      (cps[i + 1].cp === VS16 || cps[i + 1].cp === KEYCAP)
    ) {
      // Looks like a keycap sequence — treat as emoji
      if (currentType === 'text') {
        const end = cps[i].index;
        if (end > currentStart) {
          segments.push({ type: 'text', text: text.slice(currentStart, end) });
        }
        currentStart = cps[i].index;
      }
      currentType = 'emoji';
      i++; // consume base character
      // Consume VS16 if present
      if (i < cps.length && cps[i].cp === VS16) {
        i++;
      }
      // Consume KEYCAP if present
      if (i < cps.length && cps[i].cp === KEYCAP) {
        i++;
      }
    } else if (isEmojiCodePoint(cp)) {
      // Start or continue an emoji segment
      if (currentType === 'text') {
        // Flush text segment
        const end = cps[i].index;
        if (end > currentStart) {
          segments.push({ type: 'text', text: text.slice(currentStart, end) });
        }
        currentStart = cps[i].index;
      }
      currentType = 'emoji';

      // Consume the full emoji sequence
      i++;

      // Handle regional indicator pairs (flags)
      if (
        isRegionalIndicator(cp) &&
        i < cps.length &&
        isRegionalIndicator(cps[i].cp)
      ) {
        i++; // consume second regional indicator
      }

      // Consume trailing modifiers, VS16, ZWJ + next emoji
      while (i < cps.length) {
        const next = cps[i].cp;
        if (isEmojiModifier(next) || next === VS16) {
          i++;
        } else if (next === ZWJ && i + 1 < cps.length) {
          // ZWJ sequence: consume ZWJ + following emoji
          i++; // consume ZWJ
          if (
            i < cps.length &&
            (isEmojiCodePoint(cps[i].cp) || cps[i].cp === VS16)
          ) {
            i++; // consume next emoji
            // Continue consuming modifiers after ZWJ target
          } else {
            break;
          }
        } else {
          break;
        }
      }
    } else if (cp === VS15) {
      // Text presentation selector — force previous emoji to text if it was a single cp
      // For simplicity, just treat VS15 as part of the current run
      if (currentType !== 'emoji') {
        if (currentType !== 'text') {
          currentType = 'text';
          currentStart = cps[i].index;
        }
      }
      i++;
    } else {
      // Plain text code point
      if (currentType === 'emoji') {
        // Flush emoji segment
        const end = cps[i].index;
        if (end > currentStart) {
          segments.push({ type: 'emoji', text: text.slice(currentStart, end) });
        }
        currentStart = cps[i].index;
      }
      if (currentType !== 'text') {
        currentType = 'text';
        currentStart = cps[i].index;
      }
      i++;
    }
  }

  // Flush final segment
  if (currentType && currentStart < text.length) {
    segments.push({ type: currentType, text: text.slice(currentStart) });
  }

  return segments;
}

export { segmentEmojiText, isEmojiCodePoint, codePoints };
