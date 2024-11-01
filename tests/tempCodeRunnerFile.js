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

      if (!nonAdminToken || nonAdminToken.length === 0) {
        console.error(
          "Failed to retrieve set-cookie header for non-admin user"
        );
        return;
      }

      const response = await request(app)
        .get("/api/users")
        .set("Cookie", nonAdminToken[0]);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe("Access denied. Admins only.");
    });