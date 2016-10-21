//jshint -W104
const wira = require('./index')('./config/auth.json');


var queue = 'bull';

var jobs = [
  { id: 1, data : {'id': 36535,'foo': 'bar'}},
  { id: 2, data : {'id': 36535,'foo': 'bar'}},
  { id: 3, data : {'id': 36535,'foo': 'bar'}}
];

//******************

//schedule tasks
wira.schedule(jobs, queue,  function(){
  console.log('ss;lj sn');
});

//run tasks
wira.run( queue, function(data, progress, resolve, reject) {

  console.log(JSON.stringify(data,0,4));

  // report current progress
  progress(100);

  // Finish the task asynchronously
  setTimeout(function() {
    resolve();
  }, 10000);

});
