const express = require("express")
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn , isReviewAuthor } = require("../middleware.js");

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400,error);
    } else {
        next();
    }
}



//post review route

// router.post("/", validateReview, wrapAsync(async(req,res) =>{
//     let listing = await Listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();
//     req.flash("success","New review created!!");
//     res.redirect(`/listings/${listing._id}`)
// }));


router.post("/", validateReview, isLoggedIn, wrapAsync(async (req, res) => {
    console.log("req.params.id =", req.params.id);  
    let listing = await Listing.findById(req.params.id);
    console.log("listing =", listing);             
    
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    let newReview = new Review(req.body.review);
    console.log(newReview);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "New review created!!");

    res.redirect(`/listings/${listing._id}`);
}));


//delete review route
router.delete("/:reviewsId", wrapAsync(async (req,res) => {
    let {id, reviewsId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewsId}});
    await Review.findByIdAndDelete(reviewsId);

    req.flash("success"," Review deleted!!");
    res.redirect(`/listings/${id}`);
}))

module.exports = router;