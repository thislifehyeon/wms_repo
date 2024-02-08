const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

console.log("process.env.DATABASE_HOST : " ,process.env.DATABASE_HOST);


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
  console.log('truncate controller _ MySQL database connected');
});


const product_truncate = async (req, res) => {
  const selectAllquery = 'TRUNCATE product;'; // 쿼리 저장

  product_db.query(selectAllquery, (err, results) =>{
    if(err){ //에러 
      res.status(500).send('truncate controller, select all query err'); 
      return;
    }
    console.log('truncate');
    res.status(200)
  })

 
};

module.exports = { product_truncate };

