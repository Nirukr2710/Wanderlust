const { isLoggedIn } = require("../middleware");
const express = require("express");
const router = express.Router({ mergeParams: true });

const Booking = require("../models/booking");
const Listing = require("../models/listing");
const bookingController = require("../controllers/bookings");
router.get("/", isLoggedIn, bookingController.myBookings);
router.post("/", isLoggedIn, bookingController.createBooking);

router.delete(
    "/:bookingId",
    isLoggedIn,
    bookingController.cancelBooking
);
router.get(
    "/host",
    isLoggedIn,
    bookingController.hostBookings
);
module.exports = router;