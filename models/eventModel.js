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
    default: 0,
  },
  desc: {
    type: String,
    required: true,
  },
  totalTickets: {
    type: Number,
    default: 0,
  },
  availableTickets: {
    type: Number,
    required: true,
  },
  bookings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      bookedAt: { type: Date, default: Date.now },
    },
  ],
  waitingList: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      addedAt: { type: Date, default: Date.now },
    },
  ],
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
