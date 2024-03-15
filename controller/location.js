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


const location = async (req, res) => {
  try {
      const editLocation = req.body;

      //일단 바꿀 이름으로 검색해서 없으면 걍 바로 바꾸고 있으면 코드로 같이 조회하기
      const nameData = await getLocationByName(editLocation.name);
      
      if (nameData.length == 0) {
        console.log("origindata : ", nameData);
        await updateLocation(editLocation.name, editLocation.floor, editLocation.storage_zone, editLocation.max_sku_capacity, editLocation.mixed_expiry_count,
            editLocation.location_status, editLocation.inbound_enabled, editLocation.outbound_enabled, editLocation.width, editLocation.height, editLocation.depth, editLocation.code);
        return res.status(200).json({ message: '데이터 변경 성공' });
      }
      //코드로 같이 조회해서 만약 코드와 이름이 같으면 같은 로케 수정하는 거니까 수정하고 코드와 이름이 다르면 이미 있는 이름으로 수정하려는 거니까 막음
      else{
        const codenameData = await getLocationByCodeName(editLocation.code, editLocation.name);
        if(codenameData.length !== 0){
            await updateLocation(editLocation.name, editLocation.floor, editLocation.storage_zone, editLocation.max_sku_capacity, editLocation.mixed_expiry_count,
                editLocation.location_status, editLocation.inbound_enabled, editLocation.outbound_enabled, editLocation.width, editLocation.height, editLocation.depth, editLocation.code);
            return res.status(200).json({ message: '데이터 변경 성공' });
        }
        else{
            return res.status(500).json({ message: '이미 존재하는 이름입니다. \n 다른 이름을 사용해주세요.' });
        }
      }
  } catch (error) {
      console.error('Error handling exp_change request:', error);
      return res.status(500).json({ error: '서버 오류: 데이터를 처리하는 중에 오류가 발생했습니다.' });
  }
};

const getLocationByName = (name) => {
  return new Promise((resolve, reject) => {
      const selectQuery = `SELECT * FROM location WHERE name = ?`;
      product_db.query(selectQuery, [name], (err, results) => {
          if (err) {
              console.error('MySQL 쿼리 오류:', err);
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
};

const getLocationByCodeName = (code, name) => {
    return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM location WHERE code = ? AND name = ?`;
        product_db.query(selectQuery, [code, name], (err, results) => {
            if (err) {
                console.error('code and name select 쿼리 오류:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
  };


const updateLocation = (name, floor, storage_zone, max_sku_capacity, mixed_expiry_count, location_status, inbound_enabled, outbound_enabled, width, height, depth, code) => {
  return new Promise((resolve, reject) => {
      const updateQuery = `
        UPDATE location
        SET name = ?, floor = ?, storage_zone = ?, max_sku_capacity = ?, mixed_expiry_count = ?,
        location_status = ?, inbound_enabled = ?, outbound_enabled = ?,
        width = ?, height = ?, depth = ?
        WHERE code = ?`;
      product_db.query(updateQuery, [
            name, floor, storage_zone, max_sku_capacity, mixed_expiry_count, location_status,
            inbound_enabled, outbound_enabled, width, height, depth, code
        ], (err, result) => {
          if (err) {
              console.error('로케이션업데이트 쿼리 오류:', err);
              reject(err);
          } else {
              console.log('로케이션 업데이트 성공');
              resolve(result);
          }
      });
  });
};


/*
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
*/

module.exports = { location };
