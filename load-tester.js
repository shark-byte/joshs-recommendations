const http = require('http');
const cluster = require('cluster');
const numCPUs = 5; //require('os').cpus().length;

const startTime = new Date().getTime();

function randomInteger(min, max){
  return Math.round((max - min)*Math.random() + min);
}

if (cluster.isMaster){
  console.log(`Master ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} finished`);
  });
} else {
  const load = (100000 / numCPUs);
  sendRequests(load);
  console.log(`Worker ${process.pid} started`);
}

function httpRequest(path){
  const promise = new Promise((resolve, reject) => {
    http.get(path, (res) => {
      resolve(res.statusCode);
    }); 
  });

  return promise;
}

async function sendRequests(load){
  var counter = 0;

  async function sendRequest(){
    const path = `http://localhost:3004/api/restaurants/${randomInteger(0, 10000000)}/recommendations`;

    const res = await httpRequest(path);

    if (counter < load){
      counter++;
      return sendRequest();
    } else {
      return Promise.resolve(true);
    }
  }

  await sendRequest();
  const endTime = new Date().getTime();
  console.log('Sent ', load, ' requests in ', ((endTime - startTime) / 1000), 's :3');
  process.exit();
}