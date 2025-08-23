---
title: MERN Stack Project README
tags:
  - mern
  - mongodb
  - react
  - fullstack
collection: Fullstack
createdAt: '2023-11-15T12:00:00Z'
updatedAt: '2025-08-23T23:14:35.591Z'
variables:
  - key: projectName
    label: Project Name
    type: string
    required: true
  - key: description
    label: Project Description
    type: textarea
    required: true
---

Generate a README for a full-stack MERN project, detailing how to run both the backend API and the frontend client.
Test changes
# {{projectName}}

{{description}}

A full-stack web application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios for API calls
- Material-UI / Tailwind CSS
- Context API / Redux for state management

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Project Structure

```
{{projectName}}/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/username/{{projectName}}.git
cd {{projectName}}
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Configure Environment Variables
Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/{{projectName}}
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
```

### 4. Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

## Running the Application

### Development Mode

**Option 1: Run separately**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

**Option 2: Run concurrently (from root)**
```bash
npm run dev
```

### Production Mode

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Features

- User authentication (register, login, logout)
- Protected routes and middleware
- CRUD operations
- Responsive design
- Error handling and validation
- File upload functionality
- Search and pagination

## Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Deployment

### Heroku Deployment
1. Create Heroku app
2. Set environment variables
3. Deploy using Git or GitHub integration

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.
