import { runDocTest } from './helpers';

const characters = `Latin
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz

Latin 1 (Western)
ÁÀÂÄÅÃÆÇÐÉÈÊËÍÌÎÏÑÓÒÔÖÕØŒÞÚÙÛÜÝŸ
áàâäãåæçðéèêëíìîïıñóòôöõøœßþúùûüýÿ

Latin 2 (Eastern)
ĀĂĄĆČĎĐĒĖĘĚĞĢĪĮİĶŁĹĻĽŃŅŇŌŐŔŖŘŠŚŞȘŢȚŤŪŮŰŲŽŹŻ
āăąćčďđēėęěğģīįķłĺļľńņňōőŕŗřšśşșţțťūůűųžźż

Greek (Modern)
ΑΒΓ∆ΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΆΈΉΊΌΎΏΪΫ
αβγδεζηθικλµνξοπρςστυφχψωάέήίόύώϊϋΐΰ

Cyrillic 1 (Russian)
АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ
абвгдежзийклмнопрстуфхцчшщъыьэюя

Cyrillic 2 (Extended)
ЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏҐӁҒҖҚҢҮҰҲҶҺӘӢӨӮ
ѐёђѓєѕіїјљњћќѝўџґӂғҗқңүұҳҷһәӣөӯ`;

describe('fonts', function () {
  test.skip('default (Helvetica)', function () {
    return runDocTest({ systemFonts: true }, function (doc) {
      doc.text(characters, 10, 10);
    });
  });

  test.skip('Helvetica Bold', function () {
    return runDocTest({ systemFonts: true }, function (doc) {
      doc.font('Helvetica-Bold');
      doc.text(characters, 10, 10);
    });
  });

  test('Roboto', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text(characters, 10, 10);
    });
  });

  test('Roboto Bold', function () {
    return runDocTest(function (doc) {
      doc.font('tests/fonts/Roboto-Medium.ttf');
      doc.text(characters, 10, 10);
    });
  });
});
