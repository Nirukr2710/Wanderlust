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
    bookings: [
    {
        type: Schema.Types.ObjectId,
        ref: "Booking",
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
category:{
    type:String,
    enum:[
        "Trending",
        "Room",
        "Iconic Cities",
        "Mountains",
        "Castles",
        "Amazing Pool",
        "Camping",
        "Farms",
        "Arctic",
        "Domes",
        "Boats"
    ]
},
});
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await review.deleteMany({_id:{$in:listing.reviews}});
    }
});
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;

