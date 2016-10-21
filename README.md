# Kazi (Swahili for work) - Firebase
After several attempts to write a scalable job queue, I came across the awesome firebase package [firebase-queue](https://github.com/firebase/firebase-queue)

I therefore wrote this wrapper package that should enable you schedule and run jobs in a breeze!

```javascript

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
  console.log('ss;lj sn');
});

//run tasks
kazi.run( queue, function(data, progress, resolve, reject) {

  //Execute Job
  //... ... ...

  // report current progress
  progress(100);

  // Finish the task asynchronously
  setTimeout(function() {
    resolve();
  }, 10000);

  //Alternatively we could reject job with errors
  //reject(errorMessage);
  
});

```

That is All!

Read the *firebase-queue* documentation to learn how to throw errors and other functions...
