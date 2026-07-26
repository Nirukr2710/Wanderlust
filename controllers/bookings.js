const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(checkIn) < today) {
    req.flash("error", "Check-in date cannot be in the past.");
    return res.redirect(`/listings/${id}`);
   }
   if (new Date(checkOut) <= new Date(checkIn)) {
    req.flash("error", "Check-out date must be after the check-in date.");
    return res.redirect(`/listings/${id}`);
   }


    const listing = await Listing.findById(id);
    
    for (let existingBooking of listing.bookings) {

    if (
        new Date(checkIn) < existingBooking.checkOut &&
        new Date(checkOut) > existingBooking.checkIn
    ) {
        req.flash(
            "error",
            "This listing is already booked for the selected dates."
        );
        return res.redirect(`/listings/${id}`);
    }

    }

    const booking = new Booking({
        user: req.user._id,
        listing: id,
        checkIn,
        checkOut,
        guests,
    });

    await booking.save();

    listing.bookings.push(booking);
    await listing.save();

    req.flash("success", "Booking Confirmed!");
    res.redirect(`/listings/${id}`);
};

module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({
        user: req.user._id,
    }).populate("listing");

    res.render("bookings/index", { bookings });
};
module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    await Listing.findByIdAndUpdate(
        booking.listing,
        {
            $pull: {
                bookings: bookingId,
            },
        }
    );

    await Booking.findByIdAndDelete(bookingId);

    req.flash("success", "Booking Cancelled Successfully!");

    res.redirect("/bookings");
};
module.exports.hostBookings = async (req, res) => {

    const listings = await Listing.find({
        owner: req.user._id,
    }).populate({
        path: "bookings",
        populate: [
            {
                path: "user",
            },
            {
                path: "listing",
            },
        ],
    });

    res.render("bookings/host", { listings });

};