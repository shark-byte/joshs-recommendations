const MongoClient = require('mongodb').MongoClient;
const _ = require('ramda');
const faker = require('faker');

// const cluster = require('cluster');
// const numCPUs = require('os').cpus().length; // 8

var startTime = new Date().getTime();
const cities = [
  // lat, long
  [40.7127837, -74.0059413],  // NYC
  [34.0522342, -118.2436849], // LA
  [41.8781136, -87.6297982],  // Chi
  [29.7604267, -95.3698028],  // Houston
  [39.9525839, -75.1652215],  // Philly
  [33.4483771, -112.0740373], // Phoenix
  [29.4241219, -98.49362819999999], // San Antonio
  [32.715738, -117.1610838], // San Diego
  [32.7766642, -96.79698789999999], // Dallas
  [37.3382082, -121.8863286] // San Jose
];  

// var obj = {
//   test1: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus molestias vel, nesciunt, esse, magni optio officiis minima necessitatibus magnam ratione eveniet. Reprehenderit, dolor labore. Omnis excepturi magni, explicabo ad iste?',
//   test2: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus ipsam mollitia sit animi quam, amet, incidunt magnam, ut asperiores, minima similique expedita quaerat tempore consequatur quo aperiam ducimus ipsum sequi?',
//   test3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem mollitia numquam cupiditate ex, obcaecati. Similique saepe beatae, harum vel repellendus, voluptatem vero neque illo, ut temporibus architecto tempora rem aut.'
// };

// if (cluster.isMaster){
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} finished`);
//   });
// } else {
//   seedDB();
//   console.log(`Worker ${process.pid} started`);
// }





function randomNumber(min, max){
  return (max - min)*Math.random() + min;
}

function randomInteger(min, max){
  return Math.round(randomNumber(min, max));
}

function randomRating(){
  return (Math.round(randomNumber(0, 5)*10) / 10);
}

function randomLocation(){
  // first pick an initial location center
  const city = cities[randomInteger(0, 9)];

  return { type: 'Point', coordinates: [city[0] + randomNumber(-0.1, 0.1), city[1] + randomNumber(-0.1, 0.1)] };
}

function generateDocument(id){
  return {
    name: faker.company.companyName(),
    place_id: id,
    google_rating: randomRating(),
    zagat_food_rating: randomRating(),
    review_count: randomInteger(0, 100),
    short_description: faker.lorem.paragraph(),
    neighbourhood: faker.random.words(2),
    address: `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.address.state()}`,
    website: faker.internet.url(),
    price_level: randomInteger(0, 5),
    types: _.range(0, 5).map(() => faker.random.word()),
    photos: _.range(0, 5).map(() => faker.random.image()),
    location: randomLocation()
  };
}

function seedDB(){
  MongoClient.connect('mongodb://localhost/').then((client) => {
    const db = client.db('recs');
    const collection = db.collection('testing');

    var count = 1000000;
    var pageCounter = 0;
    const batchSize = 10000; 

    async function insertBulk(){
      const ops = _.range(pageCounter*batchSize, (pageCounter + 1)*batchSize).map((id) => {
        return { insertOne: { "document": generateDocument(id) }};
      });

      await collection.bulkWrite(ops, { ordered: false, writeConcern: { w: 0 } }); 
      count -= batchSize;
      pageCounter += 1;
      if (count > 0){
        insertBulk();
      } else {
        const endTime = new Date().getTime();
        console.log('done in ', (endTime - startTime) / 1000, 's :3 ^_^ <3 <(^_^<)');
        client.close();
        process.exit();        
      }
    }

    insertBulk();
  });
}

seedDB();