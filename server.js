const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let db;
MongoClient.connect(process.env.DB_URL, function (error, client) {
  if (error) {
    return console.log(error);
  }

  db = client.db('trashchecker');

  app.listen(process.env.PORT || 8080, function () {
    console.log('database is connected to port 4000');
  });
});

app.get('/', function (_, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/report', function (_, res) {
  res.sendFile(__dirname + '/report.html');
});

app.post('/add', function (req, res) {
  console.log(req.body.trash);
  console.log(req.body.type);
  db.collection('list').insertOne(
    { trash: req.body.trash, type: req.body.type },
    function (error, result) {
      console.log('저장완료');
      res.send(
        '<script>alert("입력하신 정보의 등록이 완료되었습니다."); location.href="/";</script>'
      );
    }
  );
});

app.get('/result', function (req, res) {
  db.collection('list')
    .find()
    .toArray(function (error, result) {
      const container = [];
      for (let i = 0; i < result.length; i++) {
        container.push(result[i].trash);
        if (req.query.foodname === result[i].trash) {
          res.render('./result.ejs', { data: result[i] });
        }
      }
      if (container.indexOf(req.query.foodname) === -1) {
        res.render('./notFound.ejs');
      }
    });
});
