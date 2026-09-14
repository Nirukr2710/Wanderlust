# Wanderlust 🌍

Wanderlust is a travel website where users can explore different places, find stays, make bookings and share reviews.

I built this project using Node.js, Express, MongoDB and EJS. I also added an AI Trip Planner that creates a travel plan based on the user's destination, budget, number of days, travel type and interests.

## 🌐 Live Website

https://wanderlust-9vv1.onrender.com

## Features

- User signup and login
- Explore different listings
- View listing details
- Add listings to wishlist
- Book a listing
- Add reviews and ratings
- Manage bookings
- AI Trip Planner
- Save AI generated trips
- Edit and delete saved AI trips
- Recommend a suitable stay from the available listings

## AI Trip Planner 🤖

The AI Trip Planner asks the user for:

- Destination
- Number of days
- Budget
- Travel type
- Interests

After submitting the details, it generates an itinerary with:

- Places to visit
- Activities
- Food suggestions
- Daily budget
- Travel tips
- Total estimated budget

It also checks the listings in the Wanderlust database and recommends a suitable accommodation.

## Technologies Used

- HTML
- CSS
- JavaScript
- Bootstrap
- EJS
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- OpenAI API
- Cloudinary
- Render

## Project Structure

```text
Wanderlust/
│
├── controllers/
├── models/
├── routes/
├── views/
├── public/
│   ├── css/
│   └── js/
│
├── app.js
├── middleware.js
├── cloudConfig.js
├── schema.js
├── package.json
└── README.md
