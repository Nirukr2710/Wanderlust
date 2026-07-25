//fr edit image of user profile
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });



const { isLoggedIn } = require("../middleware.js");
const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapsync = require("../utils/wrapsync");
const passport = require("passport");
const {saveRedirectUrl}= require("../middleware.js");
const userController=require("../controllers/users.js");
router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapsync(userController.signup));
 
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),userController.login);
 
router.get("/profile/edit", isLoggedIn, userController.renderEditProfile);
router.put("/profile",isLoggedIn,upload.single("profileImage"),userController.updateProfile);
router.get("/profile", isLoggedIn, userController.profile);
router.get("/logout",userController.logout);
module.exports=router;