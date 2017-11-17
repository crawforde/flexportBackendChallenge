"use strict";
// THIS FILE CONTAINS FUNCTIONS FOR QUERYING THE shipments TABLE
// EXPORTS:
//    1) queryDatabase
//        TYPE: function
//        PARAMETERS: query Object
//        RETURNS: data Object
//        DESCRIPTION: Retrives data from the database based on given query parameters
//    2) formatData
//        TYPE: function
//        PARAMETERS: rows array
//        RETURNS: data Object
//        DESCRIPTION: Takes raw row data from queryDatabase function and formats it
//        according to project specifications.
//////////////////////////////////////////////////////////////////////////////////////

// Connect to Postgres database
const db = require('./pool.js');

// Allowed options for query parameters:
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

// Function to make a database query:
const queryDatabase = async function(query){
  // Validate query parameters
  const sortParam = getSortParam(query.sort);
  const sortDir = getSortDir(query.direction);
  const transitMode = getTransitMode(query.international_transportation_mode);
  // Make PSQL query string based on query parameters
  const queryString = makeQueryString(sortParam,sortDir,transitMode);

  // Query database and return raw data
  try{
    const result = await db.query(queryString,[query.company_id]);
    return result;
  }catch(error){
    throw(error);
  }
};

// Helper functions for query parameter validation:
const getSortParam = function(sortVal){
  if(!sortVal || !allowedSortParameters[sortVal]){
    sortVal = "id";
  }
  return "s." + sortVal;
};

const getSortDir = function(sortDir){
  if(sortDir && sortDir.toLowerCase() === "desc" ){
    return "DESC";
  }
  return "ASC";
};

const getTransitMode = function(transitMode){
  if(transitMode && allowedFilterParameters[transitMode]){
    return transitMode;
  }
  return false;
};

// Helper function for creating PSQL query string:
const makeQueryString = function(sortParam, sortDir, transitMode){
  return  `SELECT
              s.id AS "id",
              s.name AS "name",
              sp.quantity AS "quantity",
              p.id AS "product_id",
              p.sku AS "sku",
              p.description AS "description",
              query2.active_shipment_count AS "active_shipment_count"
            FROM
              shipments s
              JOIN companies c
                ON s.company_id = c.id
              JOIN shipment_products sp
                ON s.id = sp.shipment_id
              JOIN products p
                ON p.id = sp.product_id
              JOIN (
                SELECT
                  sp2.product_id,
                  COUNT(sp2.id) AS "active_shipment_count"
                FROM
                  shipment_products sp2
                GROUP BY
                  sp2.product_id
              ) query2
                ON query2.product_id = p.id
            WHERE
              ${transitMode ? `s.international_transportation_mode = '${transitMode}' AND` : ''}
              c.id = $1
            ORDER BY
              ${sortParam} ${sortDir},
              p.id`;
};


// Function to format raw data returned from the database:
const formatData = function(rows, page, per){
  var records = [];
  rows.forEach((row)=>{
    var length = records.length;
    if(length===0 || records[length-1].id !== row.id){
      records.push({
        id: row.id,
        name: row.name,
        products:[]
      });
      length++;
    }
    records[length-1].products.push({
      quantity: row.quantity,
      id: row.product_id,
      sku: row.sku,
      description: row.description,
      active_shipment_count: row.active_shipment_count
    });
  });
  records = paginate(records, page, per);
  return { records };
};

// Helper function to paginate data:
const paginate = function(records, page, per){
  page = page ? parseInt(page) : 1;
  per = per ? parseInt(per) : 4;
  var startIndex = (page-1)*per;
  return records.slice(startIndex,startIndex+per);
};


// Exports:
module.exports = {
  queryDatabase,
  formatData
};
