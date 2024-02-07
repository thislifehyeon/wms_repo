const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const port = 4000;
const app = express();

app.use(bodyParser.json());
app.use(cors());

const { handleIpgoRequest } = require('./controller/ipgoHandler');
const { getStatus } = require('./controller/getstatus')
const { getProductmaster } = require('./controller/get_product_master')
const { product_truncate } = require('./controller/product_truncate')



app.post("/api/ipgo", handleIpgoRequest);

app.get('/api/getstatus', getStatus);
app.get('/api/product_truncate', product_truncate);
app.get('/api/getProductMaster', getProductmaster);



app.get('/', (req, res) => {
  res.send('WMS_SERVER');
});




app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
