const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const Booking = require("../models/bookingModel");
const createToken = require("../utils/createToken");
const errorHandler = require("../middleware/errorHandler");
const jwt = require("jsonwebtoken");

const registerUser = errorHandler(async (req, res) => {
  const { username, email, password, isAdmin } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill all the input fields" });
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid email" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userData = {
    username,
    email,
    password: hashedPassword,
    isAdmin,
  };

  try {
    const newUser = new User(userData);
    await newUser.save();
    createToken(res, newUser._id);

    return res.status(201).json({
      success: true,
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: isAdmin ? "admin" : "user",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid user data" });
  }
});

const login = errorHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    console.log("Login attempt with non-existent email:", email);
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = createToken(res, user._id);

  return res.status(200).json({
    success: true,
    _id: user._id,
    username: user.username,
    email: user.email,
    token,
  });
});

const logout = errorHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = errorHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

const getCurrentUserProfile = errorHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User does not exist" });
  }

  const userBookings = await Booking.find({ userId: req.user._id })
    .populate({
      path: "eventId",
      select: "eventName eventDate address", // Populate event details
    })
    .exec();

  console.log({ "Bookings: ": userBookings });

  const confirmedBookings = userBookings.filter(
    (booking) => booking.status === "booked"
  );

  const waitingBookings = userBookings.filter(
    (booking) => booking.status === "waiting"
  );

  console.log({ "waiting Book": waitingBookings });
  const waitingListEvents = await Event.find({
    _id: { $in: waitingBookings.map((booking) => booking.eventId) },
  }).select("eventName eventDate address");

  const responseData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    confirmedBookings,
    waitingList: waitingListEvents,
  };

  res.json(responseData);
});

module.exports = {
  registerUser,
  login,
  logout,
  getAllUsers,
  getCurrentUserProfile,
};
