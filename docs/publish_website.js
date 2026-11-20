const ghpages = require('gh-pages');

const { argv } = process;

const message = argv.length > 2 ? argv[2] : 'Update gh-pages branch';

ghpages.publish(
  '.',
  {
    src: [
      'index.html',
      'docs/*.html',
      'docs/css/*.css',
      'docs/img/*.png',
      'docs/js/*.js',
      'docs/guide.pdf',
      'examples/playground/dist/**/*',
      'examples/kitchen-sink.pdf',
    ],
    repo: 'https://github.com/foliojs/pdfkit.git',
    add: true,
    message,
  },
  function (err) {
    if (err) {
      console.error(err);
      process.exitCode = 1;
      return;
    }

    console.log('Website published to the gh-pages branch.');
  },
);
