require('dotenv').config();
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const JwtStrategy = require("passport-jwt").Strategy,
	ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const db = require("./databaseConnection.js");

const Users = require('./models/User.js');
const Books = require('./models/Book.js');
const userRouter = require("./routes/userRoutes.js");
const bookRouter = require("./routes/bookRoutes.js");
const reviewRouter = require("./routes/reviewRoutes.js");
const { default: axios } = require('axios');

const PORT = process.env.PORT || 80

// DB connection
db.connect();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))

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
app.use("/reviews", reviewRouter);
app.use("/book", bookRouter);


// Web scraping
async function webScrapping() {
	try {
		const { data } = await axios.get(process.env.SCRAP_URL);
		const arrayobjects = Object.values(data.works);
		const books = [];
		
		// limit number of items stored in the database
		let limit = Math.min(50, arrayobjects.length);
		for (let i = 0; i < limit; i++) {
			let name = arrayobjects[i].author_name[0];
			const book = {
				book_id: arrayobjects[i].key.slice(7),
				title: arrayobjects[i].title,
				author: name.split(" ").slice(0, 2).join(" "),
				publish_year: arrayobjects[i].first_publish_year,
				editions: arrayobjects[i].edition_count
			}
			books.push(book);
		}

		// Store the scraped data in the database
		const storeBooks = async (books) => {
			for (const book of books) {
				await Books.updateOne({ book_id: book.book_id }, { $set: book }, { upsert: true });
			}
		};

		await storeBooks(books);

	} catch (error) {
		console.error('Error calling route:', error);
	}
}

// Call the route every 24 hours
// Implement a scheduler to run the web scraper periodically (e.g., every day) to update the book data in the database.
setInterval(webScrapping, 24 * 60 * 60 * 1000);

// Call the function on server start
webScrapping();

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});