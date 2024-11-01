const express = require("express");
const {
  getAllUsers,
  login,
  logout,
  registerUser,
  getCurrentUserProfile,
} = require("../controller/userController");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const userRoute = express.Router();

userRoute.post("/register", registerUser);
userRoute.post("/login", login);
userRoute.post("/logout", logout);

userRoute.route("/").get(authenticate, authorizeAdmin, getAllUsers);
userRoute.get("/profile", authenticate, getCurrentUserProfile);
module.exports = userRoute;
