const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapsync.js");
const Listing= require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });
//
const User = require("../models/user");
//
//composed
router
.route("/")
//index
.get(wrapAsync(listingController.index))
//create
.post( isLoggedIn,upload.single(`listing[image]`),validateListing,wrapAsync(listingController.createListing));
//new 
router.get("/new",isLoggedIn,listingController.renderNewForm);

//filter
router.get("/category/:category", async(req,res)=>{
    const { category } = req.params;

    const allListings = await Listing.find({
        category: category
    });

    res.render("listings/index.ejs",{ allListings });
});
// search
router.get("/search", async (req, res) => {
    const { q } = req.query;

   const allListings = await Listing.find({
    $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } }
    ]
});

    res.render("listings/index", { allListings });
});
// search
router.get("/search", async (req, res) => {
    let { q } = req.query;

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index", { allListings });
});
//wishlist save
router.post("/:id/wishlist", isLoggedIn, async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if(!user.wishlist.includes(listing._id)){
        user.wishlist.push(listing._id);
        await user.save();
    }

    req.flash("success","Added to Wishlist");
    res.redirect(`/listings/${listing._id}`);
});
//wishlist page
router.get("/wishlist", isLoggedIn, async(req,res)=>{
    const user = await User.findById(req.user._id)
        .populate("wishlist");

    res.render("users/wishlist", {
        listings: user.wishlist
    });
});
//delete wishlist
router.delete("/:id/wishlist", isLoggedIn, async (req, res) => {
    const { id } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
        $pull: { wishlist: id }
    });

    req.flash("success", "Removed from wishlist");
    res.redirect("/listings/wishlist");
});
//composed
router
.route("/:id")
//show
.get(isLoggedIn, wrapAsync(listingController.showListing))
//update
.put(isLoggedIn,isOwner,upload.single(`listing[image]`),validateListing, wrapAsync(listingController.updateListing))
//delete
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));
//edit
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


module.exports=router;