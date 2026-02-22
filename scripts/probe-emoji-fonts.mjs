/**
 * Phase 1 – fontkit color-emoji API probe
 *
 * Usage:  node scripts/probe-emoji-fonts.mjs
 *
 * Tests SBIX (Apple Color Emoji) and COLR/CPAL APIs exposed by fontkit 2.x.
 */

import * as fontkit from 'fontkit';
import fs from 'fs';

const TEST_EMOJI = [
  { label: 'grinning face',  cp: 0x1F600 },
  { label: 'thumbs up',      cp: 0x1F44D },
  { label: 'red heart',      cp: 0x2764  },
  { label: 'flag: US (ZWJ)', cp: 0x1F1FA }, // first cp of 🇺🇸
];

function probeFont(path, family) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Font: ${path}${family ? ` [${family}]` : ''}`);
  console.log('='.repeat(60));

  let font;
  try {
    const buf = fs.readFileSync(path);
    const top = fontkit.create(buf);

    // For TTC collections, enumerate fonts then pick the right one
    if (top.type === 'TTC') {
      const psNames = top.fonts.map(f => f.postscriptName);
      console.log(`  TTC fonts (postscriptName): ${JSON.stringify(psNames)}`);
      // Pick by exact family match or first that includes the family string
      const match = family
        ? (psNames.find(n => n === family) ||
           psNames.find(n => n && n.toLowerCase().includes(family.toLowerCase().replace(/\s/g, ''))))
        : psNames[0];
      if (!match) {
        console.error(`  ERROR: no font matching "${family}" in TTC`);
        return;
      }
      console.log(`  Using postscriptName: ${match}`);
      font = top.getFont(match);
    } else {
      font = top;
    }
  } catch (e) {
    console.error('  ERROR loading font:', e.message);
    return;
  }

  console.log(`  postscriptName : ${font.postscriptName}`);
  console.log(`  unitsPerEm     : ${font.unitsPerEm}`);
  console.log(`  ascent         : ${font.ascent}`);
  console.log(`  descent        : ${font.descent}`);

  // Detect color table presence
  const dir = font.directory.tables;
  console.log(`\n  Table presence:`);
  console.log(`    sbix  : ${!!dir.sbix}`);
  console.log(`    COLR  : ${!!dir.COLR}`);
  console.log(`    CPAL  : ${!!dir.CPAL}`);
  console.log(`    CBDT  : ${!!dir.CBDT}`);
  console.log(`    CBLC  : ${!!dir.CBLC}`);
  console.log(`    SVG   : ${!!(dir['SVG '] || dir.SVG)}`);

  console.log(`\n  Per-emoji glyph audit:`);
  for (const { label, cp } of TEST_EMOJI) {
    const has = font.hasGlyphForCodePoint(cp);
    process.stdout.write(`    U+${cp.toString(16).toUpperCase().padStart(4,'0')} ${label}: has=${has}`);
    if (!has) { console.log(); continue; }

    const glyph = font.glyphForCodePoint(cp);
    if (!glyph) {
      console.log('  glyph=null');
      continue;
    }
    process.stdout.write(`  type=${glyph.type}  id=${glyph.id}  advW=${glyph.advanceWidth}`);

    if (glyph.type === 'SBIX') {
      const img = glyph.getImageForSize(64);
      if (img) {
        process.stdout.write(`  imgType=${JSON.stringify(img.type)}  dataLen=${img.data.length}  origin=(${img.originX},${img.originY})`);
      } else {
        process.stdout.write('  img=null');
      }
    }

    if (glyph.type === 'COLR') {
      const layers = glyph.layers;
      process.stdout.write(`  layers=${layers.length}`);
      for (const { glyph: lg, color } of layers.slice(0, 2)) {
        const cmds = lg.path.commands.length;
        process.stdout.write(`  [pathCmds=${cmds} rgba=(${color.red},${color.green},${color.blue},${color.alpha})]`);
      }
    }

    console.log();
  }

  // Probe SBIX sizes if table exists
  if (dir.sbix) {
    try {
      const sbix = font.sbix;
      const ppems = sbix.imageTables.map(t => t.ppem).join(', ');
      console.log(`\n  SBIX available ppem sizes: [${ppems}]`);
    } catch(e) {
      console.log(`\n  SBIX read error: ${e.message}`);
    }
  }

  // Probe COLR version if table exists
  if (dir.COLR) {
    try {
      const colr = font.COLR;
      console.log(`\n  COLR version: ${colr.version}  baseGlyphRecords: ${colr.numBaseGlyphRecords}`);
    } catch(e) {
      console.log(`\n  COLR read error: ${e.message}`);
    }
  }
}

// ── Probe fonts ─────────────────────────────────────────────────────────────

probeFont('/System/Library/Fonts/Apple Color Emoji.ttc', 'Apple Color Emoji');

// If a Noto Color Emoji is present locally or was downloaded
const notoPath = 'tests/fonts/NotoColorEmoji.ttf';
if (fs.existsSync(notoPath)) {
  probeFont(notoPath);
} else {
  console.log(`\nNoto Color Emoji not found at ${notoPath} – skipping CBDT probe.`);
  console.log('Download from: https://github.com/googlefonts/noto-emoji/releases');
}

