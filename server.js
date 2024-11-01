const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connecDB");
const userRoute = require("./routes/userRoute");
const eventRoute = require("./routes/eventRoute");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoute);
app.use("/api/event", eventRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

// Start the server unless in a test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`Server running on port: ${port}`));
}

module.exports = app;
