//this for register/login/me

const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../utils/validation");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, name, role, location, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      role,
      location,
      phone,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "The email or password you entered is incorrect" });
    }

    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "The email or password you entered is incorrect" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
    console.log(error);
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    location: req.user.location,
    phone: req.user.phone,
    bio: req.user.bio,
    isAdmin: req.user.isAdmin,
  });
});

// request reset password
router.post("/forgotpassword", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ error: "Email tidak terdaftar" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://127.0.0.1:3000/petsinbali/frontend/pages/reset-password.html?token=${resetToken}`;
    const message = `Halo ${user.name},\n\nKamu meminta reset password. Klik link ini:\n\n${resetUrl}\n\nLink kadaluarsa dalam 10 menit.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password Token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ error: "Email could not be sent" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// reset password (update)
router.put("/resetpassword/:resettoken", async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid token or token expired" });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, data: "Password updated success!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
