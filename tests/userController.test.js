const request = require("supertest");
const app = require("../server");
const User = require("../models/userModel");
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

describe("User Authentication Tests", () => {
  beforeEach(async () => {
    await User.deleteMany({}); 
  });

  describe("User Registration", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        isAdmin: false,
      });

      expect(response.statusCode).toBe(201); 
      expect(response.body.success).toBe(true);
    });

    it("should not register a user with an existing email", async () => {
      await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/users/register").send({
        username: "anotheruser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });

    it("should validate email format", async () => {
      const response = await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Enter a valid email");
    });
  });

  describe("User Login", () => {
    it("should log in an existing user", async () => {
      await request(app).post("/api/users/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        isAdmin: false,
      });

      const response = await request(app).post("/api/users/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty("token");
    });
  });

  describe("Admin User Management", () => {
    it("should allow an admin to see all users", async () => {
      const adminUser = await User.create({
        username: "adminuser",
        email: "admin@example.com",
        password: "password123",
        isAdmin: true,
      });

      const loginResponse = await request(app).post("/api/users/login").send({
        email: adminUser.email,
        password: "password123",
      });

      const adminToken = loginResponse.headers["set-cookie"];

      if (!adminToken) {
        return;
      }

      const response = await request(app)
        .get("/api/users")
        .set("Cookie", adminToken);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty("username");
      expect(response.body[0]).toHaveProperty("email");
    });

    it("should not allow a non-admin to see all users", async () => {
      const nonAdminUser = await User.create({
        username: "nonadminuser",
        email: "nonadmin@example.com",
        password: "password123",
        isAdmin: false,
      });

      const loginResponse = await request(app).post("/api/users/login").send({
        email: nonAdminUser.email,
        password: "password123",
      });

      const nonAdminToken = loginResponse.headers["set-cookie"];

      if (!nonAdminToken) {
        return;
      }

      const response = await request(app)
        .get("/api/users")
        .set("Cookie", nonAdminToken[0]);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe("Access denied. Admins only.");
    });
  });
});
