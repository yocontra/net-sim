var ipfw = require('./lib/ipfw');
var which = require('which');

if (which.sync('ipfw')){
  module.exports = ipfw;
} else {
  throw new Error("No available firewall tools for net-sim");
}