const PDFDocument = require('../');
const fs = require('fs');
const path = require('path');

const invoice = {
  number: 'RE-2024-0001',
  date: '01.01.2024',
  orderRef: 'ORD-0001',
  currency: 'EUR',
  note: 'Test invoice',
  paymentTerms: 'Payable within 14 days without deduction',

  seller: {
    name: 'Acme Media GmbH',
    street: 'Test Street 1',
    zip: '10115',
    city: 'Berlin',
    country: 'DE',
    vat: 'DE111111111',
    contact: 'Anna Seller',
    phone: '030/11111111',
    email: 'anna@seller.example',
    iban: 'DE89 3704 0044 0532 0130 00',
  },

  buyer: {
    name: 'Test Buyer GmbH',
    street: 'Sample Avenue 2',
    zip: '20095',
    city: 'Hamburg',
    country: 'DE',
    vat: 'DE222222222',
  },

  lines: [
    { id: 1, description: 'Test Product A', qty: 1, unit: 'pcs', unitPrice: 100.00, vatRate: 19, total: 100.00 },
  ],

  allowances: [
    { label: 'Discount 30%', amount: -30.00, vatRate: 19 },
    { label: 'Agency commission 15%', amount: -15.00, vatRate: 19 },
  ],

  charges: [
    { label: 'Colour surcharge 60%', amount: 60.00, vatRate: 19 },
  ],

  summary: {
    lineTotal: 100.00,
    chargeTotal: 60.00,
    allowanceTotal: 45.00,
    taxBasis: 115.00,
    vat: 21.85,
    grandTotal: 136.85,
    dueAmount: 136.85,
  },
};

const LEFT = 50;
const RIGHT = 545;
const WIDTH = RIGHT - LEFT;

// helper functions
const fmt = (n) => n.toFixed(2).replace('.', ',') + ' €';

function rule(doc, y, weight = 0.5) {
  doc.save()
    .moveTo(LEFT, y).lineTo(RIGHT, y)
    .lineWidth(weight).strokeColor('#CCCCCC').stroke()
    .restore();
}

function tableRow(doc, y, cols, opts = {}) {
  const { bold = false, bg = null, textColor = '#222222' } = opts;
  if (bg) {
    doc.save().rect(LEFT, y - 4, WIDTH, 18).fill(bg).restore();
  }
  doc.fillColor(textColor).font(bold ? 'Palatino-Bold' : 'DejaVuSans').fontSize(9);
  cols.forEach(([text, x, align = 'left', w = 80]) => {
    doc.text(text, x, y, { width: w, align });
  });
}

// initialise document
const doc = new PDFDocument({
  subset: 'PDF/A-3b',
  pdfVersion: '1.7',
  size: 'A4',
  margins: { top: 50, bottom: 50, left: LEFT, right: 50 },
  info: {
    Title: `Invoice ${invoice.number}`,
    Author: invoice.seller.name,
    Subject: 'Factur-X e-invoice',
    Keywords: 'invoice facturx en16931',
  },
});

doc.pipe(fs.createWriteStream(path.join(__dirname, 'facturx.pdf')));

doc.registerFont('Palatino-Bold', 'fonts/PalatinoBold.ttf');
doc.registerFont('DejaVuSans', 'fonts/DejaVuSans.ttf');

// embed and declare e-invoice
doc.einvoice('facturx', path.join(__dirname, 'einvoices', 'en16931.xml'));

// invoice header
doc.rect(LEFT, 40, WIDTH, 46).fill('#1A3A5C');
doc.fillColor('#FFFFFF').font('Palatino-Bold').fontSize(18)
  .text('INVOICE', LEFT + 10, 50, { width: 200 });
doc.fillColor('#A8C4E0').font('DejaVuSans').fontSize(9)
  .text(`No. ${invoice.number}`, LEFT + 10, 67, { width: 200 });
doc.fillColor('#FFFFFF').font('DejaVuSans').fontSize(9)
  .text(`Date: ${invoice.date}`, RIGHT - 150, 55, { width: 140, align: 'right' })
  .text(`Order ref: ${invoice.orderRef}`, RIGHT - 150, 67, { width: 140, align: 'right' });

// invoice addresses
let y = 100;

doc.fillColor('#1A3A5C').font('Palatino-Bold').fontSize(9).text('FROM', LEFT, y);
doc.fillColor('#222222').font('Palatino-Bold').fontSize(10).text(invoice.seller.name, LEFT, y + 13);
doc.font('DejaVuSans').fontSize(9)
  .text(invoice.seller.street, LEFT, y + 25)
  .text(`${invoice.seller.zip} ${invoice.seller.city}, ${invoice.seller.country}`, LEFT, y + 36)
  .text(`VAT: ${invoice.seller.vat}`, LEFT, y + 47)
  .text(`Contact: ${invoice.seller.contact}`, LEFT, y + 58)
  .text(`Phone: ${invoice.seller.phone}`, LEFT, y + 69)
  .text(`Email: ${invoice.seller.email}`, LEFT, y + 80);

const COL2 = LEFT + 270;
doc.fillColor('#1A3A5C').font('Palatino-Bold').fontSize(9).text('BILL TO', COL2, y);
doc.fillColor('#222222').font('Palatino-Bold').fontSize(10).text(invoice.buyer.name, COL2, y + 13);
doc.font('DejaVuSans').fontSize(9)
  .text(invoice.buyer.street, COL2, y + 25)
  .text(`${invoice.buyer.zip} ${invoice.buyer.city}, ${invoice.buyer.country}`, COL2, y + 36)
  .text(`VAT: ${invoice.buyer.vat}`, COL2, y + 47);

