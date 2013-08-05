var child_process = require('child_process');
var async = require('async');

var ipfw = {};

ipfw.pipes = ['9001', '9002'];

ipfw.clear = function(cb) {
  child_process.exec('ipfw list', function(err, stdout, stderr){
    if (err) return cb(err);
    if (stderr) return cb(stderr);
    var rules = stdout.trim().split('\n');
    if (rules.length === 0) return cb(); // no rules?
    var ourRules = rules.filter(function(rule){
      var matched = ~rule.indexOf('pipe '+ipfw.pipes[0]) || ~rule.indexOf('pipe '+ipfw.pipes[1]);
      return matched;
    }).map(function(rule) {
      return rule.split(' ')[0];
    });
    if (ourRules.length === 0) return cb(); // we aint got shit
    async.forEach(ourRules, ipfw.remove, cb);
  });
};

ipfw.addLatency = function(ip, ms, cb) {
  ms = ms/2/2; // weird ipfw behavior - delay is doubled

  // create our rules
  var inbound = 'ip from any to '+ip;
  var outbound = 'ip from '+ip+' to any';
  var pipeRules = [inbound, outbound];

  var setupPipe = function(pipeNum, done) {
    var rule = 'delay '+ms+'ms bw 1Mbit/s';
    ipfw.setupPipe(pipeNum, rule, done);
  };

  // create the pipes
  var fns = [
    ipfw.addPipe.bind(null, ipfw.pipes[0], inbound),
    ipfw.addPipe.bind(null, ipfw.pipes[1], outbound)
  ];
  async.parallel(fns, function(err) {
    if (err) return cb(err);

    // config the pipes
    async.forEach(ipfw.pipes, setupPipe, cb);
  });
};

ipfw.addPipe = function(pipe, rule, cb) {
  var add = 'ipfw add pipe '+pipe+' '+rule;
  child_process.exec(add, function(err, stdout, stderr){
    if (err) return cb(err);
    if (stderr) return cb(stderr);
    cb(null, stdout);
  });
};

ipfw.setupPipe = function(pipe, rule, cb) {
  var setup = 'ipfw pipe '+pipe+' config '+rule;
  child_process.exec(setup, function(err, stdout, stderr){
    if (err) return cb(err);
    if (stderr) return cb(stderr);
    cb(null, stdout);
  });
};

ipfw.remove = function(num, cb) {
  var del = 'ipfw delete '+num;
  child_process.exec(del, function(err, stdout, stderr){
    if (err) return cb(err);
    if (stderr) return cb(stderr);
    cb(null, stdout);
  });
};

module.exports = ipfw;