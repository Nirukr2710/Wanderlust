const User=require("../models/user");
module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
};
module.exports.signup=async (req,res,next) => {
    try{
    let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
    req.flash("success","welcome to wanderlust");
    res.redirect("/listings");
    });

    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};
module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
};
module.exports.login=async(req,res)=>{
    req.flash("success","welcome to wanderlust! You are logged in!");
     let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};
//profiles
module.exports.profile = async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate("wishlist");

    res.render("users/profile.ejs", { user });
};
module.exports.renderEditProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/editProfile.ejs", { user });
};

module.exports.updateProfile = async (req, res) => {

    const { username, email } = req.body;

    const user = await User.findById(req.user._id);

    user.username = username;
    user.email = email;

    if (req.file) {
        user.profileImage = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await user.save();

    req.flash("success", "Profile updated successfully!");

    res.redirect("/profile");
};
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/listings");

    });
};
