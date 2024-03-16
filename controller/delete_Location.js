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


const delete_location = async (req, res) => {
  const { code } = req.params; // URL에서 code 파라미터 추출

  // SQL 쿼리: 지정된 id의 로케이션 삭제
  const sql = 'DELETE FROM location WHERE code = ?';

  product_db.query(sql, [code], (err, result) => {
    if (err) {
      console.error('MySQL 쿼리 오류:', err);
      return res.status(500).send('서버 오류');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('해당 code를 가진 로케이션을 찾을 수 없습니다.');
    }
    res.send('로케이션이 성공적으로 삭제되었습니다.');
  });

};

module.exports = { delete_location };
