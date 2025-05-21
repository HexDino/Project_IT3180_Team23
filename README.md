# BlueMoon Apartment Fee Management System

A comprehensive system to manage apartment fees, residents, and households for BlueMoon Apartment Complex.

## Tech Stack

- Frontend: React.js with Bootstrap
- Backend: Node.js, Express.js
- Database: MongoDB

## Features

- User authentication and authorization (admin, accountant roles)
- Household management
- Resident information management
- Fee and payment tracking
- Temporary residence and absence recording

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB

### Installation

1. Clone the repository

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd frontend
npm install
```

4. Set up environment variables
Create a `.env` file in the backend directory with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/bluemoon_apartment
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

### Running the application

1. Start the backend server
```
cd backend
npm run dev
```

2. Start the frontend development server
```
cd frontend
npm start
```

Access the application at `http://localhost:3000` 