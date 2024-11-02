const mongoose = require("mongoose"); // Import mongoose to use mongoose.isValidObjectId
const bcrypt = require("bcrypt");
const validator = require("validator");
const Event = require("../models/eventModel");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const errorHandler = require("../middleware/errorHandler");

const initializeEvent = errorHandler(async (req, res) => {
  const { eventName, address, eventDate, price, desc, totalTickets } = req.body;

  if (!eventName || !address || !eventDate || !price || !desc) {
    return res.status(400).json({ message: "Please fill in all the inputs" });
  }

  const existingEvent = await Event.findOne({ eventName, address });
  if (existingEvent) {
    return res.status(409).json({ message: "Event already exists." });
  }

  const newEvent = new Event({
    eventName,
    address,
    eventDate,
    price,
    desc,
    totalTickets,
    availableTickets: totalTickets,
  });

  await newEvent.save();
  res.status(201).json(newEvent);
});

const getAllEvents = errorHandler(async (req, res) => {
  const events = await Event.find({});
  res.status(200).json(events);
});

const bookTicket = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;

  if (!req.user || !req.user._id) {
    return res
      .status(403)
      .json({ error: "Unauthorized access. User not authenticated." });
  }

  const userId = req.user._id;

  if (!mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const user = await User.findById(userId);
  const existingBooking = await Booking.findOne({ eventId, userId });

  if (existingBooking) {
    return res
      .status(400)
      .json({ error: "User already booked for this event" });
  }

  if (event.availableTickets > 0) {
    event.availableTickets -= 1;
    event.bookings.push(userId);
    await event.save();

    const booking = new Booking({ eventId, userId, status: "booked" });
    await booking.save();

    user.bookings.push(booking._id);
    await user.save();

    res.status(201).json({ message: "Ticket booked successfully" });
  } else {
    event.waitingList.push(userId);
    await event.save();

    const booking = new Booking({ eventId, userId, status: "waiting" });
    await booking.save();

    res.status(201).json({ message: "Added to waiting list" });
  }
});

const cancelBooking = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  const booking = await Booking.findOne({ eventId, userId });
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  if (booking.status === "booked") {
    event.availableTickets += 1;
  } else if (booking.status === "waiting") {
    event.waitingList = event.waitingList.filter(
      (id) => id.toString() !== userId.toString()
    );
  }

  await Booking.deleteOne({ _id: booking._id });

  user.bookings = user.bookings.filter(
    (bookingId) => bookingId.toString() !== booking._id.toString()
  );
  await user.save();

  if (event.availableTickets > 0 && event.waitingList.length > 0) {
    const nextUserId = event.waitingList.shift();
    const newBooking = new Booking({
      eventId,
      userId: nextUserId,
      status: "booked",
    });
    await newBooking.save();

    const nextUser = await User.findById(nextUserId);
    if (nextUser) {
      nextUser.bookings.push(newBooking._id);
      await nextUser.save();
    }

    event.bookings.push(nextUserId);
    event.availableTickets -= 1;
  }

  await event.save();

  res.status(200).json({
    message: "Booking canceled",
    availableTickets: event.availableTickets,
    waitingListCount: event.waitingList.length,
  });
});

const getStatus = errorHandler(async (req, res) => {
  const { eventId } = req.params;
  if (!mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });

  res.status(200).json({
    availableTickets: event.availableTickets,
    waitingListCount: event.waitingList.length,
    bookingsCount: event.bookings.length,
  });
});

const removeEvent = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;

  if (!mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const event = await Event.findByIdAndDelete(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.status(200).json({ message: "Event Deleted successfully", event });
});

const getEventById = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;

  if (!mongoose.isValidObjectId(eventId)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.status(200).json(event);
});

module.exports = {
  initializeEvent,
  getAllEvents,
  bookTicket,
  cancelBooking,
  getStatus,
  removeEvent,
  getEventById,
};
