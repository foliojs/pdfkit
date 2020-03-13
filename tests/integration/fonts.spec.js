var { runDocTest } = require('./helpers');

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

describe('fonts', function() {
  test('default (Helvetica)', function() {
    return runDocTest(function(doc) {
      doc.text(characters, 10, 10);
    });
  });

  test('Helvetica Bold', function() {
    return runDocTest(function(doc) {
      doc.font('Helvetica-Bold');
      doc.text(characters, 10, 10);
    });
  });

  test('Roboto', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Regular.ttf');
      doc.text(characters, 10, 10);
    });
  });

  test('Roboto Bold', function() {
    return runDocTest(function(doc) {
      doc.font('tests/fonts/Roboto-Medium.ttf');
      doc.text(characters, 10, 10);
    });
  });
});
