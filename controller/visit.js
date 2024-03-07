const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
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
  console.log('visit controller _ MySQL database connected');
});


const visit = (req, res) => {
  console.log("-------------start visit code-----------");
  const visitCount = req.cookies.visitCount ? parseInt(req.cookies.visitCount) + 1 : 1;
  res.cookie('visitCount', visitCount.toString(), { maxAge: 86400000 }); // 쿠키 유효 시간: 1일
  // 데이터베이스에 방문자 수 
  const insertQuery = `
  INSERT INTO visit_counts (date, count)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE count = count + 1;
  `;

  
  const date = new Date().toISOString().slice(0, 10); // 현재 날짜를 YYYY-MM-DD 형식으로 가져옴

  // 데이터베이스에 방문자 수를 기록하는 쿼리 실행
  product_db.query(insertQuery, [date, visitCount], (err, result) => {
    if (err) {  
      console.error('MySQL 쿼리 오류:', err);
      res.status(500).send('서버 오류: 데이터베이스에 방문자 수를 기록하는 중에 오류가 발생했습니다.');
    } else {
      console.log('방문자 수가 성공적으로 기록되었습니다.');
      res.send('Visit count updated');
    }
  });

};


module.exports = { visit };

