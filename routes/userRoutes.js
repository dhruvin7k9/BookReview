const express = require('express');
const bcrypt = require("bcrypt");
const generateToken = require('../helpers.js').generateToken;
const Users = require('../models/User.js');
const saltRounds = 10
const router = express.Router();

// signup
router.post('/signup', async (req, res) => {
    let { username, email, password } = req.body;
    try {
        const existinguser = await Users.findOne({ email: email });
        if (existinguser) {
            return res.status(400).send("User already exists");
        }

        let user;
        bcrypt.hash(password, saltRounds).then(async hash => {
                user = await Users.create({ email: email, username: username, password: hash });
            })
            .catch(err => console.error(err.message));
        
        const token = await generateToken(user);

        res.status(201).cookie("token", token).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// login
router.get('/login', async (req, res) => {
    let { email, password } = req.body;
    try {
        const existinguser = await Users.findOne({ email: email });
        if (!existinguser) {
            return res.status(400).send("User does not exist");
        }
        const match = await bcrypt.compare(password, existinguser.password);
        if (!match) {
            return res.status(400).send("Invalid credentials");
        }

        const token = await getToken(existinguser);

        res.status(200).cookie("token", token).send(existinguser);
    } catch (error) {
        res.status(400).send(error);
    }
});

// logout
router.post('/logout', async (req, res) => {
    return res.clearCookie("token").send("Logged out");
});

module.exports = router;