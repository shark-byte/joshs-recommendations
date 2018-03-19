const { Pool } = require('pg');
const _ = require('ramda');
const faker = require('faker');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length; // 8

const pool = new Pool({
  database: 'test'
});

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

const startTime = new Date().getTime();

if (cluster.isMaster){
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ num: i });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} finished`);
  });
} else {
  seedDB();
  console.log(`Worker ${process.pid} started`);
}

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
  return [
    id,
    faker.company.companyName(),
    randomRating(),
    randomRating(),
    randomInteger(0, 100),
    faker.lorem.paragraph(),
    faker.random.words(2),
    `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.address.state()}`,
    faker.internet.url(),
    randomInteger(0, 5),
    // types: _.range(0, 5).map(() => faker.random.word()),
    // photos: _.range(0, 5).map(() => faker.random.image()),
    randomLocation()
  ];
}

function generatePhoto(id){
  return [faker.random.image(), id];
}

function generateType(id){
  return [faker.random.word(), id];
}

function generateInsertRow(doc){
  const DBformat = _.map((element) => {
    if (typeof element === 'string'){
      return `\$\$${element}\$\$`;
    } else if (element.type && element.type === 'Point'){
      return `ST_GeomFromText('POINT(${element.coordinates[0]} ${element.coordinates[1]})', 4326)`;
    } else {
      return element;
    }
  }, doc);

  // console.log(DBformat);

  return `(${DBformat.join(',')})`;
}

function generateInsert(page, batchSize, offset){
  const start = page*batchSize + offset;
  const end = (page + 1)*batchSize + offset;

  const firstDoc = generateDocument(start);
  const firstRow = generateInsertRow(firstDoc);

  let query = `INSERT INTO restaurants VALUES ${firstRow}`;
  _.range(start + 1, end).forEach((id) => {
    const doc = generateDocument(id);
    const row = generateInsertRow(doc);
    query += `, ${row}`;
  });

  return query;
}

function generateTypeInsert(page, batchSize, offset){
  const start = page*batchSize + offset;
  const end = (page + 1)*batchSize + offset;

  const firstDoc = generateType(start);
  const firstRow = generateInsertRow(firstDoc);

  let query = `INSERT INTO types VALUES ${firstRow}`;
  _.range(start + 1, end).forEach((id) => {
    const doc = generateType(randomInteger(start, end - 1));
    const row = generateInsertRow(doc);
    query += `, ${row}`;
  });

  return query;  
}

function generatePhotoInsert(page, batchSize, offset){
  const start = page*batchSize + offset;
  const end = (page + 1)*batchSize + offset;

  const firstDoc = generatePhoto(start);
  const firstRow = generateInsertRow(firstDoc);

  let query = `INSERT INTO photos VALUES ${firstRow}`;
  _.range(start + 1, end).forEach((id) => {
    const doc = generatePhoto(randomInteger(start, end - 1));
    const row = generateInsertRow(doc);
    query += `, ${row}`;
  });

  return query;  
}

async function seedDB(){
  // note: we don't try/catch this because if connecting throws an exception
  // we don't need to dispose of the client (it will be undefined)
  const client = await pool.connect();
  var count = parseInt(10000000 / numCPUs);
  var pageCounter = 0;
  var batchSize = 1000;
  const num = parseInt(process.env.num);
  const offset = num*count;

  try {
    await client.query('BEGIN');

    async function insertRows(){
      console.log('page', num, pageCounter, batchSize, offset);

      const ins = generateInsert(pageCounter, batchSize, offset);
      const typesIns = generateTypeInsert(pageCounter, batchSize, offset);
      const photosIns = generatePhotoInsert(pageCounter, batchSize, offset);

      await client.query(ins);
      await client.query(typesIns);
      await client.query(photosIns);
      count -= batchSize;
      pageCounter += 1;
      if (count >= batchSize){
        return insertRows();         
      } else {
        return Promise.resolve(true);
      }
    }

    await insertRows();

    await client.query('COMMIT');
    console.log('DONE', (new Date().getTime() - startTime) / 1000, 's');
    process.exit();
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}