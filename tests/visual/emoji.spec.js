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
});
