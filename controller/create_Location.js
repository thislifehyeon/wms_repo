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
  console.log('create_location_controller _ MySQL database connected');
});


const create_location = async (req, res) => {
  try {
      const editLocation = req.body;

      //생성할 이름, 코드로 검색 하나라도 겹치면 안됨.
      const nameData = await getLocationByCodeOrName(editLocation.code, editLocation.name);
      
      if (nameData.length == 0) {
        console.log("origindata : ", nameData);
        await insertLocation(editLocation);
        return res.status(200).json({ message: '로케이션 생성 성공' });
      }
      else{
        return res.status(500).json({ message: '이미 존재하는 코드/이름입니다. \n 다른 코드/이름을 사용해주세요.' });
      }
  } catch (error) {
      console.error('Error handling exp_change request:', error);
      return res.status(500).json({ error: '서버 오류: 데이터를 처리하는 중에 오류가 발생했습니다.' });
  }
};

const getLocationByCodeOrName = (code, name) => {
    return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM location WHERE code = ? OR name = ?`;
        product_db.query(selectQuery, [code, name], (err, results) => {
            if (err) {
                console.error('code or name select 쿼리 오류:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
  };

const insertLocation = (editLocation) => {
  return new Promise((resolve, reject) => {
      const insertQuery = `
      INSERT INTO location (code, name, floor, storage_zone, max_sku_capacity, mixed_expiry_count, location_status, inbound_enabled, outbound_enabled, width, height, depth, editable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      product_db.query(insertQuery, [editLocation.code, editLocation.name, editLocation.floor, editLocation.storage_zone, editLocation.max_sku_capacity, editLocation.mixed_expiry_count,
        editLocation.location_status, editLocation.inbound_enabled, editLocation.outbound_enabled, editLocation.width, editLocation.height, editLocation.depth, 1], (err, result) => {
          if (err) {
              console.error(' location insert 쿼리 오류:', err);
              reject(err);
          } else {
              console.log('데이터 생성 성공');
              resolve(result);
          }
      });
  });
};


module.exports = { create_location };