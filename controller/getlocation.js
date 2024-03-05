const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');


const product_db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});


product_db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('location_controller _ MySQL database connected');
});


const getlocation = async (req, res) => {
  const selectAllquery = 'SELECT * FROM location'; // 쿼리 저장

  product_db.query(selectAllquery, (err, results) =>{
    if(err){ //에러 
      res.status(500).send('location controller, select all query err'); 
      return;
    }
    res.json(results);
  })
};



module.exports = { getlocation };
