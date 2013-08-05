var sim = require('../');
var should = require('should');
require('mocha');

var ping = require('./ping');
var origms = null;
var latencyTest = 25;

describe('net-sim', function() {
  beforeEach(sim.clear);
  afterEach(sim.clear);

  it('should start with low ping', function(done) {
    ping('127.0.0.1', function(err, ms){
      should.not.exist(err);
      should.exist(ms);
      (ms < 10).should.equal(true);
      origms = ms;
      done();
    });
  });

  describe('setLatency()', function() {
    it('should add latency', function(done) {
      sim.setLatency('127.0.0.1', latencyTest, function(err){
        should.not.exist(err);

        var expected = origms+(latencyTest*2);

        ping('127.0.0.1', function(err, ms){
          should.not.exist(err);
          var diff = ms-expected;
          (diff < 10).should.equal(true);
          done();
        });
      });
    });
  });
});
