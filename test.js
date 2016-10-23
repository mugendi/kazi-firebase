//jshint -W104
const kazi = require('./index')();

process.ppid = 637;

// console.log(kazi)

var queue = 'kazi';

//jobs to schedule
var jobs = [
  {
    id: 1, //job has a defined ID. If this field is missing, one will be auto-generated
    delay : 30, //job will be delayed for 30 seconds... (this property is optional)
    data : {'id': 36535,'foo': 'bar'} //every job must have a data Property, which must be an object
  },
  {
    id: 'job-ID', //Job Ids can either be numerals or strings
    data : {'id': 36535,'foo': 'bar'}
  },
  {
    queue: 'special-jobs', //you can programatically determine the queue that you want a job to be placed in...
    data : {'id': 36535,'foo': 'bar'}
  }
];



//schedule tasks
kazi.schedule(jobs, queue,  function(){
  console.log('Scheduling Finished!');
});


//run tasks
kazi.run( queue, function(data, progress, resolve, reject) {

  console.log(JSON.stringify(data,0,4));

  // report current progress
  progress(100);

  // Finish the task asynchronously
  setTimeout(function() {
    resolve();
  }, 10000);

});
