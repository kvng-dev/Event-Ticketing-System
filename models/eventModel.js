const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  eventDate: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  currentBookings: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["approved", "cancelled"],
    default: "approved",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

eventSchema.pre("save", function (next) {
  if (this.currentBookings > this.capacity) {
    return next(new Error("Current bookings cannot exceed capacity."));
  }
  next();
});

eventSchema.methods.addBooking = function (number) {
  if (this.currentBookings + number > this.capacity) {
    throw new Error("Cannot add bookings beyond capacity.");
  }
  this.currentBookings += number;
};

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
