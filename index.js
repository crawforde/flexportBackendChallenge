var express = require('express');
var app = express();
var db = require('./pool.js');

const allowedSortParameters={
  id: true,
  name: true,
  company_id: true,
  created_at: true,
  updated_at: true,
  international_transportation_mode: true,
  international_departure_date: true
};


app.get('/api/v1/shipments', async function(req,res){
  var sortParam = 'id';
  if(req.query.sort && allowedSortParameters.hasOwnProperty(req.query.sort)){
    sortParam = req.query.sort;
  }
  sortParam = "s." + sortParam;
  var sortDir = "ASC";
  if(req.query.direction && req.query.direction.toLowerCase() === "desc" ){
    sortDir = "DESC";
  }
  try{
    result = await db.query(`
      SELECT
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
        c.id = $1
      ORDER BY
        ${sortParam} ${sortDir},
        p.id
    `,[req.query.company_id]);
    var records = [];
    result.rows.forEach((row)=>{
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
    var data = {
      records
    };
    res.json(data);
  }catch(err){
    res.status(500).send(err);
  }
});

app.use('/', async function(req,res){
  res.send('Server running.');
});

app.listen(process.env.PORT || 3000, function(){
  console.log(`Server listening on port ${process.env.PORT || 3000}.`);
});
