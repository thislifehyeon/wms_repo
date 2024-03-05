const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();
console.log("DB_NAME:", process.env.DATABASE_NAME);

const port = 4000;
const app = express();

app.use(bodyParser.json());
app.use(cors());

const { handleIpgoRequest } = require('./controller/ipgoHandler');
const { getStatus } = require('./controller/getstatus')
const { getProductmaster } = require('./controller/get_product_master')
const { product_truncate } = require('./controller/product_truncate')
const { search_code } = require('./controller/searchcode')
const { search_code_stock } = require('./controller/searchcode_stock')
const { exp_change } = require('./controller/exp_change')
const { getlocation } = require('./controller/getlocation')



app.post("/api/ipgo", handleIpgoRequest);
app.post("/api/searchcode", search_code);
app.post("/api/searchcode_stock", search_code_stock);
app.post("/api/exp_change", exp_change);


app.get('/api/getstatus', getStatus);
app.get('/api/product_truncate', product_truncate);
app.get('/api/getProductMaster', getProductmaster);
app.get('/api/getlocation', getlocation);


app.get('/', (req, res) => {
  res.send('WMS_SERVER');
});




app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
