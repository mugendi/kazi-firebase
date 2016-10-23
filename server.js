//jshint -W104
const redis = require("redis");
const md5 = require('md5');
const Queue = require('firebase-queue');
const firebase = require('firebase');

var redisDefaultoptions = require('./config/redis.json');
var firebaseConfig = './config/firebase.json';

const client = redis.createClient(redisDefaultoptions.redisPort, redisDefaultoptions.redisIP );
client.select(redisDefaultoptions.redisDB);

const subscriber = redis.createClient( redisDefaultoptions.redisPort, redisDefaultoptions.redisIP );
subscriber.select(redisDefaultoptions.redisDB);


//Kazi Server to manage delayed jobs
(function listen(){
  var self = this;

  self.client = client;

  //extend...
  var options = self.options = Object.assign(redisDefaultoptions, options);

  var config = require(firebaseConfig);

  //initialize firebase
  firebase.initializeApp({
    serviceAccount: firebaseConfig, //JSON File
    databaseURL: 'https://' + config.project_id+'.firebaseio.com' //Database URL
  });


  //Keyspace Events
  subscriber.on('pmessage', function(pattern, channel, key) {
      // console.log( pattern, channel, key);
      console.log("Scheduling delayed job: " + key);

      client.hget(options.redisHKey, key, function(err,res){
        try {

          //parse job
          var job = JSON.parse(res);
          //delete Hash Key...
          client.hdel(self.options.redisHKey, key );

          var queue = job.queue;
          delete job.queue;

          //set ref
          var ref = firebase.database().ref( queue + '/tasks' );

          //create job with or without given ID
          if(job.hasOwnProperty('id')){

            var r = ref.child(job.id);
            delete job.id;
            r.set( job, function(){ });

          }
          else{

            ref.push( job, function(){ });

          }

        } catch (e) {

        }

      });

  }).psubscribe( "__keyevent@" + options.redisDB + "__:expired");

  console.log("Server Listening...");

}());
