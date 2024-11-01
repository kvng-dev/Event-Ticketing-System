const bcrypt = require("bcrypt");
const validator = require("validator");
const Event = require("../models/eventModel");
const createToken = require("../utils/createToken");
const errorHandler = require("../middleware/errorHandler");
const User = require("../models/userModel");

const createEvent = errorHandler(async (req, res) => {
  const {
    eventName,
    address,
    eventDate,
    price,
    desc,
    capacity,
    currentBookings,
    status,
  } = req.body;

  if (
    !eventName ||
    !address ||
    !eventDate ||
    !price ||
    !desc ||
    !capacity ||
    !currentBookings
  ) {
    return res.status(400).json({ message: "Please fill in all the inputs" });
  }

  if (
    !validator.isNumeric(price.toString()) ||
    !validator.isNumeric(capacity.toString())
  ) {
    return res
      .status(400)
      .json({ error: "Price and capacity should be valid numbers." });
  }

  const newEvent = new Event({
    eventName,
    address,
    eventDate,
    price,
    desc,
    capacity,
    currentBookings,
    status,
    createdBy: req.user._id,
  });

  await newEvent.save();

  res.status(201).json(newEvent);
});

const getAllEvents = errorHandler(async (req, res) => {
  const events = await Event.find({});

  res.status(200).json(events);
});

const bookEvent = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user._id;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (event.status === "cancelled") {
    return res.status(404).json({ message: "Event has been cancelled" });
  }

  if (event.currentBookings >= event.capacity) {
    return res.status(400).json({ message: "Event is fully booked" });
  }

  const user = await User.findById(userId);
  if (user.eventsBooked.includes(eventId)) {
    return res
      .status(400)
      .json({ message: "You have already booked this event" });
  }

  event.currentBookings += 1;
  await event.save();

  await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { eventsBooked: eventId },
    },
    { new: true }
  );

  return res.status(200).json({ message: "Event booked successfully", event });
});

const updatEvent = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;
  const userId = req.user._id;
  const updatedDate = req.body;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (event.createdBy.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "You are not authorized to update this event" });
  }

  Object.assign(event, updatedDate);

  await event.save();

  res.status(200).json(event);
});

const deleteEvent = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findByIdAndDelete(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.status(200).json({ message: "Event Deleted successfully", event });
});

const getEventById = errorHandler(async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.status(200).json(event);
});

module.exports = {
  createEvent,
  getAllEvents,
  bookEvent,
  updatEvent,
  deleteEvent,
  getEventById,
};
