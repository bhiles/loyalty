# Loyalty

This is a solution to the problem posed [here](https://gist.github.com/mikeybtn/0c5f3a8a1b8ac549b73f).

It's written in Node.js using the Express.js framework and a PostgeSQL database and hosted on Heroku.

Database migration files are located [here](db/).

### API

#### Create a user (POST /user)

    curl https://vast-bayou-6783.herokuapp.com/user -d "email=bennett@gmail.com&first=bennett&last=hiles"

#### Get a user (GET /user/:id)

    https://vast-bayou-6783.herokuapp.com/user/1

#### Create a transaction (POST /user/:id/tx)

A credit looks like:

    curl https://vast-bayou-6783.herokuapp.com/user/1/tx -d "amount=20"

A debit looks like:

    curl https://vast-bayou-6783.herokuapp.com/user/1/tx -d "amount=-10"

#### Get all transactions for a user (GET /user/:id/tx)

    https://vast-bayou-6783.herokuapp.com/user/1/tx

### Assumptions

* varchar(120) should be able to handle for email (same for first and last name)
* "it should fail" (from the problem description) is handled by the application returning with an error message

### Future Plans

* Create tests
* Throw an error for invalid email addresses
* Return error status codes when errors occur
* Getting transactions from a user the doesn't exist should return an error instead of an empty array

