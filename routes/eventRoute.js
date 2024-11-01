const express = require("express");
const {
  createEvent,
  getAllEvents,
  bookEvent,
  updatEvent,
  deleteEvent,
  getEventById,
} = require("../controller/eventController");
const {
  authorizeAdmin,
  authenticate,
} = require("../middleware/authMiddleware");

const eventRoute = express.Router();

eventRoute.post("/", authenticate, authorizeAdmin, createEvent);
eventRoute.get("/", getAllEvents);
eventRoute.post("/:id/book", authenticate, bookEvent);

eventRoute
  .route("/:id")
  .get(authenticate, getEventById)
  .put(authenticate, authorizeAdmin, updatEvent)
  .delete(authenticate, authorizeAdmin, deleteEvent);

module.exports = eventRoute;
