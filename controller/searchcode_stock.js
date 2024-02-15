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
  console.log('searchcode_stock controller _ MySQL database connected');
});


const search_code_stock = async (req, res) => {
  const selectAllquery = `
  SELECT *
  FROM product
  WHERE product_code = '${req.body.productcode}' OR bar_code = '${req.body.barcode}';
`;
  console.log(req.body.barcode);
  console.log(req.body.productcode);
  product_db.query(selectAllquery, (err, results) =>{ 
    if(err){ //에러 
      res.status(500).send("code search err"); 
      return;
    }
    console.log(results);

    if(results.length == 0){
      res.json({ message: '맞는 상품이 없습니다.\n다시 검색하세요.', results: results });
    }
    else{
      res.json({ message: '조회성공', results: results });
    }

    res.status(200)
  })

 
};

module.exports = { search_code_stock };

