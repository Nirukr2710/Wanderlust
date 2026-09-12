const OpenAI = require("openai");
const Listing = require("../models/listing");
const AiTrip = require("../models/aiTrip");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateTripItinerary(
    destination,
    days,
    budget,
    travelType,
    interests
) {
    const selectedInterests = Array.isArray(interests)
        ? interests.join(", ")
        : interests || "General sightseeing";

    const tripBudget = Number(budget);
    const tripDays = Number(days);

    const accommodationBudget = tripBudget * 0.50;

    const maxNightlyPrice = Math.floor(
        accommodationBudget / tripDays
    );

    let listings = await Listing.find({
        $and: [
            {
                $or: [
                    {
                        location: {
                            $regex: destination,
                            $options: "i"
                        }
                    },
                    {
                        country: {
                            $regex: destination,
                            $options: "i"
                        }
                    },
                    {
                        title: {
                            $regex: destination,
                            $options: "i"
                        }
                    }
                ]
            },
            {
                price: {
                    $lte: maxNightlyPrice
                }
            }
        ]
    }).limit(10);

    if (listings.length === 0) {
        listings = await Listing.find({
            $or: [
                {
                    location: {
                        $regex: destination,
                        $options: "i"
                    }
                },
                {
                    country: {
                        $regex: destination,
                        $options: "i"
                    }
                },
                {
                    title: {
                        $regex: destination,
                        $options: "i"
                    }
                }
            ]
        }).limit(10);
    }

    const listingData = listings.map(listing => ({
        id: listing._id.toString(),
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        country: listing.country,
        category: listing.category
    }));

    const prompt = `
You are an expert travel planner for Wanderlust.

Create a personalized travel itinerary.

Destination: ${destination}
Number of days: ${days}
Budget: ₹${budget}
Travel type: ${travelType}
Interests: ${selectedInterests}

Here are real accommodations available in the Wanderlust database:

${JSON.stringify(listingData, null, 2)}

IMPORTANT RULES FOR ACCOMMODATION RECOMMENDATION:

1. Only recommend a listing from the provided Wanderlust listings.
2. Never invent a listing name or listing ID.
3. Consider the listing's:
   - destination
   - price
   - category
   - description
   - travel type suitability
   - user's interests
4. Prefer listings whose category or description is relevant to the
   user's interests.
5. Prefer listings that fit within the user's budget.
6. If multiple listings are suitable, choose the single best match.
7. If no listing is suitable, return an empty string for recommendedListingId.
8. Do not claim facilities or features that are not present in the listing data.

INTEREST MATCHING GUIDANCE:

- Adventure → Mountains, Camping, Boats, or adventure-related descriptions.
- Beaches → coastal locations, Amazing Pool, Boats, or beach-related descriptions.
- Nature → Mountains, Camping, Farms, Arctic, Domes, or nature-related descriptions.
- History → Castles, Iconic Cities, or historically relevant descriptions.
- Shopping → Iconic Cities or locations/descriptions mentioning shopping.
- Food → locations/descriptions mentioning food or popular food areas.

TRAVEL TYPE GUIDANCE:

- Solo → convenient and practical stays.
- Couple → comfortable and suitable stays for couples.
- Family → practical and family-friendly stays.
- Friends → suitable stays for groups.

Create a realistic itinerary within the given budget.

For every day provide:
- places to visit
- activities
- food recommendations
- estimated daily budget
- travel tips

Also provide the total estimated budget.

BUDGET RULES:

1. The total of all daily budgets must not exceed the user's provided budget.
2. Keep the accommodation cost realistic based on the provided Wanderlust listing price.
3. Include food, local transportation, activities, and accommodation in the
   overall budget estimate.
4. Do not assign unrealistic daily spending.
5. The total estimated budget should be equal to or lower than the user's
   provided budget.
6. Make sure the sum of all daily budgets is consistent with totalBudget.

If a suitable Wanderlust listing is available, mention its exact title naturally.

Do not invent Wanderlust listing names.

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.
`;

    const response = await client.responses.create({
        model: "gpt-5.6-luna",
        input: prompt,
        text: {
            format: {
                type: "json_schema",
                name: "travel_itinerary",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        destination: {
                            type: "string"
                        },
                        totalBudget: {
                            type: "number"
                        },
                        recommendedListingId: {
                            type: "string"
                        },
                        days: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    day: {
                                        type: "number"
                                    },
                                    places: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        }
                                    },
                                    activities: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        }
                                    },
                                    food: {
                                        type: "array",
                                        items: {
                                            type: "string"
                                        }
                                    },
                                    budget: {
                                        type: "number"
                                    },
                                    tips: {
                                        type: "string"
                                    }
                                },
                                required: [
                                    "day",
                                    "places",
                                    "activities",
                                    "food",
                                    "budget",
                                    "tips"
                                ],
                                additionalProperties: false
                            }
                        }
                    },
                    required: [
                        "destination",
                        "totalBudget",
                        "recommendedListingId",
                        "days"
                    ],
                    additionalProperties: false
                }
            }
        }
    });

    const itinerary = JSON.parse(
        response.output_text
    );

    const recommendedListing = listings.find(
        listing =>
            listing._id.toString() ===
            itinerary.recommendedListingId
    );

    return {
        itinerary,
        listings,
        recommendedListing
    };
}


