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

  const extractToken = (rawCookie) => {
    return rawCookie[0].split(";")[0];
  };

  describe("POST /api/events", () => {
    it("should initialize an event after registering as an admin", async () => {
      const adminResponse = await request(app)
        .post("/api/users/register")
        .send({
          username: "adminuser",
          email: "admin@example.com",
          password: "password123",
          isAdmin: true,
        });

      const rawCookie = adminResponse.headers["set-cookie"];
      if (!rawCookie) {
        throw new Error(
          "Failed to retrieve admin token from set-cookie header"
        );
      }
      const adminToken = extractToken(rawCookie);

      const eventRes = await request(app)
        .post("/api/event/initialize")
        .set("Cookie", adminToken) 
        .send({
          eventName: "Charity Run",
          address: "City Park, Chicago, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 25,
          desc: "Participate in a fun run to support local charities.",
          totalTickets: 10,
        });

      expect(eventRes.statusCode).toBe(201); // Check if the event creation succeeds
      expect(eventRes.body).toHaveProperty("eventName", "Charity Run");
      expect(eventRes.body).toHaveProperty(
        "address",
        "City Park, Chicago, IL, USA"
      );
      expect(eventRes.body).toHaveProperty("availableTickets", 10);
    });

    it("should not allow a non-admin to create an event", async () => {
      const userResponse = await request(app).post("/api/users/register").send({
        username: "normaluser",
        email: "user@example.com",
        password: "password123",
      });

      const userToken = extractToken(userResponse.headers["set-cookie"]);

      const eventRes = await request(app)
        .post("/api/event/initialize")
        .set("Cookie", userToken)
        .send({
          eventName: "Community Cleanup",
          address: "Downtown, Chicago, IL, USA",
          eventDate: "2025-05-15T09:00:00Z",
          price: 0,
          desc: "Join us for a community cleanup day.",
          totalTickets: 10,
        });

      expect(eventRes.statusCode).toBe(403);
      expect(eventRes.body).toHaveProperty(
        "message",
        "Access denied. Admins only."
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

      const adminToken = extractToken(adminResponse.headers["set-cookie"]);

      const eventResponse = await request(app)
        .post("/api/event/initialize")
        .set("Cookie", adminToken)
        .send({
          eventName: "Charity Run",
          address: "City Park, Chicago, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 25,
          desc: "Participate in a fun run to support local charities.",
          totalTickets: 10,
        });

      const eventId = eventResponse.body._id;

      const userResponse = await request(app).post("/api/users/register").send({
        username: "normaluser",
        email: "user@example.com",
        password: "password123",
      });

      const userToken = extractToken(userResponse.headers["set-cookie"]);

      const bookingResponse = await request(app)
        .post(`/api/event/${eventId}/book`)
        .set("Cookie", userToken);

      expect(bookingResponse.statusCode).toBe(201);
      expect(bookingResponse.body).toHaveProperty(
        "message",
        "Ticket booked successfully"
      );

      const userProfileResponse = await request(app)
        .get("/api/users/profile")
        .set("Cookie", userToken);

      expect(userProfileResponse.statusCode).toBe(200);
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

      const adminToken = extractToken(adminResponse.headers["set-cookie"]);

      const eventResponse = await request(app)
        .post("/api/event/initialize")
        .set("Cookie", adminToken)
        .send({
          eventName: "Charity Run",
          address: "City Park, Chicago, IL, USA",
          eventDate: "2025-04-10T08:00:00Z",
          price: 25,
          desc: "Participate in a fun run to support local charities.",
          totalTickets: 10,
        });

      const eventId = eventResponse.body._id;

      const deletedEventResponse = await request(app)
        .delete(`/api/event/${eventId}`)
        .set("Cookie", adminToken);

      expect(deletedEventResponse.statusCode).toBe(200);
      expect(deletedEventResponse.body).toHaveProperty(
        "message",
        "Event Deleted successfully"
      );
    });
  });
});
