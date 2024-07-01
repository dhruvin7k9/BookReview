const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGO_URI;
module.exports.connect = () => {
    mongoose.connect(url)
    .then((res) => console.log("Database connection successful!"))
    .catch((err) => console.log("Error : ", err))
}