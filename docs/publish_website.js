const ghpages = require('gh-pages');

ghpages.publish(
  '.',
  {
    src: ['index.html', 'docs/*.html', 'docs/guide.pdf', 'demo/out.pdf'],
    add: true
  },
  function(err) {
    if (err) {
      console.error(err);
    }
  }
);
