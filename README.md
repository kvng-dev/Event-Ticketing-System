# Event-Ticketing-System

Overview

The Event Ticketing System is a web application designed to facilitate the creation, management, and booking of events. This platform allows administrators to manage events efficiently while providing users with a seamless experience for booking tickets. The system includes user authentication, role-based access control, and robust error handling.
Features

    User Authentication:
        Users can register and log in as either a normal user or an admin.
        Passwords are securely hashed before storage.

    Admin Controls:
        Admins have special privileges to create, update, delete, and view all events.
        Admins can view all registered users.

    Event Management:
        Create new events with details such as name, address, date, price, and capacity.
        Update existing events to reflect changes in details or availability.
        Delete events that are no longer needed.

    Event Booking:
        Users can book tickets for available events.
        The system ensures that the number of bookings does not exceed the event's capacity.

    Error Handling:
        Comprehensive error handling for all operations, providing meaningful error messages to users.

Technologies Used

    Node.js: A JavaScript runtime environment for building the server.
    Express: A web framework for Node.js to create APIs.
    MongoDB: A NoSQL database for storing user and event data.
    Mongoose: An ODM library for MongoDB, providing a schema-based solution for data modeling.
    Jest: A testing framework for writing and running tests.
    Supertest: A testing library for HTTP assertions.

Installation
Prerequisites

    Node.js: Ensure you have Node.js installed (v14 or higher).
    MongoDB: You can use a local instance or a cloud service (like MongoDB Atlas).
    npm: Node Package Manager is included with Node.js.

Steps

    Clone the Repository:

    bash

git clone https://github.com/yourusername/event-ticketing-system.git
cd event-ticketing-system

Install Dependencies:

Navigate to the project directory and install the required packages:

bash

npm install

Setup Environment Variables:

Create a .env file in the root directory with the following content:

plaintext

MONGO_URI=mongodb://<username>:<password>@localhost:27017/event_ticketing

Replace <username> and <password> with your MongoDB credentials.

Run the Application:

Start the server using:

bash

    npm start

    The application will be accessible at http://localhost:5000.

API Endpoints
User Authentication

    POST /api/users/register
        Description: Register a new user (admin or normal).
        Request Body:

        json

    {
      "username": "string",
      "email": "string",
      "password": "string",
      "isAdmin": "boolean"  // Optional for admin registration
    }

    Responses:
        201 Created: User registered successfully.
        400 Bad Request: Invalid input or user already exists.

POST /api/users/login

    Description: Log in a registered user.
    Request Body:

    json

        {
          "email": "string",
          "password": "string"
        }

        Responses:
            200 OK: Login successful, returns a token.
            401 Unauthorized: Invalid credentials.

Event Management

    POST /api/event
        Description: Create a new event (admin only).
        Request Body:

        json

        {
          "eventName": "string",
          "address": "string",
          "eventDate": "string", // Format: ISO 8601 (e.g., "2025-04-10T08:00:00Z")
          "price": "number",
          "desc": "string",
          "capacity": "number",
          "currentBookings": "number" // Default: 0
        }

        Responses:
            201 Created: Event created successfully.
            400 Bad Request: Invalid event data.

    PUT /api/event/:id
        Description: Update an existing event (admin only).
        Request Body: Same structure as for creating an event.
        Responses:
            200 OK: Event updated successfully.
            404 Not Found: Event does not exist.

    DELETE /api/event/:id
        Description: Delete an existing event (admin only).
        Responses:
            200 OK: Event deleted successfully.
            404 Not Found: Event does not exist.

Event Booking

    POST /api/event/:id/book
        Description: Book tickets for an event.
        Request Body:

        json

        {
          "numberOfTickets": "number"
        }

        Responses:
            200 OK: Booking successful.
            400 Bad Request: Not enough capacity or invalid request.

User Management (Admin Only)

    GET /api/users
        Description: Retrieve a list of all users (admin only).
        Responses:
            200 OK: List of users returned successfully.
            403 Forbidden: Access denied.

Running Tests

To ensure the application works as expected, tests can be run using:

bash

npm test

The test suite includes tests for user authentication, event management, and error handling, utilizing Jest and Supertest for HTTP assertions.
Contribution Guidelines

Contributions are welcome! If you wish to contribute to this project, please follow these steps:

    Fork the repository.
    Create a new branch: git checkout -b feature/YourFeature.
    Make your changes and commit them: git commit -m 'Add some feature'.
    Push to the branch: git push origin feature/YourFeature.
    Open a Pull Request.

License

This project is licensed under the MIT License.
