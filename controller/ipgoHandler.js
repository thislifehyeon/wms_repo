const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

/*
const product_db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});
*/

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
  console.log('ipgo_controller _ MySQL database connected');
});

/*
app.post('/api/ipgo', (req, res) => {
  const receivedDataArray = req.body;
  console.log('Received data from client:', receivedDataArray);

    // 모든 데이터를 한 번에 처리하기 위해 빈 배열을 선언
    const insertionResults = [];

      receivedDataArray.forEach(obj => {       
          const { name, category, quantity } = obj; // 원하는 컬럼에서 데이터 추출
        
          const query = `INSERT INTO product (productname, category, quantity) VALUES (?, ?, ?)`;
          const values = [name, category, quantity];
        
          product_db.query(query, values, (err, result) => {
            if (err) {
              console.error('MySQL 쿼리 오류:', err);
              insertionResults.push({ success: false, error: err });
              // 오류 처리
            } else {
              console.log('데이터가 성공적으로 삽입되었습니다.');
              insertionResults.push({ success: true });
              // 성공적으로 삽입된 경우 처리
              
            }
          });
          console.log(insertionResults);
          
          // 모든 데이터를 처리한 후 한 번의 응답을 보냄
          if (insertionResults.length === receivedDataArray.length) {
            console.log('모든 작업 완료 클라이언트로 성공 송신');
            res.json({ message: '입고가 진행되었습니다.', results: insertionResults });
          }

      });

});
폐기한 이유 : forEach 루프 내에서 비동기적으로 실행되는 데이터베이스 쿼리의 콜백 함수에서 insertionResults에 데이터를 추가하는 문제가 있습니다. 
이러한 상황에서는 forEach 대신에 for...of 루프를 사용하여 해결할 수 있습니다. for...of 루프는 비동기 작업의 완료를 기다려주는 더 좋은 방법입니다. 
아래 코드는 for...of 루프를 사용한 수정된 버전입니다.
*/

const handleIpgoRequest = async (req, res) => {
  
    const receivedDataArray = req.body;
    console.log('Received data from client:', receivedDataArray);

    // 모든 데이터를 한 번에 처리하기 위해 빈 배열을 선언 << 자꾸 송신을 여러번 보내려고 해서 추가함
    const insertionResults = [];

    try {
      for (const obj of receivedDataArray) {
        const { productcode, quantity, mfg, exp } = obj;

/*
        // 받은 상품코드 값으로 어떤 상품인지 확인하는 데이터베이스 쿼리
        const searchresult = await new Promise((resolve, reject) => {
          const values = [productcode, quantity, mfg, exp];

          const searchquery = 
          `
          SELECT *
          FROM product_master
          WHERE product_code = '${values[0]}';
          `;
          
          product_db.query(searchquery, (err, result) => {
            if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err); // 오류 발생 시 Promise를 거부
            } else {
              console.log('조회 성공 : ', result);
              resolve(result); // 성공 시 Promise를 이행
            }
          });
        });*/

        const searchResult = await new Promise((resolve, reject) => {
          const searchquery = `SELECT * FROM product_master WHERE product_code = ?`;
          product_db.query(searchquery, [productcode], (err, result) => {
            if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err);
            } else {
              console.log('조회 성공:', result);
              resolve(result[0]); // 첫 번째 결과만 사용
            }
          });
        });

              // mfg와 exp가 null인 경우 임의의 날짜 데이터로 대체
      const currentDate = new Date().toISOString().split('T')[0];
      const formattedMfg = mfg || currentDate;
      const formattedExp = exp || currentDate;

              // 조회한 결과를 사용하여 데이터베이스 삽입 쿼리 실행
      const insertResult = await new Promise((resolve, reject) => {
        const query = `INSERT INTO product (product_code, bar_code, name, weight, category, quantity, mfg, exp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [searchResult.product_code, searchResult.bar_code, searchResult.name, searchResult.weight, searchResult.category_code, quantity, formattedMfg, formattedExp];
        product_db.query(query, values, (err, result) => {
          if (err) {
            console.error('MySQL 쿼리 오류:', err);
            reject(err);
          } else {
            console.log('데이터가 성공적으로 삽입되었습니다.');
            resolve(result);
          }
        });
      });


        /*
        // 데이터베이스 쿼리를 비동기적으로 실행
        const result = await new Promise((resolve, reject) => {
          const query = `INSERT INTO product (product_code, bar_code, productname, category, quantity, weight, mfg, exp) VALUES (?, ?, ?, ?, ?)`;
          const values = result;
          product_db.query(query, values, (err, result) => {
            if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err); // 오류 발생 시 Promise를 거부
            } else {
              console.log('데이터가 성공적으로 삽입되었습니다.');
              resolve(result); // 성공 시 Promise를 이행
            }
          });
        });
        */

        insertionResults.push({ success: true });
      }

      // 모든 데이터를 처리한 후 한 번의 응답을 보냄
      res.json({ message: '입고가 진행되었습니다.', results: insertionResults });
    } catch (error) {
      console.error('Error inserting data to database:', error);
      res.status(500).json({ error: '서버 오류: 데이터베이스에 데이터를 삽입하는 중에 오류가 발생했습니다.' });
    }
  
};

module.exports = { handleIpgoRequest };

