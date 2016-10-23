# Kazi (Swahili for work) - Firebase
After several attempts to write a scalable job queue, I came across the awesome firebase package [firebase-queue](https://github.com/firebase/firebase-queue)

I therefore wrote this wrapper package that should enable you schedule and run jobs in a breeze!


```javascript

const kazi = require('./index')('PATH-TO-YOUR-CONFIG-FILES');

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

## How Does this Wrapper benefit you?
As I stated, I have attempted to write job queues in the past and here are the things I tried to achieve.

- **Horizontal Scaling**: I needed a queue that allows me to scale my workers horizontally and with ease. Firebase, being an online and real-time database already achieves that for me.

- **Job Delaying** : My queues have been built to help in managing huge numbers of online trackers. Therefore, a lot of tasks are queued at specific times and even delayed. For example, there is no point in hitting a blog every 5 seconds. You can delay the next check to 3 hours later.

- **Worker/Scheduler Independence** : I wanted a system where workers are 100% independent of schedulers. There are many queues that support this.

- **Fault Tolerance** : firebase-queue thankfully is written to be fault tolerant.

- **Job Overwriting** : You could also call this *Task Updates*. Ideally, this is achieved by allowing the optional setting of a job's ID which is then used to update the same job if another is submitted with the same ID. In online tracking, tasks are continuous and almost never quite end. As such, updating a task/job with current status/data is a more feasible option.

- **Programatic Queue Selection** : Most job queues (including firebase-queue) require that you select a queue name before placing a job. But what if you can only determine that at runtime?

- **Bulk Scheduling** : Many times, tasks will come in bulk and there is need for a queue that will take in a huge array of jobs and just schedule them.

This wrapper introduces:
- **Job Delaying** - via redis keyspace notifications
- **Job Overwriting** - by allowing you to set IDs
- **Programatic Queue Selection** - you simply indicate your queue within your tasks
- **Bulk Scheduling** - simply supply an array of jobs/tasks!

This surely makes the awesome firebase-queue is even better! No?

## Remember to Fire Up Your Server
If you are planning to use delayed tasks, then remember to start your server (```server.js```). This feature is missing in *firebase-queue* and the best way I could think of implementing it is via redis ```EXPIRY``` command and using *keyspace notifications* to trigger the inserts. So, it goes without saying that you need a server/process of sorts running to subscribe to the redis notifications. Fire it up, probably use *PM2* to ensure it keeps running.

When staring the server, note that the first argument you supply will act as the configuration directory path. Example: ```node server.js "./PATH"```.

You can copy the server file and run it from wherever else you desire (so long as you have its dependencies installed).

## One Last thing...that Configuration
There is a *config* folder within *kazi-firebase* which you should ensure contains two files:
- ***firebase.json*** : The file that contains your firebase authentication details from firebase.
- ***redis.json*** : Redis Configuration file.

***Enjoy!***

***PS:*** *Read the [firebase-queue documentation](https://github.com/firebase/firebase-queue/blob/master/docs/guide.md) to get a basic idea of how this works...*
