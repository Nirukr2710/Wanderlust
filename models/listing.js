const mongoose = require("mongoose");
const review = require("./review.js");
const Schema= mongoose.Schema;
const listingSchema= new Schema({
    title:{
        type:String,
        required:true,
    },
    description: String,
    image:{
        url:String,
        filename:String
    //     filename:{
    //     type: String,
    //     default: "listingimage",
    // },
        
    //     url:{
    //         type:String,
    //         default:"//unsplashttps:h.com/photos/people-sit-at-tables-outside-a-parisian-restaurant-yzh7B-9sOhc",
    //     set:(v)=> v==="" ? "//unsplashttps:h.com/photos/people-sit-at-tables-outside-a-parisian-restaurant-yzh7B-9sOhc" : v,
    // },
},
    price: Number,
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
  },
//   category:{
//     type:String,
//     enum:["Mountains","Farm","Iconic cities","Castles","Amazing pool","Arctic"]
//   }
});
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await review.deleteMany({_id:{$in:listing.reviews}});
    }
});
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;

