const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware");
const aiController = require("../controllers/ai");

// Show AI Trip Planner
router.get("/trip-planner", aiController.showTripPlanner);

// Generate Trip
router.post("/plan-trip", aiController.planTrip);

// Save AI Trip
router.post("/save-trip", isLoggedIn, aiController.saveTrip);

// Show Saved AI Trips
router.get("/my-trips", isLoggedIn, aiController.myTrips);

// Edit Saved AI Trip
router.get("/my-trips/:id/edit", isLoggedIn, aiController.editTrip);

// View One Saved Trip
router.get("/my-trips/:id", isLoggedIn, aiController.viewTrip);

// Update Saved AI Trip
router.post("/my-trips/:id/update", isLoggedIn, aiController.updateTrip);;

// Delete Saved AI Trip
router.delete("/my-trips/:id", isLoggedIn, aiController.deleteTrip);

module.exports = router;