'use strict';
// THIS FILE USES THE PG NPM PACKAGE TO CONNECT TO A Postgres DATABASE
// EXPORTS:
//    1) pool
//        TYPE: pg pool Object
//        DESCRIPTION: (see documentation on NPM for pg package)
//////////////////////////////////////////////////////////////////////////////////////

// Use pg for database connection
var pg = require('pg');

// Check for database url environment variable
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable missing.');
  process.exit(1);
}

// Establish a connection to Postgres here using pg.Pool
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Make sure the database is connected
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Error running query', err);
  } else {
    console.log('Success, you are connected to Postgres');
  }
});

// Export 'pool' so other files can use Postgres
module.exports = pool;

// Note: Referenced pg pool setup from one of my previous servers.
