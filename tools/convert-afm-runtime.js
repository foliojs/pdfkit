const { convertFiles } = require('./afm-converter');

try {
  convertFiles(process.argv.slice(2), 'runtime');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
