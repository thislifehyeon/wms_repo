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
  try {
      const { savedProduct, searchResult } = req.body;
      console.log("최초오오오오옹 savedProduct: ", savedProduct);

      // 첫 번째 조회 - 수정할 데이터가 이미 있는지 조회
      const originalData = await getProductByCodeMfgExp(searchResult.product_code, searchResult.exp, searchResult.mfg);

      // 첫 번째 조회 결과가 있을 때 두 번째 조회 /흠 굳이 첫 번째 조회가 필요한지 의문임. 좀 더 안전하게 가려고 하는건데 절차가 너무 복잡해지는듯
      let changeData = [];
      if (originalData.length !== 0) {
          changeData = await getProductByCodeMfgExp(savedProduct.product_code, savedProduct.exp, savedProduct.mfg);
      }

      //changedata = 디비에서 가져온 기존 바꿀데이터.
      //savedproduct = 클라에서 받아온 새로운 바꿀데이터

      // 세 번째 쿼리
      //바꿀 데이터가 존재하면, 수량 더하기
      if (originalData.length !== 0 && changeData.length !== 0) {
          const updatedQuantity = changeData[0].quantity + Number(savedProduct.quantity);
          const minusQuantity = originalData[0].quantity - savedProduct.quantity;
          console.log("updatedQuantity: ", updatedQuantity);
          console.log("minusQuantity: ", minusQuantity);

          // 수량 전부 바꾸면 0개 되는 기존 데이터 삭제
          if (savedProduct.quantity === searchResult.quantity) {
              console.log("전부 바꿔요");
              await updateProductQuantity(updatedQuantity, savedProduct.product_code, savedProduct.exp, savedProduct.mfg);
              await deleteProduct(searchResult.product_code, searchResult.exp, searchResult.mfg);
          } else {
              console.log("일부만 바꿔요");
              await updateProductQuantity(updatedQuantity, savedProduct.product_code, savedProduct.exp, savedProduct.mfg);
              await updateProductQuantity(minusQuantity, searchResult.product_code, searchResult.exp, searchResult.mfg);
          }
          return res.status(200).json({ message: '데이터 변경 성공' });
      } 
     //바꿀 날짜가 없으면 새로 만들어요 
      else if (originalData.length !== 0 && changeData.length === 0) {
          const minusQuantity = originalData[0].quantity - savedProduct.quantity;
            console.log("바꿀 소비기한이 없을 때, 새롭게 데이터가 만들어짐");

          // 수량 전부 바꾸면 0개 되는 기존 데이터 삭제
          if (savedProduct.quantity === searchResult.quantity) {
              await insertProduct(savedProduct);
              await deleteProduct(searchResult.product_code, searchResult.exp, searchResult.mfg);
          } else {
              await insertProduct(savedProduct);
              await updateProductQuantity(minusQuantity, searchResult.product_code, searchResult.exp, searchResult.mfg);
            }
          return res.status(200).json({ message: '데이터 변경 성공' });

      } else {
          console.log("이상해요");
          return res.status(500).json({ error: '서버 오류: 데이터를 처리하는 중에 오류가 발생했습니다.' });
      }
  } catch (error) {
      console.error('Error handling exp_change request:', error);
      return res.status(500).json({ error: '서버 오류: 데이터를 처리하는 중에 오류가 발생했습니다.' });
  }
};

const getProductByCodeMfgExp = (productCode, exp, mfg) => {
  return new Promise((resolve, reject) => {
      const selectQuery = `SELECT * FROM product WHERE product_code = ? AND exp = ? AND mfg = ?`;
      product_db.query(selectQuery, [productCode, exp, mfg], (err, results) => {
          if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err);
          } else {
              console.log('조회된 결과:', results);
              resolve(results);
          }
      });
  });
};

const updateProductQuantity = (quantity, productCode, exp, mfg) => {
  return new Promise((resolve, reject) => {
      const updateQuery = `UPDATE product SET quantity = ? WHERE product_code = ? AND exp = ? AND mfg = ?`;
      product_db.query(updateQuery, [quantity, productCode, exp, mfg], (err, result) => {
          if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err);
          } else {
              console.log('수량 업데이트 성공');
              resolve(result);
          }
      });
  });
};

const deleteProduct = (productCode, exp, mfg) => {
  return new Promise((resolve, reject) => {
      const deleteQuery = `DELETE FROM product WHERE product_code = ? AND exp = ? AND mfg = ?`;
      product_db.query(deleteQuery, [productCode, exp, mfg], (err, result) => {
          if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err);
          } else {
              console.log('데이터 삭제 성공');
              resolve(result);
          }
      });
  });
};

const insertProduct = (savedProduct) => {
  return new Promise((resolve, reject) => {
      const insertQuery = `
      INSERT INTO product (product_code, bar_code, name, weight, category, quantity, mfg, exp, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      product_db.query(insertQuery, [savedProduct.product_code, savedProduct.bar_code, savedProduct.name, savedProduct.weight, savedProduct.category,
        savedProduct.quantity, savedProduct.mfg, savedProduct.exp, savedProduct.location], (err, result) => {
          if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err);
          } else {
              console.log('데이터 생성 성공');
              resolve(result);
          }
      });
  });
};


module.exports = { exp_change };
