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
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('Hello 😀 World 🎉 Test 🚀', 50, 50);
    });
  });

  test('multiple emoji in a row', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('🍎🍊🍋🍇🍉🍓🫐🍑', 50, 50);
    });
  });

  test('emoji with heart variation selector', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('I ❤️ PDFKit', 50, 50);
    });
  });

  test('ZWJ sequences', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('👨‍👩‍👧‍👦 👩‍💻 👨‍🍳', 50, 50);
    });
  });

  test('flag emoji', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('🇺🇸 🇬🇧 🇯🇵 🇫🇷 🇩🇪', 50, 50);
    });
  });

  test('skin tone modifiers', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('👋🏻 👋🏼 👋🏽 👋🏾 👋🏿', 50, 50);
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

  test('plain text without emoji is unchanged', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('This line has no emoji and should render normally.', 50, 50);
    });
  });

  test('keycap emoji', function () {
    return runDocTest(docOptions, function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.fontSize(18);
      doc.text('1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣', 50, 50);
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
