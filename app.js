const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const rateRoutes = require('./routes/rate');

require('dotenv').config()

const uri = process.env.DB_URI;
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

// app.use('/', (req, res, next) => {
//     return res.status(200).json({
//         message: 'hello'
//     })
// })
app.use('/uploads', express.static('uploads'))
app.use('/user', userRoutes);
app.use('/recipe', recipeRoutes);
app.use('/rate', rateRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;