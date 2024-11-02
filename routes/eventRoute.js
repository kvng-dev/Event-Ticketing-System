const express = require("express");
const {
  initializeEvent,

  cancelBooking,

  removeEvent,
  getEventById,
  bookTicket,
  getStatus,
  getAllEvents,
} = require("../controller/eventController");
const {
  authorizeAdmin,
  authenticate,
} = require("../middleware/authMiddleware");

const eventRoute = express.Router();

eventRoute.post("/initialize", authenticate, authorizeAdmin, initializeEvent);

eventRoute.get("/", getAllEvents);

eventRoute.post("/:id/book", authenticate, bookTicket);
eventRoute.post("/:id/cancel", authenticate, cancelBooking);
eventRoute.get("/status/:eventId", getStatus);

eventRoute
  .route("/:id")
  .get(authenticate, getEventById)
  .delete(authenticate, authorizeAdmin, removeEvent);

module.exports = eventRoute;