// Show AI Trip Planner
module.exports.showTripPlanner = (req, res) => {
    res.render("ai/trip-planner");
};

module.exports.planTrip = async (req, res) => {
    try {
        const {
            destination,
            days,
            budget,
            travelType,
            interests
        } = req.body;

        // Validate user input
if (!destination || !destination.trim()) {
    return res.status(400).send("Destination is required.");
}

if (!days || Number(days) < 1 || Number(days) > 30) {
    return res.status(400).send(
        "Number of days must be between 1 and 30."
    );
}

if (!budget || Number(budget) < 1000) {
    return res.status(400).send(
        "Budget must be at least ₹1,000."
    );
}

if (!travelType) {
    return res.status(400).send(
        "Please select a travel type."
    );
}

        console.log("Destination:", destination);
        console.log("Days:", days);
        console.log("Budget:", budget);
        console.log("Travel Type:", travelType);
        console.log("Interests:", interests);

        const result = await generateTripItinerary(
            destination,
            days,
            budget,
            travelType,
            interests
        );

        console.log("Generated itinerary:");
        console.log(result.itinerary);

        res.render("ai/result", {
            itinerary: result.itinerary,
            listings: result.listings,
            recommendedListing: result.recommendedListing,
            tripDetails: {
                destination,
                days,
                budget,
                travelType,
                interests: Array.isArray(interests)
                    ? interests
                    : interests
                        ? [interests]
                        : []
            }
        });

   } catch (error) {

    console.error("AI ERROR:", error);

    res.status(500).render("ai/error", {
        message: "Something went wrong while generating your trip."
    });

}
};


                                  
// Save AI Trip
module.exports.saveTrip = async (req, res) => {

    try {

        const {
            destination,
            days,
            budget,
            travelType,
            interests,
            itinerary,
            recommendedListing
        } = req.body;


        if (!req.user) {
            return res.redirect("/login");
        }


        const savedTrip = new AiTrip({
    user: req.user._id,
    destination: destination,
    days: Number(days),
    budget: Number(budget),
    travelType: travelType,
    interests: interests
        ? JSON.parse(interests)
        : [],
    itinerary: JSON.parse(itinerary),
    recommendedListing: recommendedListing || undefined
});

        await savedTrip.save();


        console.log("AI Trip saved:", savedTrip._id);


        res.redirect("/ai/my-trips");


    } catch (error) {

        console.error("SAVE TRIP ERROR:", error);

        res.status(500).send(
            "Something went wrong while saving your trip."
        );

    }

};
// Show Saved AI Trips
module.exports.myTrips = async (req, res) => {

    try {

        if (!req.user) {
            return res.redirect("/login");
        }

        const trips = await AiTrip.find({
            user: req.user._id
        })
        .populate("recommendedListing")
        .sort({ createdAt: -1 });

        res.render("ai/my-trips", {
            trips
        });

    } catch (error) {

        console.error("MY TRIPS ERROR:", error);

        res.status(500).send(
            "Something went wrong while loading your trips."
        );

    }

};
// Show One Saved AI Trip
module.exports.viewTrip = async (req, res) => {

    try {

        if (!req.user) {
            return res.redirect("/login");
        }

        const trip = await AiTrip.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate("recommendedListing");

        if (!trip) {
            return res.status(404).send(
                "Saved trip not found."
            );
        }

        res.render("ai/view-trip", {
            trip
        });

    } catch (error) {

        console.error("VIEW TRIP ERROR:", error);

        res.status(500).send(
            "Something went wrong while loading your trip."
        );

    }

};
// Delete Saved AI Trip
module.exports.deleteTrip = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }

        const deletedTrip = await AiTrip.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!deletedTrip) {
            return res.status(404).send("Saved trip not found.");
        }

        console.log("AI Trip deleted:", deletedTrip._id);

        res.redirect("/ai/my-trips");

    } catch (error) {
        console.error("DELETE TRIP ERROR:", error);

        res.status(500).send(
            "Something went wrong while deleting your trip."
        );
    }
};
// Show Edit Saved AI Trip Page
module.exports.editTrip = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }

        const trip = await AiTrip.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!trip) {
            return res.status(404).send(
                "Saved trip not found."
            );
        }

        res.render("ai/edit-trip", {
            trip
        });

    } catch (error) {
        console.error("EDIT TRIP ERROR:", error);

        res.status(500).send(
            "Something went wrong while loading the edit page."
        );
    }
};
// Update Saved AI Trip
module.exports.updateTrip = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }

        const {
            destination,
            days,
            budget,
            travelType,
            interests
        } = req.body;

        console.log("Updating AI Trip...");
        console.log("Destination:", destination);
        console.log("Days:", days);
        console.log("Budget:", budget);
        console.log("Travel Type:", travelType);
        console.log("Interests:", interests);

        const selectedInterests = Array.isArray(interests)
            ? interests
            : interests
                ? [interests]
                : [];

          // Validate updated trip details
