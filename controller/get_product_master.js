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


// 데이터베이스 연결
product_db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('get_product_master controller _ MySQL database connected');
});


const getProductmaster = async (req, res) => {
  const selectAllquery = 'SELECT * FROM product_master'; // 쿼리 저장

  product_db.query(selectAllquery, (err, results) =>{
    if(err){ //에러 
      res.status(500).send('pro_master controller, select all query err'); 
      return;
    }
    res.json(results);
  })

 
};

module.exports = { getProductmaster };

