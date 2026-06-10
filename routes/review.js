const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapsync.js");
const Review=require("../models/review.js");
const ExpressError= require("../utils/expresserror.js");
const Listing= require("../models/listing.js");
const {validateReview,isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");

//review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//delete route for review
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));
module.exports=router;