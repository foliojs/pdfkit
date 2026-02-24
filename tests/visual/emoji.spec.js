import { runDocTest } from './helpers';
import fs from 'fs';

const EMOJI_FONT = '/System/Library/Fonts/Apple Color Emoji.ttc';
const emojiAvailable = fs.existsSync(EMOJI_FONT);
const emojiDescribe = emojiAvailable ? describe : describe.skip;

emojiDescribe('emoji', function () {
  const docOptions = {
    compress: false,
    emojiFont: EMOJI_FONT,
    emojiFontFamily: 'AppleColorEmoji',
  };

  test('simple emoji mixed with text', function () {
    return runDocTest(docOptions, function (doc) {
      const font = 'tests/fonts/Roboto-Regular.ttf';
      doc.font(font);
      let y = 30;
      const gap = 6;

      // --- Basic emoji mixed with text ---
      doc.fontSize(18);
      doc.text('Hello 😀 World 🎉 Test 🚀', 50, y);
      y += 24 + gap;

      // --- Emoji-only line (no surrounding text) ---
      doc.text('😀🎉🚀🌈⭐🔥💯', 50, y);
      y += 24 + gap;

      // --- Text-only line (no emoji) ---
      doc.text('No emoji here, just plain text.', 50, y);
      y += 24 + gap;

      // --- ZWJ family sequences ---
      doc.fontSize(24);
      doc.text('Family: 👨‍👩‍👧‍👦 Couple: 👩‍❤️‍👨', 50, y);
      y += 30 + gap;

      // --- Skin tone modifiers ---
      doc.fontSize(18);
      doc.text('Thumbs: 👍 👍🏻 👍🏼 👍🏽 👍🏾 👍🏿', 50, y);
      y += 24 + gap;

      // --- Flag sequences (regional indicators) ---
      doc.text('Flags: 🇺🇸 🇬🇧 🇯🇵 🇫🇷 🇩🇪 🇧🇷', 50, y);
      y += 24 + gap;

      // --- Keycap sequences ---
      doc.text('Keycaps: 1️⃣ 2️⃣ 3️⃣ #️⃣ *️⃣', 50, y);
      y += 24 + gap;

      // --- Emoji at start and end of line ---
      doc.text('🔥 Fire at start', 50, y);
      y += 24 + gap;
      doc.text('Fire at end 🔥', 50, y);
      y += 24 + gap;

      // --- Multiple emoji adjacent with no spaces ---
      doc.text('No spaces:🍎🍊🍋🍇🍉🍓', 50, y);
      y += 24 + gap;

      // --- Different font sizes ---
      doc.fontSize(10);
      doc.text('Small 10pt: Hello 🌍 World', 50, y);
      y += 16 + gap;

      doc.fontSize(36);
      doc.text('Large 36pt: 🎨🖌️', 50, y);
      y += 42 + gap;

      // --- Emoji with variation selector (text vs emoji presentation) ---
      doc.fontSize(18);
      doc.text('Heart: ❤️ vs ❤︎ Star: ⭐ vs ✩', 50, y);
      y += 24 + gap;

      // --- Mixed scripts with emoji ---
      doc.text('日本語テスト 🗾 中文测试 🐉', 50, y);
      y += 24 + gap;

      // --- Emoji in the middle of a long sentence ---
      doc.fontSize(14);
      doc.text(
        'The quick brown 🦊 jumps over the lazy 🐶 and runs through the 🌲🌲🌲 forest.',
        50,
        y,
        { width: 450 },
      );
      y += 40 + gap;

      // --- Multiple lines of emoji text ---
      doc.fontSize(16);
      doc.text('Line 1: Good morning ☀️', 50, y);
      y += 22 + gap;
      doc.text('Line 2: Good night 🌙', 50, y);
      y += 22 + gap;
      doc.text('Line 3: Weather 🌧️⛈️🌤️', 50, y);
      y += 22 + gap;

      // --- Animals and nature ---
      doc.fontSize(20);
      doc.text('🐱🐶🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮', 50, y);
      y += 26 + gap;

      // --- Food emoji ---
      doc.text('🍕🍔🌮🍣🍜🍩🍪🎂🍰🧁', 50, y);
      y += 26 + gap;

      // --- Sports and activities ---
      doc.text('⚽🏀🏈⚾🎾🏐🏉🎱🏓🏸', 50, y);
      y += 26 + gap;

      // --- Profession ZWJ sequences ---
      doc.fontSize(24);
      doc.text('👨‍🚀 👩‍🔬 👨‍🍳 👩‍🎤', 50, y);
    });
  });
});

const TWEMOJI_FONT = 'tests/fonts/Twemoji.Mozilla.ttf';
const twemojiAvailable = fs.existsSync(TWEMOJI_FONT);
const twemojiDescribe = twemojiAvailable ? describe : describe.skip;

twemojiDescribe('emoji COLR (Twemoji)', function () {
  const docOptions = {
    compress: false,
    emojiFont: TWEMOJI_FONT,
  };

  test('simple emoji mixed with text', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('Hello 😀 World 🎉 Test 🚀', 50, 50);
    });
  });

  test('multiple emoji in a row', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('🍎🍊🍋🍇🍉🍓🍑🥝', 50, 50);
    });
  });

  test('emoji with heart variation selector', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('I ❤️ PDFKit', 50, 50);
    });
  });

  test('different font sizes', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(12).text('Small 🌟 emoji (12pt)', 50, 50);
      doc.fontSize(24).text('Medium 🌟 emoji (24pt)', 50, 80);
      doc.fontSize(48).text('Large 🌟 emoji (48pt)', 50, 120);
    });
  });

  test('emoji-only line', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(24);
      doc.text('🌈✨🎵🔥💎⚡🌙☀️', 50, 50);
    });
  });

  test('skin tone modifiers', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('👋🏻 👋🏼 👋🏽 👋🏾 👋🏿', 50, 50);
    });
  });

  test('keycap emoji', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣', 50, 50);
    });
  });

  test('plain text without emoji is unchanged', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('This line has no emoji and should render normally.', 50, 50);
    });
  });
});