if (!destination || !destination.trim()) {
    return res.status(400).send(
        "Destination is required."
    );
}

if (!days || Number(days) < 1 || Number(days) > 30) {
    return res.status(400).send(
        "Number of days must be between 1 and 30."
    );
}

if (!budget || Number(budget) < 1000) {
    return res.status(400).send(
        "Budget must be at least ₹1,000."
    );
}

if (!travelType) {
    return res.status(400).send(
        "Please select a travel type."
    );
}      

        // Generate a completely new itinerary
        const result = await generateTripItinerary(
            destination,
            Number(days),
            Number(budget),
            travelType,
            selectedInterests
        );

        // Update the saved trip
        const updatedTrip = await AiTrip.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            {
                destination: destination,
                days: Number(days),
                budget: Number(budget),
                travelType: travelType,
                interests: selectedInterests,
                itinerary: result.itinerary,
                recommendedListing: result.recommendedListing
                    ? result.recommendedListing._id
                    : undefined
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTrip) {
            return res.status(404).send(
                "Saved trip not found."
            );
        }

        console.log(
            "AI Trip updated:",
            updatedTrip._id
        );

        res.redirect(
            `/ai/my-trips/${updatedTrip._id}`
        );

    } catch (error) {
        console.error("UPDATE TRIP ERROR:", error);

        res.status(500).send(
            "Something went wrong while updating your trip."
        );
    }
};