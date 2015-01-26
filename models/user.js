var pg = require('pg');

function User(id, fistName, lastName, email) {
	this.id = id;
	this.firstName = firstName.trim();
	this.lastName = lastName.trim();
	this.email = email.trim();
};

User.prototype.save = function(callback) {
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    	client.query(
      		'INSERT INTO p_user (email, firstName, lastName) values ($1, $2, $3);',
      		[this.email, this.firstName, this.lastName],
      		callback(err, result)
    	);
  	});
}

module.exports = User;