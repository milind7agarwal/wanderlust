if(process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema , reviewSchema} = require("./schema.js");
// const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js")


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require('console');

// let mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
let dbUrl = process.env.ATLASDB_URL;



main().then(() => {
    console.log("connected to db");
}).catch((err) =>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", () => {
    console.log("error in mongo session store", err)
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now()+1000*60*60*24*3,
        maxAge: 1000*60*60*24*3,
        httpOnly:true
    }
};

// app.get("/", (req, res) => {
//     console.log("hi , i am root ");
//     res.send("Hello! This is the root route.");
// });



app.use( session( sessionOptions ));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    console.log(res.locals.success)
    next();
})

// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username:"randy"
//     });
    
//     let registeredUser= await User.register(fakeUser, "helloWorld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);

// app.get("/testListing", async (req,res) =>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         image: "https://assets-news.housing.com/news/wp-content/uploads/2022/03/31010142/Luxury-house-design-Top-10-tips-to-add-luxury-to-your-house-FEATURE-compressed.jpg",
//         description: "By the beach ",
//         price: 2000,
//         location: "calangute, Goa",
//         country:"India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("sucessful testing")
// });

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page not found!"));
// })

// Catch-all for all unmatched routes
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});


app.use((err, req , res, next) => {
    let {statusCode= 5000 , message = "something went wrongx"} = err;
    // res.status(statusCode).send(message);
    res.render("error.ejs", { message, statusCode });
})


app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});


