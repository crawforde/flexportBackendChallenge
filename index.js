var express = require('express');
var app = express();
var db = require('./pool.js');

app.get('/',function(req,res){
  res.send('Server running!');
});

app.listen(process.env.PORT || 3000, function(){
  console.log(`Server listening on port ${process.env.PORT || 3000}.`);
});
