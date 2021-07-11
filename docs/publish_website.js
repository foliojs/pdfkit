const ghpages = require('gh-pages');

const { argv } = process;

const message = argv.length > 2 ? argv[2] : undefined;

ghpages.publish(
  '.',
  {
    src: [
      'index.html',
      'docs/*.html',
      'docs/img/*.png',
      'docs/guide.pdf',
      'examples/browserify/browser.html',
      'examples/browserify/bundle.js',
      'examples/kitchen-sink.pdf'
    ],
    add: true,
    message
  },
  function(err) {
    if (err) {
      console.error(err);
    }
  }
);
