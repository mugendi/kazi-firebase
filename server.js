//jshint -W104
const redis = require("redis");
const Queue = require('firebase-queue');
const firebase = require('firebase');
const path = require('path');

const config_path = process.argv[2] || path.join(__dirname,'config');

var redisDefaultoptions = require(path.join(config_path,'redis.json'));
var firebaseConfig = path.join(config_path,'firebase.json');

const client = redis.createClient(redisDefaultoptions.redisPort, redisDefaultoptions.redisIP );
client.select(redisDefaultoptions.redisDB);

const subscriber = redis.createClient( redisDefaultoptions.redisPort, redisDefaultoptions.redisIP );
subscriber.select(redisDefaultoptions.redisDB);


//Kazi Server to manage delayed jobs
(function listen(){

  var config = require(firebaseConfig);

  //initialize firebase
  firebase.initializeApp({
    serviceAccount: firebaseConfig, //JSON File
    databaseURL: 'https://' + config.project_id + '.firebaseio.com' //Database URL
  });


  //Keyspace Events
  subscriber.on('pmessage', function(pattern, channel, key) {
      // console.log( pattern, channel, key);
      console.log("Scheduling delayed job: " + key);

      client.hget(redisDefaultoptions.redisHKey, key, function(err,res){
        try {

          //parse job
          var job = JSON.parse(res);
          //
          //delete Hash Key...
          client.hdel(redisDefaultoptions.redisHKey, key );

          //set queue
          var queue = job.queue;
          delete job.queue;
          //set ref
          var ref = firebase.database().ref( queue + '/tasks' );

          //add job metadata
          job.meta = {
              queue : queue,
              updated : new Date().getTime()
            };

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

  }).psubscribe( "__keyevent@" + redisDefaultoptions.redisDB + "__:expired");

  console.log("Server Listening...");

}());
