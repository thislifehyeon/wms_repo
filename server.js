const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require("dotenv").config();
console.log("DB_NAME:", process.env.DATABASE_NAME);

const port = 3000;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

const { handleIpgoRequest } = require('./controller/ipgoHandler');
const { getStatus } = require('./controller/getstatus')
const { getProductmaster } = require('./controller/get_product_master')
const { product_truncate } = require('./controller/product_truncate')
const { search_code } = require('./controller/searchcode')
const { search_code_stock } = require('./controller/searchcode_stock')
const { exp_change } = require('./controller/exp_change')
const { getlocation } = require('./controller/getlocation')
const { visit } = require('./controller/visit')
const { update_location } = require('./controller/update_Location')
const { delete_location } = require('./controller/delete_Location')
const { create_location } = require('./controller/create_Location')


app.post("/api/visit", visit);

app.post("/api/ipgo", handleIpgoRequest);
app.post("/api/searchcode", search_code);
app.post("/api/searchcode_stock", search_code_stock);
app.post("/api/exp_change", exp_change);
app.post("/api/update_location", update_location);
app.post("/api/create_location", create_location);

app.get('/api/getstatus', getStatus);
app.get('/api/product_truncate', product_truncate);
app.get('/api/getProductMaster', getProductmaster);
app.get('/api/getlocation', getlocation);

app.delete('/api/delete_location/:code', delete_location);


app.get('/', (req, res) => {
  res.send('WMS_SERVER');
});




app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
