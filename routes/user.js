const express = require("express")
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req,res) => {
    res.render("users/signup.ejs");
})


router.post("/signup", wrapasync(async(req,res) => {
    try{
        let {username, email , password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser,(err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "welcome to wanderlust");
            res.redirect("/listings");
        })
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup")
    }
}));

router.get("/login", async(req, res) => {
    res.render("users/login.ejs");
})

router.post("/login",saveRedirectUrl ,passport.authenticate("local" , { failureRedirect: '/login', failureFlash : true }) , async (req,res) => {
    req.flash("success", "Welcome back to wanderlust!");
    // res.redirect("/listings");
    res.redirect(res.locals.redirectUrl || "/listings"); // fallback so it never crashes
})

router.get("/logOut", (req,res ,next) => {
    req.logOut((err) => {
        if(err){
           return next(err);
        }
        req.flash ("success", "you are logged out now!");
        res.redirect("/listings");
    })
})

module.exports = router;