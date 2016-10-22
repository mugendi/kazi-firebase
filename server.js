//jshint -W104
const redis = require("redis");
const md5 = require('md5');


var kazi_server = function(options){
  var self = this;

  var defaults = {
    redisPort : 6379,
    redisIP :  '127.0.0.1',
    redisDB :  0,
    redisHKey :  '__KAZI:DELAYED:JOBS__'
  };

  //extend...
  options = self.options = Object.assign(defaults, options);

  self.client = redis.createClient(options.redisPort, options.redisIP );
  self.client.select(options.redisDB);

  self.subscriber = redis.createClient( options.redisPort, options.redisIP );
  self.subscriber.select(options.redisDB);

  //Keyspace Events
  self.subscriber.on('pmessage', function(pattern, channel, key) {
      // console.log( pattern, channel, key);

      self.client.hget(options.redisHKey, key, function(err,res){
        try {

          //parse job
          var job = JSON.parse(res);
          //delete Hash Key...
          self.client.hdel(self.options.redisHKey, key );

          var queue = job.queue;
          delete job.queue;

          //call firebase scheduler...
          // console.log(options.kazi.schedule, job);
          options.kazi.schedule([job], queue);

        } catch (e) {

        }

      });

  }).psubscribe( "__keyevent@" + options.redisDB + "__:expired");


}

//delay Job
kazi_server.prototype.delayJob = function delayJob(job, queue, cb){
  var self = this;

  //remove delay...
  var delay = job.delay;
  delete job.delay;
  //add queue
  job.queue = queue;

  var jobStr = JSON.stringify(job);
  var key = job.id || md5(jobStr);
  var multi = self.client.multi();

  multi.set( key, 1 )
      .hset(self.options.redisHKey, key, jobStr)
      .expire(key, delay )
      .exec(cb);

};

module.exports = function(options){
  return new kazi_server(options);
};
