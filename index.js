const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// CLIENT_ORIGIN is a comma-separated allowlist (see .env.example). Falls back to
// allow-all only when it's unset, so local dev without a .env keeps working.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(bodyParser.json());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

// connecting with database
require('./db/connection')



  

// geeting all rquests 
app.use(require('./router/addProduct'));
app.use(require('./router/editProduct'));
app.use(require('./router/deleteProduct'));


app.use(require('./router/sendEmail'));
app.use(require('./router/signup'));
app.use(require('./router/login'));
app.use(require('./router/logout'));
app.use(require('./router/forgotPassword'));

app.use(require('./router/userDetails'));

app.use(require('./router/addToCart'));
app.use(require('./router/addToWhilist'));

app.use(require('./router/getSearchedProducts'));
app.use(require('./router/selectedProductsDetails'));
app.use(require('./router/checkForPincode'));
app.use(require('./router/trendingAndSpecialOffers'));

app.use(require('./router/rateProduct'));
app.use(require('./router/getReviews'));
app.use(require('./router/addressInfo'));
app.use(require('./router/order'));
app.use(require('./router/getAllOrdersForAdmin'));
app.use(require('./router/deliverProduct'));
app.use(require('./router/generateOrderId'));


const port = process.env.PORT || 8000;


app.listen(port,()=>{
    console.log(`the server is running at http://localhost:${port}`)
})