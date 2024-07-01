const express = require('express');
const router = express.Router();
const Books = require('../models/Book.js');

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const books = await Books.find().skip(skip).limit(size);
    res.status(200).send(books);
});

// GET "http://<ip>/books/search?title=Harry Potter"
router.get('/search', async (req, res) => {
    const title = req.query.title;
    const books = await Books.find({ title: { $regex: title, $options: 'i' } });
    res.status(200).send(books);
});

// GET "http://<ip>/books/filter?author=J.K. Rowling&publish_year=2005"
router.get('/filter', async (req, res) => {
    const author = req.query.auther;
    const publish_year = req.query.publish_year;
    const books = await Books.find({ author: author, publish_year: publish_year });
    res.status(200).send(books);
});

// GET "http://<ip>/books/sort?attribute=title"
router.get('/sort', async (req, res) => {
    const attribute = req.query.attribute;
    const books = await Books.find().sort(attribute);
    res.status(200).send(books);
});

module.exports = router;