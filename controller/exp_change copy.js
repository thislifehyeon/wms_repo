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
  console.log('expchange_controller _ MySQL database connected');
});


const exp_change = async (req, res) => {

    let original_data = [];
    let change_data = [];
    const change_all = false;

    const { savedProduct, searchResult } = req.body;

  
////////////////////////////////////////////////////첫 번째 조회, 오리지널 데이터로 데이터 찾기
    try {
      // 클라이언트에서 전송한 데이터 받기
  
      // savedProduct0의 exp와 mfg 정보 가져오기
      const { product_code, exp, mfg } = searchResult;
  
      // product 테이블에서 해당 exp와 mfg 정보와 일치하는 데이터 검색
      const selectQuery = `
        SELECT *
        FROM product
        WHERE product_code = ? AND exp = ? AND mfg = ?
      `;
  
      product_db.query(selectQuery, [product_code, exp, mfg], (err, results) => {
        if (err) {
          console.error('MySQL 쿼리 오류:', err);
          //res.status(500).json({ error: '서버 오류: 데이터베이스에서 데이터를 조회하는 중에 오류가 발생했습니다.' });
        } else {
          console.log('expchange, 1번 조회된 결과:', results);
          //res.status(200).json({ message: '데이터 조회 성공', data: results });
          //조회 성공한 경우
          original_data = results;
        }
      });
    } catch (error) {
      console.error('Error handling ipgo request:', error);
      res.status(500).json({ error: '서버 오류: 데이터를 처리하는 중에 오류가 발생했습니다.' });
    }

    ///////////////////////////두 번째 조회, 오리지널 데이터를 찾았으면 바꿀 날짜로 조회

    if(original_data.length != 0){
      try {
        

        console.log("두 번째 조회 시작");
        console.log("savedProduct : ", savedProduct);
        // 클라이언트에서 전송한 데이터 받기

    
        // searchResult exp와 mfg 정보 가져오기
        const { product_code, exp, mfg } = savedProduct;
    
        // product 테이블에서 해당 exp와 mfg 정보와 일치하는 데이터 검색
        const selectQuery = `
          SELECT *
          FROM product
          WHERE product_code = ? AND exp = ? AND mfg = ?
        `;
    
        product_db.query(selectQuery, [product_code, exp, mfg], (err, results) => {
          if (err) {
            console.error('MySQL 쿼리 오류:', err);
            //res.status(500).json({ error: '서버 오류: 데이터베이스에서 데이터를 조회하는 중에 오류가 발생했습니다.' });
          } else {
            console.log('2번째 조회 조회된 결과:', results);
            //res.status(200).json({ message: '데이터 조회 성공', data: results });
            //조회 성공한 경우
            change_data = results;
          }
        });
      } catch (error) {
        console.error('Error handling ipgo request:', error);
        res.status(500).json({ error: '서버 오류: 데이터를 처리하는 중에 오류가 발생했습니다.' });
      }
    }
    else{
      res.status(500).json({ error: '서버 오류: 데이터베이스에서 데이터를 조회하는 중에 오류가 발생했습니다.' });
    }


    ////////////세 번째 쿼리, 바꿀 값으로 조회한 결과가 있으면 수량만큼 업  데이트, 오리지널 데이터에서 수량만큼 마이너스.
    //없으면 인서트, 수량만큼 마이너스



    if( original_data.length != 0 && change_data.length != 0 ){
        console.log("바꿀 소비기한이 있을 때, 데이터수정이 이루어짐");


        const updatedQuantity = change_data.quantity + Number(savedProduct.quantity); // 기존 수량에 추가할 수량을 더함
        const minusQuantity = original_data.quantity - savedProduct.quantity;
        const updateQuery = `
          UPDATE product
          SET quantity = ?
          WHERE product_code = ? AND mfg = ? AND exp = ?
        `;
        const deleteQuery = `
        DELETE FROM product
        WHERE product_code = ? 
        AND mfg = ? 
        AND exp = ?
      `;
      

        product_db.query(updateQuery, [updatedQuantity, change_data.productcode, change_data.mfg, change_data.exp], (err, result) => {
          if (err) {
            console.error('수량업데이트오류:', err);
          } else {
            console.log('수량 업데이트 성공');
          }
        });


        if(savedProduct.quantity == searchResult.quantity){
          product_db.query(deleteQuery, [original_data.productcode, original_data.mfg, original_data.exp], (err, result) => {
            if (err) {
              console.error('삭제오류:', err);
            } else {
              console.log('삭제성공');
            }
          });
        }
        else{
          product_db.query(updateQuery, [minusQuantity, original_data.productcode, original_data.mfg, original_data.exp], (err, result) => {
            if (err) {
              console.error('수량마이너스오류:', err);
            } else {
              console.log('수량 마이너스 성공');
            }
          });
        }
        
        res.status(200).json({ message: '데이터 변경 성공' });
    }
    
    else if(original_data.length != 0 && change_data.length == 0){
      console.log("바꿀 소비기한이 없을 때, 새롭게 데이터가 만들어짐");
      //res.status(200).json({ message: '데이터 변경 성공' });
    }
    else{
      console.log("이상해요");
      //res.status(200).json({ message: '데이터 변경 성공' });
    }

};



module.exports = { exp_change };
