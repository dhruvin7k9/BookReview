const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    book_id : {
        type: String,
        required: true
    },
    title : {
        type: String,
        required: true
    },
    auther : {
        type: String
    },
    publish_year : {
        type: Number
    },
    editions : {
        type: Number
    }
});

module.exports = mongoose.model('Book', bookSchema);