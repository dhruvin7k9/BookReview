const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    book_id : {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('Book', bookSchema);