Event Ticketing System
An advanced Event Ticketing System built with Node.js, Express, and MongoDB. This application enables users to register and book tickets for events, while providing administrators with capabilities to manage events (create, update, and delete events). The system includes JWT-based authentication, role-based access, and detailed API documentation for easy integration.

Table of Contents
Project Overview
Technologies Used
Project Structure
Getting Started
Prerequisites
Installation
Environment Variables
API Documentation
Authentication Endpoints
User Endpoints
Event Endpoints
Middleware
Testing
Deployment
Contributing
Troubleshooting
License
Project Overview
The Event Ticketing System is designed to facilitate online event ticket bookings, targeting both general users and event organizers. Key features include:

User authentication and authorization
Role-based access control (admin vs. user)
Event booking with ticket availability tracking
Comprehensive error handling and input validation
Support for testing and deployment
Technologies Used
Node.js and Express for server-side application logic and routing
MongoDB with Mongoose for data storage and modeling
JWT (JSON Web Tokens) for secure authentication
Mocha, Chai, and Supertest for testing
Project Structure
bash
Copy code
├── controllers       # API request handlers for business logic
├── middleware        # Middleware for authentication, error handling, etc.
├── models            # Mongoose schema and models for MongoDB collections
├── routes            # API endpoint route definitions
├── tests             # Integration and unit tests
├── utils             # Utility functions and helpers
├── .env              # Environment variables (not included in version control)
├── server.js         # Main entry point for the server
└── README.md         # Project documentation
Getting Started
Prerequisites
Node.js v14 or higher
MongoDB instance (local or cloud-based, e.g., MongoDB Atlas)
Installation
Clone the repository:

bash
Copy code
git clone <repo-url>
cd event-ticket-system
Install the required dependencies:

bash
Copy code
npm install
Create a .env file in the root directory, based on the following environment variables.

Environment Variables
Variable	Description
MONGO_URI	MongoDB connection URI
JWT_SECRET	Secret key for JWT signing and verification
PORT	Port number for the application (default: 3000)
Example .env file:

plaintext
Copy code
MONGO_URI=mongodb://localhost:27017/event-system
JWT_SECRET=your_jwt_secret
PORT=3000
Start the server:
bash
Copy code
npm start
API Documentation
Authentication Endpoints
Register User
Endpoint: POST /api/users/register
Request Body:
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
Endpoint: POST /api/users/login
Request Body:
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
User Endpoints
Get User Profile (Authenticated)
Endpoint: GET /api/users/profile
Headers: Authorization: Bearer <JWT>
Response:
json
Copy code
{
  "username": "user123",
  "email": "user@example.com",
  "eventsBooked": [ /* List of events booked by the user */ ]
}
Event Endpoints
Create Event (Admin Only)
Endpoint: POST /api/event
Headers: Authorization: Bearer <JWT>
Request Body:
json
Copy code
{
  "eventName": "Charity Run",
  "address": "City Park, Chicago, IL",
  "eventDate": "2025-04-10T08:00:00Z",
  "price": 25,
  "desc": "Support local charities.",
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
  "desc": "Support local charities.",
  "totalTickets": 100,
  "availableTickets": 100
}
Update Event (Admin Only)
Endpoint: PUT /api/event/:id
Headers: Authorization: Bearer <JWT>
Request Body:
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
Book an Event
Endpoint: POST /api/event/:id/book
Headers: Authorization: Bearer <JWT>
Response:
json
Copy code
{
  "message": "Event booked successfully",
  "remainingTickets": 89
}
Middleware
Auth Middleware: Validates JWTs, ensuring protected routes are only accessible to authenticated users.
Admin Middleware: Restricts certain routes (e.g., creating and deleting events) to admin users.
Error Handling Middleware: Centralized error handler to manage API error responses consistently.
Testing
Running Tests
The application includes a test suite built with Mocha, Chai, and Supertest. Tests cover authentication, event booking, and admin functionalities.

bash
Copy code
npm test
Deployment
To deploy the application:

Ensure the environment variables (MONGO_URI, JWT_SECRET, and PORT) are configured properly.
Deploy to a hosting service like Heroku or DigitalOcean, or use Docker for containerization.
Scale horizontally if needed to manage high loads by leveraging MongoDB’s replica set features and load-balancing with Node.js clustering.
Contributing
Contributions are welcome! Follow these steps to get started:

Fork the repository.
Create a feature branch (git checkout -b feature-branch).
Commit your changes (git commit -m 'Add new feature').
Push to the branch (git push origin feature-branch).
Open a Pull Request.
Troubleshooting
Authentication Issues: If receiving 401 errors, ensure the JWT is correctly included in the request headers.
Database Connectivity Issues: Verify MONGO_URI in the .env file points to a running MongoDB instance.
Event Capacity: Ensure totalTickets and availableTickets values align during event creation and bookings.
License
This project is licensed under the MIT License.

This README provides an in-depth overview of the Event Ticketing System project. It includes detailed setup, endpoint specifications, middleware functions, and testing instructions to make it easy to understand, set up, and contribute to the project.
