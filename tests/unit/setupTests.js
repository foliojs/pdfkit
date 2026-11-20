import toContainChunk from './toContainChunk';
import toContainText from './toContainText';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { registerStdFonts } from '../../lib/font/standard_fonts';
import Courier from '../../lib/font/generated/Courier';
import CourierBold from '../../lib/font/generated/CourierBold';
import CourierBoldOblique from '../../lib/font/generated/CourierBoldOblique';
import CourierOblique from '../../lib/font/generated/CourierOblique';
import Helvetica from '../../lib/font/generated/Helvetica';
import HelveticaBold from '../../lib/font/generated/HelveticaBold';
import HelveticaBoldOblique from '../../lib/font/generated/HelveticaBoldOblique';
import HelveticaOblique from '../../lib/font/generated/HelveticaOblique';
import Symbol from '../../lib/font/generated/Symbol';
import TimesBold from '../../lib/font/generated/TimesBold';
import TimesBoldItalic from '../../lib/font/generated/TimesBoldItalic';
import TimesItalic from '../../lib/font/generated/TimesItalic';
import TimesRoman from '../../lib/font/generated/TimesRoman';
import ZapfDingbats from '../../lib/font/generated/ZapfDingbats';

registerStdFonts(
  Courier,
  CourierBold,
  CourierBoldOblique,
  CourierOblique,
  Helvetica,
  HelveticaBold,
  HelveticaBoldOblique,
  HelveticaOblique,
  Symbol,
  TimesBold,
  TimesBoldItalic,
  TimesItalic,
  TimesRoman,
  ZapfDingbats,
);

expect.extend(toContainChunk);
expect.extend(toContainText);
expect.extend({ toMatchImageSnapshot });
