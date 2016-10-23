//jshint -W104
//
const arrify = require('arrify');
const Queue = require('firebase-queue');
const firebase = require('firebase');
const async = require('async');

const redis = require("redis");
const md5 = require('md5');


const redisDefaultoptions = require('./config/redis.json');
const client = redis.createClient(redisDefaultoptions.redisPort, redisDefaultoptions.redisIP );
client.select(redisDefaultoptions.redisDB);

var firebaseConfig = './config/firebase.json';
var kazi_server = {};

//initialize
var kazi = function (){

  var self = this;
  var config = {};

  //validate keys
  var propsRequired = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_id',
    'client_email',
    'auth_uri',
    'token_uri',
    'client_x509_cert_url'
  ];


  //config
  try {
    config = require(firebaseConfig);
    //check properties
    hasAllProperties(config, propsRequired );

    //check file
    if(typeof config !== 'object'){ throw new Error ( 'Configuration File missing or not valid JSON'); }
  } catch (e) {
    throw new Error ( 'Config File must be of JSON type');
  }

  //initialize app
  firebase.initializeApp({
    serviceAccount: firebaseConfig, //JSON File
    databaseURL: 'https://' + config.project_id + '.firebaseio.com' //Database URL
  });

  return self;

};


//SCHEDULE Jobs
kazi.prototype.schedule = function schedule(jobs, queue,  cb){

  //default queue
  queue = queue || 'queue' ;
  //only accept certain job formats...
  if(!jobs || typeof jobs !== 'object'){ throw new Error("Job must be an object!"); }


  //add all jobs...
  async.eachLimit(arrify(jobs), 1, function(job, next){

    if(!job.hasOwnProperty('data') || typeof job.data !== 'object'){
      throw new Error("Job must contain a 'data' key which must be an object!");
    }

    //change queue if set..
    queue = job.queue || queue;
    //delete queue
    delete job.queue;
    //Database Reference
    var ref = firebase.database().ref( queue + '/tasks' );

    //if job has a delay...
    if(job.hasOwnProperty('delay') && /^[0-9\.]+$/.test(job.delay)){
      //
      delayJob(job, queue, function(err,res){
        // console.log(job)
        next();
      });

    }
    else{

      //add job metadata
      job.meta = {
          queue : queue,
          updated : new Date().getTime()
        };

      // console.log(job);
      //create job with or without given ID
      if(job.hasOwnProperty('id') && (typeof job.id == 'number' || typeof job.id == 'string') ){

        var r = ref.child(job.id);
        delete job.id;
        r.set( job, function(){
          //next job...
          next();
        });

      }
      else{

        ref.push( job, function(){
          //next job...
          next();
        });

      }

    }

  }, cb );

};




//delay Job
function delayJob(job, queue, cb){
  var self = this;

  //remove delay...
  var delay = job.delay;
  delete job.delay;
  //add queue
  job.queue = queue;


  var jobStr = JSON.stringify(job);
  var key = job.id || md5(jobStr);
  var multi = client.multi();

  multi.set( key, 1 )
      .hset(redisDefaultoptions.redisHKey, key, jobStr)
      .expire(key, delay )
      .exec(cb);

}


//RUN Jobs...
kazi.prototype.run = function run(queue, cb, options){

  queue = queue || 'queue' ;

  var defaults =
  {
    'numWorkers': 1,
    'sanitize': false,
    'suppressStack': false,
    // "_state": "spec_n_start"
  };

  //extend options
  options = Object.assign( defaults, options );

  //create ref
  var ref = firebase.database().ref(queue);

  //queue...
  return new Queue(ref, options, cb );

};


//simple check multiple props in object
function hasAllProperties(obj, properties){


  properties.forEach(function(prop){

    if ( !obj.hasOwnProperty(prop) ){
      throw new Error ( 'Incorrectly formatted Firebase Configuration File: Requires ' + prop + ' Property.');
    }

  });

  return true;

}


//export
module.exports = function(configFile){
  return new kazi(configFile);
};
