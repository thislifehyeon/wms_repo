const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

const product_db = mysql.createConnection({
  host: 'localhost',
  user: 'wms',
  password: 'wms',
  database: 'wms_project'
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
        const { name, category, quantity, mfg, exp } = obj;

        // 데이터베이스 쿼리를 비동기적으로 실행
        const result = await new Promise((resolve, reject) => {
          const query = `INSERT INTO product (productname, category, quantity, mfg, exp) VALUES (?, ?, ?, ?, ?)`;
          const values = [name, category, quantity, mfg, exp];
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

