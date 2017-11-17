"use strict";
// THIS FILE SETS UP EXPRESS SERVER AND ENDPOINTS
// EXPORTS: NONE
//////////////////////////////////////////////////////////////////////////////////////

// Set up Express server.
var express = require('express');
var app = express();

// Import query methods
const { queryDatabase , formatData } = require('./query');

// Endpoint for shipment queries
app.get('/api/v1/shipments', async function(req,res){
  if(!req.query.company_id){
    res.status(422).json({"errors": ["company_id is required"]});
  }
  try{
    var result = await queryDatabase(req.query);
    var data = formatData(result.rows, req.query.page, req.query.per);
    res.json(data);
  } catch(err){
    res.status(500).send(err);
  }
});

// Default endpoint for all other server requests.
app.use('/', async function(req,res){
  res.send('Server running.');
});

// Start server (default port = 3000)
app.listen(process.env.PORT || 3000, function(){
  console.log(`Server listening on port ${process.env.PORT || 3000}.`);
});
