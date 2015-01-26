var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var pg = require('pg');
var User = require('./models/user');

// Application setup

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Misc routes

app.get('/', function(request, response) {
  response.send('View the API at https://github.com/bhiles/loyalty#api');
});

// Helper functions

function isEmpty(str) {
    return (!str || 0 === str.length || !str.trim());
}

var rollback = function(client) {
  //terminating a client connection will
  //automatically rollback any uncommitted transactions
  //so while it's not technically mandatory to call
  //ROLLBACK it is cleaner and more correct
  client.query('ROLLBACK', function() {
    client.end();
  });
};

// Create a user
app.post('/user', function (request, response) {
  var b = request.body;

  // verify required fields exist
  if (isEmpty(b.email) || isEmpty(b.first) || isEmpty(b.last)) { 
    response.send('Error!  One of the necesasry fields are missing!'); 
    return;
  }

  var u = new User(null, b.first, b.last, b.email);

  // insert the values into the database  
  u.save(
    function(err, result) {
        done();
        if (err) { 
            console.error(err); 
            response.send("Error " + err); 
        } else { 
          var data = result.rows[0];
          var createdUser = new User(data['id'], data['firstName'], data['lastName'], data['email']);
          response.send(createdUser); 
        }
    });  
})

// Fetch a specific user
app.get('/user/:id', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM p_user where id = $1',
                 [request.params.id],
                 function(err, result) {
      done();
      if (err) { 
        console.error(err); response.send("Error " + err); 
      } else { 
        if (result.rows.length == 0) {
          response.send("Error! No user was found for id: " + request.params.id);
        } else { 
          response.send(result.rows[0]); 
        }
      }
    });
  });
})

// Create a transaction
app.post('/user/:id/tx', function (request, response) {
  var userId = request.params.id;
  var amount = request.body.amount;

  // verify required fields exist
  if (isEmpty(userId) || isEmpty(amount)) { 
    response.send('Error!  One of the necesasry fields are missing!'); 
    return;
  }

  // transform the string to a number
  amount = parseInt(amount);
  if (!amount) {
    response.send('Error! Amount is not a numeric value!');
    return;
  }

  // find the user associated with the amount
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM p_user where id = $1',
                 [userId],
                 function(err, result) {
      done();
      if (err) { 
        console.error(err); response.send("Error " + err); 
      } else { 
        if (result.rows.length == 0) {
          response.send("Error! No user was found for id: " + request.params.id);
        } else { 

          // for a credit, the transaction can always happen
          if (amount >= 0) {
            client.query('BEGIN', function(err, result) {
              if(err) return rollback(client);
              client.query(
                'INSERT INTO tx VALUES ($1, $2)',
                [userId, amount], 
                function(err, result) {
                   if(err) return rollback(client);
                   client.query(
                     'UPDATE p_user SET (points) = (points + $1) WHERE id = $2', 
                     [amount, userId],
                     function(err, result) {
                      if(err) return rollback(client);
                      client.query('COMMIT', client.end.bind(client));
                      response.send("Successful transaction!");  
                    });
                });
            });
          } else {

           // for a debit, we'll need to verify afterwards that the
           // funds aren't overdrawn
           var debit = 0 - amount;
           client.query('BEGIN', function(err, result) {
             if(err) return rollback(client);
             client.query(
               'SELECT points FROM p_user WHERE id = $1',
               [userId], 
               function(err, result) {
                  if(err) return rollback(client);
                  if(result.rows[0].points < debit) {
                    response.send('Funds are insufficient :(');
                    return rollback(client);
                  }
                  client.query(
                    'INSERT INTO tx VALUES ($1, $2)',
                    [userId, amount], 
                    function(err, result) {
                      client.query(
                        'UPDATE p_user SET (points) = (points + $1) WHERE id = $2', 
                        [amount, userId],
                        function(err, result) {
                          if(err) return rollback(client);
                          client.query('COMMIT', client.end.bind(client));
                          response.send("Successful transaction!");  
                      });
                  });
              
             });           
           });
          }
        }
      }
    });
  });  
})

// List all transactions for a user
app.get('/user/:id/tx', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM tx where p_user_id = $1',
                 [request.params.id],
                 function(err, result) {
      done();
      if (err) { 
        console.error(err); response.send("Error " + err); 
      } else { 
        response.send(result.rows); 
      }
    });
  });
})

// Start the application
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
