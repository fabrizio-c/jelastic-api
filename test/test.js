var urun = require('urun');

let options={};
options.reporter = 'BashTapReporter';
options.verbose  = process.env.VERBOSE
  ? Boolean(JSON.parse(process.env.VERBOSE))
  : true;

urun(__dirname, options);