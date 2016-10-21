//jshint -W104
const kazi = require('./index')('./config/auth.json');

var queue = 'kazi';

//jobs to schedule
var jobs = [
  { id: 1, data : {'id': 36535,'foo': 'bar'}},
  { id: 2, data : {'id': 36535,'foo': 'bar'}},
  { id: 3, data : {'id': 36535,'foo': 'bar'}}
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
