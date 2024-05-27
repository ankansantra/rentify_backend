const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const User = require("../models/User");

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/")); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
  },
});

const upload = multer({ storage });

/* USER REGISTER */
router.post("/register", upload.single("profileImage"), async (req, res) => {
  console.log("Register endpoint hit"); // Log when endpoint is hit

  try {
    /* Take all information from the form */
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    console.log("Request body:", req.body); // Log request body

    /* Validate phone number length */
    if (phoneNumber.length !== 10) {
      console.log("Invalid phone number length");
      return res.status(400).json({ message: "Phone number must be exactly 10 digits." });
    }

    /* The uploaded file is available as req.file */
    const profileImage = req.file;
    console.log("Uploaded file:", profileImage); // Log uploaded file

    if (!profileImage) {
      console.log("No file uploaded");
      return res.status(400).send("No file uploaded");
    }

    /* Path to the uploaded profile photo */
    const profileImagePath = profileImage.path;
    console.log("Profile image path:", profileImagePath); // Log image path

    /* Check if user exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(409).json({ message: "User already exists!" });
    }

    /* Hash the password */
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password:", hashedPassword); // Log hashed password

    /* Create a new User */
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      profileImagePath,
    });

    /* Save the new User */
    await newUser.save();
    console.log("New user created:", newUser); // Log new user creation

    /* Send a successful message */
    res.status(200).json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.log("Error:", err); // Log error
    res.status(500).json({ message: "Registration failed!", error: err.message });
  }
});

/* USER LOGIN*/
router.post("/login", async (req, res) => {
  try {
    /* Take the information from the form */
    const { email, password } = req.body;

    /* Check if user exists */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User doesn't exist!" });
    }

    /* Compare the password with the hashed password */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    /* Generate JWT token */
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;

    res.status(200).json({ token, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
