const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

var restaurants = require('../db/models/restaurant.js');
var mongoose = require('mongoose');
const dbAddress = process.env.DB_ADDRESS || 'localhost';

var uri = `mongodb://${dbAddress}/wegot`;
mongoose.connect(uri, { useMongoClient: true });

app.use(cors());
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../client/dist')));
app.use('/restaurants/:id', express.static(path.join(__dirname, '../client/dist')));

app.get('/api/restaurants/:id/recommendations', function (req, res) {
  var placeId = req.params.id || 0;
  console.log("GET " + req.url);
  // find recommended restaurants based on id
  var results = [];
  restaurants.findOne(placeId, (err, data)=> {
    if(err){
      res.status(500);
      console.log(err);
    } else{
      // console.log("restaurant info:",data);
      var nearbyArr = data[0].nearby;
      // console.log(nearbyArr);
      results.push(data[0]);

      restaurants.findMany(nearbyArr, (err, data)=> {
        if(err){
          res.status(500);
          console.log(err);
        } else{
          // console.log("recommended restaurants:", data);
          results.push(data)
          // console.log("number of recommended: " + data.length);
          res.status(200);
          // res.send(data);
          // console.log(results.length);
          res.send(results);
        }
      });
    }
  });
});


app.listen(3004, function () { console.log('WeGot app listening on port 3004!') });