// invoice body (line items)
y = 215;
rule(doc, y - 5, 1);

tableRow(doc, y, [
  ['#', LEFT, 'left', 20],
  ['Description', LEFT + 25, 'left', 185],
  ['Qty', LEFT + 215, 'right', 40],
  ['Unit', LEFT + 260, 'center', 30],
  ['Unit price', LEFT + 295, 'right', 70],
  ['VAT %', LEFT + 370, 'right', 40],
  ['Total', LEFT + 415, 'right', 80],
], { bold: true, textColor: '#1A3A5C' });

y += 18;
rule(doc, y - 3);

invoice.lines.forEach((line, i) => {
  const bg = i % 2 === 0 ? '#F5F8FB' : null;
  tableRow(doc, y, [
    [String(line.id), LEFT, 'left', 20],
    [line.description, LEFT + 25, 'left', 185],
    [String(line.qty), LEFT + 215, 'right', 40],
    [line.unit, LEFT + 260, 'center', 30],
    [fmt(line.unitPrice), LEFT + 295, 'right', 70],
    [`${line.vatRate}%`, LEFT + 370, 'right', 40],
    [fmt(line.total), LEFT + 415, 'right', 80],
  ], { bg });
  y += 18;
});

rule(doc, y - 2);

// allowances, charges, adjustments etc.
y += 6;
doc.fillColor('#1A3A5C').font('Palatino-Bold').fontSize(9).text('ADJUSTMENTS', LEFT, y);
y += 14;

const adjustments = [
  ...invoice.charges.map(c => ({ label: c.label, amount: c.amount, vatRate: c.vatRate, sign: '+', color: '#B45309' })),
  ...invoice.allowances.map(a => ({ label: a.label, amount: Math.abs(a.amount), vatRate: a.vatRate, sign: '-', color: '#065F46' })),
];

adjustments.forEach((adj, i) => {
  const bg = i % 2 === 0 ? '#F5F8FB' : null;
  tableRow(doc, y, [
    [adj.label, LEFT + 25, 'left', 340],
    [`${adj.vatRate}%`, LEFT + 370, 'right', 40],
    [`${adj.sign} ${fmt(adj.amount)}`, LEFT + 415, 'right', 80],
  ], { bg, textColor: adj.color });
  y += 18;
});

// totals
y += 4;
rule(doc, y, 1);
y += 10;

const TLABEL = LEFT + 310;
const TVALUE = LEFT + 415;
const TWIDTH = RIGHT - TVALUE;

const totalsRows = [
  ['Subtotal (lines)', fmt(invoice.summary.lineTotal)],
  ['Charges', '+' + fmt(invoice.summary.chargeTotal)],
  ['Allowances', '-' + fmt(invoice.summary.allowanceTotal)],
  ['Tax basis', fmt(invoice.summary.taxBasis)],
  ['VAT (19%)', fmt(invoice.summary.vat)],
];

totalsRows.forEach(([label, value]) => {
  doc.fillColor('#444444').font('DejaVuSans').fontSize(9)
    .text(label, TLABEL, y, { width: 100, align: 'left' })
    .text(value, TVALUE, y, { width: TWIDTH, align: 'right' });
  y += 14;
});

y += 2;
doc.rect(TLABEL - 8, y - 4, RIGHT - TLABEL + 8, 22).fill('#1A3A5C');
doc.fillColor('#FFFFFF').font('Palatino-Bold').fontSize(11)
  .text('TOTAL DUE', TLABEL - 4, y + 2, { width: 100, align: 'left' })
  .text(fmt(invoice.summary.dueAmount), TVALUE, y + 2, { width: TWIDTH, align: 'right' });
y += 28;

// payment details
y += 6;
rule(doc, y, 1);
y += 10;

doc.fillColor('#1A3A5C').font('Palatino-Bold').fontSize(9).text('PAYMENT DETAILS', LEFT, y);
y += 14;
doc.fillColor('#222222').font('DejaVuSans').fontSize(9)
  .text(`Bank transfer (SEPA) - IBAN: ${invoice.seller.iban}`, LEFT, y)
  .text(`Account holder: ${invoice.seller.name}`, LEFT, y + 12)
  .text(`Terms: ${invoice.paymentTerms}`, LEFT, y + 24);

// footer
const PAGE_BOTTOM = doc.page.height - doc.page.margins.bottom;
doc.rect(LEFT, PAGE_BOTTOM - 36, WIDTH, 1).fill('#1A3A5C');
doc.fillColor('#888888').font('DejaVuSans').fontSize(7.5)
  .text(
    `${invoice.seller.name}  -  ${invoice.seller.street}, ${invoice.seller.zip} ${invoice.seller.city}  -  VAT ${invoice.seller.vat}  -  ${invoice.seller.email}`,
    LEFT, PAGE_BOTTOM - 32, { width: WIDTH, align: 'center' }
  );

// compliance note
doc.fillColor('#AAAAAA').fontSize(6.5)
  .text('Factur-X - EN 16931 - PDF/A-3b', LEFT, PAGE_BOTTOM - 12, { width: WIDTH, align: 'right' });

doc.end();