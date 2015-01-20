 CREATE TABLE p_user (
       id         bigserial PRIMARY KEY,
       email      varchar(120) NOT NULL,
       firstName  varchar(120) NOT NULL,
       lastName   varchar(120) NOT NULL,
       points     bigint DEFAULT 0
);

CREATE TABLE tx (
       p_user_id bigint NOT NULL,
       amount    bigint NOT NULL
);


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
                  if(result.row[0].points < debit) {
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


