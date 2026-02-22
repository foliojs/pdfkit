const fontkit = require('fontkit');
const fs = require('fs');

const notoData = fs.readFileSync('tests/fonts/NotoColorEmoji.ttf');
const notoFont = fontkit.create(notoData);

console.log('=== NotoColorEmoji characterSet probe ===');
const chars = Array.from(notoFont.characterSet);
console.log('Total chars in characterSet:', chars.length);
// Show all chars above U+00FF (non-ASCII)
const nonAscii = chars.filter(c => c > 0xFF);
console.log('Non-ASCII chars:', nonAscii.length);
console.log('First 30 non-ASCII:', nonAscii.slice(0, 30).map(c => 'U+' + c.toString(16).toUpperCase()));
// Check for emoji codepoints
const emojiRange = chars.filter(c => c >= 0x1F000);
console.log('Emoji range (U+1F000+):', emojiRange.length);
console.log('First 20 emoji:', emojiRange.slice(0, 20).map(c => 'U+' + c.toString(16).toUpperCase()));

// Try cmap subtables
const cmap = notoFont.cmap;
console.log('cmap subtables:', cmap.tables?.length);
if (cmap.tables) {
  cmap.tables.forEach((t, i) => {
    console.log(`  cmap[${i}]: platformID=${t.platformID} encodingID=${t.encodingID} format=${t.table?.version}`);
  });
}

// Check fontkit's parsed subtable entry more carefully
const cblc = notoFont.CBLC;
const entry0 = cblc.sizes[0].indexSubTableArray[0];
console.log('\nindexSubTableArray[0] keys:', Object.keys(entry0));
console.log('entry0.subtable:', entry0.subtable);
if (entry0.subtable) {
  console.log('subtable keys:', Object.keys(entry0.subtable));
  console.log('subtable.header:', entry0.subtable.header);
  console.log('subtable.version:', entry0.subtable.version);
}

