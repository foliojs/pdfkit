import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.2/es/core.min.js';
import javascript from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.2/es/languages/javascript.min.js';

hljs.registerLanguage('javascript', javascript);

for (const codeBlock of document.querySelectorAll('pre code')) {
  if (!codeBlock.className) {
    codeBlock.classList.add('language-javascript');
  }
  hljs.highlightElement(codeBlock);
}

const sections = Array.from(document.querySelectorAll('h2[id]'));
const navigationLinks = Array.from(
  document.querySelectorAll('nav.sidebar a[href^="#"]'),
);

const selectSection = (section) => {
  const hash = section ? `#${section.id}` : null;
  for (const link of navigationLinks) {
    link.classList.toggle('selected', link.getAttribute('href') === hash);
  }
};

const selectHashTarget = () => {
  let id;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  selectSection(sections.find((section) => section.id === id));
};

const selectScrolledSection = () => {
  const viewportAnchor = window.innerHeight / 3;
  let currentSection = null;

  for (const section of sections) {
    if (section.getBoundingClientRect().top > viewportAnchor) {
      break;
    }
    currentSection = section;
  }

  selectSection(currentSection);
};

let scrolling = false;
window.addEventListener(
  'scroll',
  () => {
    if (scrolling) {
      return;
    }
    scrolling = true;
    requestAnimationFrame(() => {
      scrolling = false;
      selectScrolledSection();
    });
  },
  { passive: true },
);
window.addEventListener('hashchange', selectHashTarget);

if (location.hash) {
  selectHashTarget();
} else {
  selectScrolledSection();
}
