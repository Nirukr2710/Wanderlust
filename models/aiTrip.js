const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const aiTripSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    destination: {
        type: String,
        required: true
    },

    days: {
        type: Number,
        required: true
    },

    budget: {
        type: Number,
        required: true
    },

    travelType: {
        type: String,
        required: true
    },

    interests: [{
        type: String
    }],

    itinerary: {
        type: Schema.Types.Mixed,
        required: true
    },

    recommendedListing: {
        type: Schema.Types.ObjectId,
        ref: "Listing"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("AiTrip", aiTripSchema);