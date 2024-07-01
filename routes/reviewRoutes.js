const express = require('express');
const router = express.Router();
const Reviews = require('../models/Review.js');
const passport = require("passport"); 

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const reviews = await Reviews.find().skip(skip).limit(size);
    res.status(200).send(reviews);
});

router.get('/:review_id', async (req, res) => {
    const review = await Reviews.findById(req.params.review_id);
    res.status(200).send(review);
});

router.post('/', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const user_id = req.user._id; // accessed without the need of req.body as it is stored in the token
    const { book_id, rating, comment } = req.body;
    const review = await Reviews.create({ book_id:book_id, rating:rating, comment:comment, user_id:user_id });
    res.status(201).send(review);
});

router.delete('/:review_id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    await Reviews.findByIdAndDelete(req.params.review_id);
    res.status(204).send();
});

router.put('/:review_id', passport.authenticate("jwt", { session: false }), async (req, res) => {
    const { rating, comment } = req.body;
    const review = await Reviews.findByIdAndUpdate(req.params.review_id, { rating:rating, comment:comment }, { new:true });
    res.status(200).send(review);
});

module.exports = router;