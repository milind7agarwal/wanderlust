const express = require("express")
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} =require("../middleware.js");



const multer  = require('multer');
const {storage} = require("../cloudConfig.js")//LET'S SEE  .... {C/c}
const upload = multer({ storage })


const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400,error);
    } else {
        next();
    }
}

async function geocodeLocation(location, country) {
  const query = encodeURIComponent(`${location}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (!data.length) throw new Error("Location not found");

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}


//index roote
router.get("/", validateListing, wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", {allListings});
}));

//new route

router.get("/new", isLoggedIn, (req , res) => {
    res.render("new.ejs");
});

// show route

router.get("/:id", validateListing, wrapAsync( async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author"}}).populate("owner");
    if(!listing) {
        req.flash("error","Listing does not exists");
        res.redirect("/listings");
    }
    
    console.log("shown here", listing)
    res.render("show.ejs", {listing});
}));

// create route

router.post("/",isLoggedIn, upload.single('listing[image]'),validateListing ,wrapAsync( async (req,res,next) => {
        let url = req.file.path;
        let filename = req.file.filename;
        // Extract user input
        const { location, country } = req.body.listing;

        // Convert to lat/lng using your helper
        const coords = await geocodeLocation(location, country);

        const  newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        newListing.lat = coords.lat;
        newListing.lng = coords.lng;
        console.log(req.user);
        console.log(newListing);
        await newListing.save();
        req.flash("success","New listing created!!");
        res.redirect("/listings");
}));

// router.post("/" , , (req,res) => {
//     res.send(req.file); 
// })




//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
   if(!listing) {
        req.flash("error","Listing does not exists");
        res.redirect("/listings");
    }
    // let originalImageUrl = listing.image.url;
    // originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_100,w_110");
    res.render("edit.ejs", { listing });

}));

//Update Route

router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(async (req, res) => {
    if(!req.body.listing) {
        throw new ExpressError(400, "send valid data for listing");
    }
    let { id } = req.params;
    console.log(req.body);
    // let listing = await Listing.findById(id);
    // if(!listing.owner._id.equals(res.locals.currUser._id)){
    //     req.flash("error", "You don't have permision to edit");
    //     return res.redirect(`/listings/${id}`)
    // }
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!!");
    console.log(id, { ...req.body })
    res.redirect(`/listings/${id}`);
}));

//Delete route

router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!!");
    res.redirect("/listings")
}));

module.exports = router;
