const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateToken = async (user) => {
    
    const token = jwt.sign(
        {identifier: user._id},
        process.env.JWT_SECRET,
    );
    return token;
};