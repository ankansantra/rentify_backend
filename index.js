const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/", (req, res) => {
  res.send("Server is running!");
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Rentify"
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));
