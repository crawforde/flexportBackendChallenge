// Connect to Postgres database
const db = require('./pool.js');

const allowedSortParameters={
  id: true,
  name: true,
  company_id: true,
  created_at: true,
  updated_at: true,
  international_transportation_mode: true,
  international_departure_date: true
};

const allowedFilterParameters={
  ocean: true,
  truck: true
};


const makeQuery = function(query){

}

module.exports = makeQuery;
