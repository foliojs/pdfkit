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
      'demo/out.pdf'
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
