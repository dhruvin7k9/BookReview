require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require("path");
const JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const db = require("./databaseConnection.js");

const Users = require('./models/User.js');
const userRouter = require("./routes/userRoutes.js");
const bookRouter = require("./routes/bookRoutes.js");
const reviewRouter = require("./routes/reviewRoutes.js");

const PORT = process.env.PORT || 80

// DB connection
db.connect();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({limit: "50mb"}))
app.use(bodyParser.urlencoded({ extended : true, limit: "50mb"}))

// Headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
    res.header("Access-Control-Allow-Credentials", true);
    next()
})

// Passport middleware
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
        try {
            const user = await Users.findOne({ _id: jwt_payload.identifier });
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        } catch (err) {
            return done(err, false);
        }
    })
);

// Cors
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    origin: process.env.CLIENT_URL
}));

// API routes
app.use('/auth', userRouter);
// app.use("/reviews", reviewRouter);
// app.use("/book", bookRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});