// require('newrelic');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
const dbName = 'js_nearby';
var client;

// server side react
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const NearByApp = require('./server-bundle.js');

const pool = new Pool({
  database: dbName
});

// init
(async () => {
  // before doing anything make a prepared statement
  // for our queries
  const prepareQuery = `PREPARE findNearBy(int) AS
  SELECT json_agg(row) 
  FROM (SELECT * 
        FROM restaurants r, restaurants r2 
        WHERE r.place_id = $1 
        AND ST_DWithin(r.location, r2.location, 0.0005) 
        LIMIT 7) 
  AS row;
  `;

  client = await pool.connect();
  await client.query(prepareQuery);
})();



// var restaurants = require('../db/models/restaurant.js');
// var mongoose = require('mongoose');
// const dbAddress = process.env.DB_ADDRESS || 'localhost';

// var uri = `mongodb://${dbAddress}/wegot`;
// mongoose.connect(uri, { useMongoClient: true });

app.use(cors());
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../client/dist')));

// express.static(path.join(__dirname, '../client/dist')

app.get('/restaurants/:id', async (req, res) => {
  const json = await recs(req);
  const component = ReactDOMServer.renderToString(React.createElement(NearByApp.App, { data: json }));
  const html = `
    <html>
      <head>
        <link rel="stylesheet" href="/styles.css">
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet">
        <link rel="icon" href="http://res.cloudinary.com/madlicorice/image/upload/v1520448614/WeGot-favicon.ico" type="image/x-icon"> 
      </head>
      <body>
        <div id="recommendations-app">${component}</div>
        <script>
          window.initData = ${JSON.stringify(json)};
        </script>
        <script src="/bundle.js" type="text/javascript"></script>
      </body>
    </html>
  `;

  res.send(html);
});

/*app.get('/api/restaurants/:id/recommendations',*/ 

async function recs (req) {
  const placeId = req.params.id || 1000;
  const executeQuery = `EXECUTE findNearBy(${placeId})`;
  const results = await client.query(executeQuery);
  const json = results.rows[0].json_agg;


  // var placeId = req.params.id || 0;
  // console.log("GET " + req.url);
  // // find recommended restaurants based on id
  // var results = [];
  // restaurants.findOne(placeId, (err, data)=> {
  //   if(err){
  //     res.status(500);
  //     console.log(err);
  //   } else{
  //     // console.log("restaurant info:",data);
  //     var nearbyArr = data[0].nearby;
  //     // console.log(nearbyArr);
  //     results.push(data[0]);

  //     restaurants.findMany(nearbyArr, (err, data)=> {
  //       if(err){
  //         res.status(500);
  //         console.log(err);
  //       } else{
  //         // console.log("recommended restaurants:", data);
  //         results.push(data)
  //         // console.log("number of recommended: " + data.length);
  //         res.status(200);
  //         // res.send(data);
  //         // console.log(results.length);
  //         res.send(results);
  //       }
  //     });
  //   }
  // });
  return json; 
};


app.listen(3004, function () { console.log('WeGot app listening on port 3004!') });
