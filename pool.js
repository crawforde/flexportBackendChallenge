"use strict";
var pg = require('pg');

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable missing.");
  process.exit(1);
}

// Establish a connection to Postgres here using pg.Pool
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Error running query', err);
  } else {
    console.log('Success, you are connected to Postgres');
  }
});

// Export 'pool' so other files can use Postgres
module.exports = pool;
