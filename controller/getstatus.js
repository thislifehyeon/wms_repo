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
  console.log('getstatus controller _ MySQL database connected');
});


const getStatus = async (req, res) => {
  const selectAllquery = 'SELECT * FROM product'; // 쿼리 저장
  const received = req.body;
  console.log('Received product status data from client:');

  product_db.query(selectAllquery, (err, results) =>{
    if(err){ //에러 
      res.status(500).send('getstatus controller, select all query err'); 
      return;
    }
    res.json(results);
  })

 
};

module.exports = { getStatus };

