const request = require("supertest");
const app = require("../server");
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const mongoose = require("mongoose");

beforeAll(async () => {
  console.log(`Connecting to database at: ${process.env.MONGO_URI}`);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Event Authentication Tests", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
  });

  describe("POST /api/events", () => {
    it("should create an event after registering as an admin", async () => {
      const adminResponse = await request(app)
        .post("/api/users/register")
        .send({
          username: "adminuser",
          email: "admin@example.com",
          password: "password123",
          isAdmin: true,
        });

      const adminToken = adminResponse.headers["set-cookie"];
      if (!adminToken) {
        throw new Error(
          "Failed to retrieve admin token from set-cookie header"
        );
      }

      const eventRes = await request(app)
        .post("/api/event")
        .set("Cookie", adminToken)
        .send({
          eventName: "Charity Run",
          address: "City Park, Chicago, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 25,
          desc: "Participate in a fun run to support local charities.",
          capacity: 400,
          currentBookings: 200,
        });

      expect(eventRes.statusCode).toBe(201);
      expect(eventRes.body).toHaveProperty("eventName", "Charity Run");
      expect(eventRes.body).toHaveProperty(
        "address",
        "City Park, Chicago, IL, USA"
      );
      expect(eventRes.body).toHaveProperty("capacity", 400);
    });

    it("should not allow a non-admin to create an event", async () => {
      const userResponse = await request(app).post("/api/users/register").send({
        username: "normaluser",
        email: "user@example.com",
        password: "password123",
      });

      const userToken = userResponse.headers["set-cookie"];
      if (!userToken) {
        throw new Error("Failed to retrieve user token from set-cookie header");
      }

      const eventRes = await request(app)
        .post("/api/event")
        .set("Cookie", userToken)
        .send({
          eventName: "Community Cleanup",
          address: "Downtown, Chicago, IL, USA",
          eventDate: "2025-05-15T09:00:00Z",
          price: 0,
          desc: "Join us for a community cleanup day.",
          capacity: 100,
          currentBookings: 0,
        });

      expect(eventRes.statusCode).toBe(403);
      expect(eventRes.body).toHaveProperty(
        "message",
        "Access denied. Admins only."
      );
    });

    it("should allow admin to update an event", async () => {
      const adminResponse = await request(app)
        .post("/api/users/register")
        .send({
          username: "adminuser",
          email: "admin@example.com",
          password: "password123",
          isAdmin: true,
        });

      const adminToken = adminResponse.headers["set-cookie"];
      if (!adminToken) {
        throw new Error(
          "Failed to retrieve admin token from set-cookie header"
        );
      }

      const eventResponse = await request(app)
        .post("/api/event")
        .set("Cookie", adminToken)
        .send({
          eventName: "Charity Run",
          address: "City Park, Chicago, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 25,
          desc: "Participate in a fun run to support local charities.",
          capacity: 400,
          currentBookings: 200,
        });

      const eventId = eventResponse.body._id;

      const updatedEvent = await request(app)
        .put(`/api/event/${eventId}`)
        .set("Cookie", adminToken)
        .send({
          eventName: "Fiesta Fest",
          address: "Uptown, Summerville, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 100,
          desc: "Celebrate with food and music.",
          capacity: 100,
          currentBookings: 3,
        });

      expect(updatedEvent.statusCode).toBe(200);
      expect(updatedEvent.body).toHaveProperty("eventName", "Fiesta Fest");
      expect(updatedEvent.body).toHaveProperty(
        "address",
        "Uptown, Summerville, IL, USA"
      );
      expect(updatedEvent.body).toHaveProperty("price", 100);
      expect(updatedEvent.body).toHaveProperty(
        "desc",
        "Celebrate with food and music."
      );
    });

    it("should allow user to book an event", async () => {
      const adminResponse = await request(app)
        .post("/api/users/register")
        .send({
          username: "adminuser",
          email: "admin@example.com",
          password: "password123",
          isAdmin: true,
        });

      const adminToken = adminResponse.headers["set-cookie"];
      if (!adminToken) {
        throw new Error(
          "Failed to retrieve admin token from set-cookie header"
        );
      }

      const eventResponse = await request(app)
        .post("/api/event")
        .set("Cookie", adminToken)
        .send({
          eventName: "Charity Run",
          address: "City Park, Chicago, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 25,
          desc: "Participate in a fun run to support local charities.",
          capacity: 400,
          currentBookings: 200,
        });

      const eventId = eventResponse.body._id;

      const userResponse = await request(app).post("/api/users/register").send({
        username: "normaluser",
        email: "user@example.com",
        password: "password123",
      });

      const userToken = userResponse.headers["set-cookie"];
      if (!userToken) {
        throw new Error("Failed to retrieve user token from set-cookie header");
      }

      const bookingResponse = await request(app)
        .post(`/api/event/${eventId}/book`)
        .set("Cookie", userToken)
        .send();

      expect(bookingResponse.statusCode).toBe(200);
      expect(bookingResponse.body).toHaveProperty(
        "message",
        "Event booked successfully"
      );

      const updatedEventResponse = await request(app).get(
        `/api/event/${eventId}`
      );

      const userProfileResponse = await request(app)
        .get("/api/users/profile")
        .set("Cookie", userToken);

      expect(userProfileResponse.statusCode).toBe(200);
      expect(userProfileResponse.body.eventsBooked[0]._id).toContain(eventId);
    });

    it("should allow admin to delete an event", async () => {
      const adminResponse = await request(app)
        .post("/api/users/register")
        .send({
          username: "adminuser",
          email: "admin@example.com",
          password: "password123",
          isAdmin: true,
        });

      const adminToken = adminResponse.headers["set-cookie"];
      if (!adminToken) {
        throw new Error(
          "Failed to retrieve admin token from set-cookie header"
        );
      }

      const eventResponse = await request(app)
        .post("/api/event")
        .set("Cookie", adminToken)
        .send({
          eventName: "Charity Run",
          address: "City Park, Chicago, IL, USA",
          eventDate: "2025-04-10T08:00:00ZM",
          price: 25,
          desc: "Participate in a fun run to support local charities.",
          capacity: 400,
          currentBookings: 200,
        });

      const eventId = eventResponse.body._id;

      const deletedEvent = await request(app)
        .delete(`/api/event/${eventId}`)
        .set("Cookie", adminToken)
        .send({
          eventName: "Fiesta Fest",
          address: "Uptown, Summerville, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 100,
          desc: "Celebrate with food and music.",
          capacity: 100,
          currentBookings: 3,
        });

      expect(deletedEvent.statusCode).toBe(200);
      expect(deletedEvent.body).toHaveProperty(
        "message",
        "Event Deleted successfully"
      );
    });
  });
});
