# Event-Ticketing-System



Event Ticketing System
This project is an event ticket booking system built with Node.js, Express, MongoDB, and Mongoose. It allows users to register, log in, book event tickets, and allows administrators to create, update, and delete events. This README provides a comprehensive guide to setting up and using the API.

Table of Contents
Project Structure
Getting Started
Environment Variables
API Documentation
Authentication
Users
Events
Testing
Project Structure
bash
Copy code
├── controllers         # Request handlers for API routes
├── middleware          # Custom middleware (authentication, error handling)
├── models              # Mongoose schema and model definitions
├── routes              # API route definitions
├── utils               # Utility functions and helpers
├── .env                # Environment variables (not committed)
├── server.js           # Main server file
└── README.md           # Project documentation
Getting Started
Prerequisites
Node.js (v14+ recommended)
MongoDB (local or cloud instance)
Installation
Clone the repository:

bash
Copy code
git clone <repo-url>
cd event-ticket-system
Install dependencies:

bash
Copy code
npm install
Create a .env file in the root directory and set the required environment variables as described below.

Start the server:

bash
Copy code
npm start
Environment Variables
Variable	Description
MONGO_URI	MongoDB connection URI
JWT_SECRET	Secret key for JWT generation
PORT	Port for the server (default: 3000)
API Documentation
Authentication
The authentication system is JWT-based. Upon successful login, the server will issue a token, which should be included in subsequent requests for protected routes.

Users
Register a New User
URL: /api/users/register
Method: POST
Body:
json
Copy code
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "isAdmin": false
}
Response:
json
Copy code
{
  "message": "User registered successfully"
}
Login User
URL: /api/users/login
Method: POST
Body:
json
Copy code
{
  "email": "user@example.com",
  "password": "password123"
}
Response:
json
Copy code
{
  "message": "Login successful",
  "token": "jwt_token"
}
Events
Create Event (Admin Only)
URL: /api/event
Method: POST
Headers: Authorization: Bearer <JWT>
Body:
json
Copy code
{
  "eventName": "Charity Run",
  "address": "City Park, Chicago, IL",
  "eventDate": "2025-04-10T08:00:00Z",
  "price": 25,
  "desc": "Participate in a fun run to support local charities.",
  "totalTickets": 100
}
Response:
json
Copy code
{
  "_id": "event_id",
  "eventName": "Charity Run",
  "address": "City Park, Chicago, IL",
  "eventDate": "2025-04-10T08:00:00Z",
  "price": 25,
  "desc": "Participate in a fun run to support local charities.",
  "totalTickets": 100,
  "availableTickets": 100
}
Get All Events
URL: /api/events
Method: GET
Response:
json
Copy code
[
  {
    "_id": "event_id",
    "eventName": "Charity Run",
    "address": "City Park, Chicago, IL",
    "eventDate": "2025-04-10T08:00:00Z",
    "price": 25,
    "desc": "Fun run for charity.",
    "availableTickets": 90
  }
]
Get Event by ID
URL: /api/event/:id
Method: GET
Response:
json
Copy code
{
  "_id": "event_id",
  "eventName": "Charity Run",
  "address": "City Park, Chicago, IL",
  "eventDate": "2025-04-10T08:00:00Z",
  "price": 25,
  "desc": "Fun run for charity.",
  "availableTickets": 90
}
Update Event (Admin Only)
URL: /api/event/:id
Method: PUT
Headers: Authorization: Bearer <JWT>
Body:
json
Copy code
{
  "eventName": "Updated Event Name",
  "price": 30
}
Response:
json
Copy code
{
  "message": "Event updated successfully",
  "updatedEvent": {
    "_id": "event_id",
    "eventName": "Updated Event Name",
    "price": 30
  }
}
Delete Event (Admin Only)
URL: /api/event/:id
Method: DELETE
Headers: Authorization: Bearer <JWT>
Response:
json
Copy code
{
  "message": "Event deleted successfully"
}
Book an Event
URL: /api/event/:id/book
Method: POST
Headers: Authorization: Bearer <JWT>
Response:
json
Copy code
{
  "message": "Event booked successfully",
  "remainingTickets": 89
}
Testing
To run tests for the application, use:

bash
Copy code
npm test
The test suite includes tests for both authentication and event management endpoints.

Troubleshooting
If you encounter any issues:

Verify MongoDB is running and accessible.
Ensure all environment variables are set correctly.
Check console logs for specific error messages.
