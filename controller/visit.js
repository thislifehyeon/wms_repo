const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const moment = require('moment-timezone');

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
  const kstTime = moment().tz("Asia/Seoul").format('YYYY-MM-DD HH:mm:ss');

  const visitCount = req.cookies.visitCount ? parseInt(req.cookies.visitCount) + 1 : 1;
  res.cookie('visitCount', visitCount.toString(), { maxAge: 86400000 }); // 쿠키 유효 시간: 1일
  // 데이터베이스에 방문자 수 
  const insertQuery = `
  INSERT INTO visit_counts (date, count, last_visit_time)
  VALUES (CURDATE(), 1, '${kstTime}');
  `;
  

  // 데이터베이스에 방문자 수를 기록하는 쿼리 실행
  product_db.query(insertQuery, (err, result) => {
    if (err) {  
      console.error('MySQL 쿼리 오류:', err);
      res.status(500).send('서버 오류: 데이터베이스에 방문자 수를 기록하는 중에 오류가 발생했습니다.');
    } else {
      res.send('Visit count updated');
    }
  });

};


module.exports = { visit };

