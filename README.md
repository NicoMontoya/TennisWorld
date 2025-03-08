# TennisWorld

A web application for tracking tennis results and predicting match outcomes.

## Features

- User registration and authentication
- Tennis match tracking and results
- Player statistics and rankings
- Match prediction contests
- Integration with tennis-api for real-time data

## Tech Stack

- **Frontend**: React, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose

## Project Structure

```
TennisWorld/
├── frontend/             # React frontend application
│   ├── public/           # Static files
│   └── src/              # React components and logic
├── backend/              # Node.js backend API
│   └── src/              # Express routes and controllers
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/NicoMontoya/TennisWorld.git
   cd TennisWorld
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Development

### Frontend

The frontend is a React application created with Vite. To run it in development mode:

```
cd frontend
npm install
npm run dev
```

### Backend

The backend is a Node.js application using Express. To run it in development mode:

```
cd backend
npm install
npm run dev
```

## License

This project is licensed under the terms of the license included in the repository.
