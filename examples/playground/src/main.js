import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { PDFDocument, registerStdFonts } from 'pdfkit';
import { toBlob } from 'pdfkit/output';
import Courier from 'pdfkit/standard-fonts/Courier';
import CourierBold from 'pdfkit/standard-fonts/CourierBold';
import CourierBoldOblique from 'pdfkit/standard-fonts/CourierBoldOblique';
import CourierOblique from 'pdfkit/standard-fonts/CourierOblique';
import Helvetica from 'pdfkit/standard-fonts/Helvetica';
import HelveticaBold from 'pdfkit/standard-fonts/HelveticaBold';
import HelveticaBoldOblique from 'pdfkit/standard-fonts/HelveticaBoldOblique';
import HelveticaOblique from 'pdfkit/standard-fonts/HelveticaOblique';
import Symbol from 'pdfkit/standard-fonts/Symbol';
import TimesBold from 'pdfkit/standard-fonts/TimesBold';
import TimesBoldItalic from 'pdfkit/standard-fonts/TimesBoldItalic';
import TimesItalic from 'pdfkit/standard-fonts/TimesItalic';
import TimesRoman from 'pdfkit/standard-fonts/TimesRoman';
import ZapfDingbats from 'pdfkit/standard-fonts/ZapfDingbats';
import { example, lorem } from './example.js';

import './style.css';

const DEBOUNCE_DELAY = 300;
const STORAGE_KEY = 'editorText';
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const editorContainer = document.querySelector('#editor');
const preview = document.querySelector('#preview');
const errorPanel = document.querySelector('#error-panel');
const errorTitle = document.querySelector('#error-title');
const errorMessage = document.querySelector('#error-message');
const errorDetails = document.querySelector('#error-details');
const errorStack = document.querySelector('#error-stack');

let generation = 0;
let debounceTimer;
let previewUrl;

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

function clearError() {
  errorPanel.hidden = true;
  errorTitle.textContent = '';
  errorMessage.textContent = '';
  errorStack.textContent = '';
  errorDetails.open = false;
  errorDetails.hidden = true;
}

function displayError(error) {
  const name = error && typeof error.name === 'string' ? error.name : 'Error';
  const message =
    error && typeof error.message === 'string' ? error.message : String(error);
  const stack = error && typeof error.stack === 'string' ? error.stack : '';

  errorTitle.textContent = name;
  errorMessage.textContent = message;
  errorStack.textContent = stack;
  errorDetails.hidden = stack.length === 0;
  errorDetails.open = false;
  errorPanel.hidden = false;
}

function replacePreview(blob) {
  const nextUrl = URL.createObjectURL(blob);
  const previousUrl = previewUrl;

  preview.src = nextUrl;
  previewUrl = nextUrl;

  if (previousUrl) {
    URL.revokeObjectURL(previousUrl);
  }
}

async function generatePdf(source, requestedGeneration) {
  try {
    const execute = new AsyncFunction('PDFDocument', 'toBlob', 'lorem', source);
    const blob = await execute(PDFDocument, toBlob, lorem);

    if (!(blob instanceof Blob)) {
      throw new TypeError('The editor code must return a PDF Blob.');
    }

    if (requestedGeneration !== generation) {
      return;
    }

    replacePreview(blob);
    clearError();
  } catch (error) {
    if (requestedGeneration === generation) {
      displayError(error);
    }
  }
}

function requestGeneration(source, delay = DEBOUNCE_DELAY) {
  const requestedGeneration = ++generation;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = undefined;
    generatePdf(source, requestedGeneration);
  }, delay);
}

const initialSource = localStorage.getItem(STORAGE_KEY) ?? example;

const editor = new EditorView({
  parent: editorContainer,
  doc: initialSource,
  extensions: [
    basicSetup,
    javascript(),
    oneDark,
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) {
        return;
      }

      const source = update.state.doc.toString();
      localStorage.setItem(STORAGE_KEY, source);
      requestGeneration(source);
    }),
    EditorView.theme({
      '&': {
        height: '100%',
      },
      '.cm-scroller': {
        overflow: 'auto',
      },
    }),
  ],
});

editorContainer.setAttribute('aria-describedby', 'error-panel');
requestGeneration(editor.state.doc.toString(), 0);

window.addEventListener('beforeunload', () => {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
});
