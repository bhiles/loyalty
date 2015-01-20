var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get('/', function(request, response) {
  response.send('Hello World! and Bennett!');
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.send(result.rows); }
    });
  });
})


function isEmpty(str) {
    return (!str || 0 === str.length || !str.trim());
}

// User functions
app.post('/user', function (request, response) {
  var b = request.body;

  // verify required fields exist
  if (isEmpty(b.email) || isEmpty(b.first) || isEmpty(b.last)) { 
    response.send('Error!  One of the necesasry fields are missing!'); 
    return;
  }

  // insert the values into the database  
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(
      'INSERT INTO p_user (email, firstName, lastName) values ($1, $2, $3);',
      [p.email.trim(), p.first.trim(), p.last.trim()],
      function(err, result) {
        done();
        if (err)
          { console.error(err); response.send("Error " + err); }
        else
          { response.send(result.rows); }
    });
  });
})

app.get('/user/:id', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM user where id = $1',
                 [request.params.id],
                 function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.send(result.rows); }
    });
  });
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
