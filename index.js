const api=require('./lib/jelastic.api.js');
let jelastic=exports;
jelastic.vesion=require('./package.json').version;
jelastic.connection=api;