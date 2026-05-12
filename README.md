# TNP Portal

A full-stack training and placement portal built with React, Vite, Tailwind CSS, Express, Sequelize, and PostgreSQL.

## Overview

TNP Portal is a placement management system for students, placement coordinators, and TPO Heads. The application supports role-based authentication, student drive discovery, application management, profile completion, notifications, and administrative drive/course/company management.

## Key Features

- Role-based authentication with JWT access and refresh tokens
- Student workflows for browsing open drives, submitting applications, uploading documents, and viewing notifications
- Coordinator/TPO dashboards for creating and updating drives, managing companies, courses, and departments
- Admin features for user and staff management, department assignments, and access control
- Secure password reset flow using email tokens
- PostgreSQL database backed by Sequelize ORM
- REST API design with Express and JSON request handling

## Technology Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts, Axios
- Backend: Node.js, Express, Sequelize, PostgreSQL
- Authentication: JWT access tokens, refresh tokens, role-based authorization
- Utilities: dotenv, cors, bcrypt, jsonwebtoken, multer, nodemailer

## Project Structure

- `client/` - React frontend application
- `server/` - Express backend API and Sequelize models
- `server/models/` - Database model definitions
- `server/routes/` - API routing and role-based middleware
- `server/controllers/` - Request handlers and business logic
- `server/services/` - Authentication and application services
- `server/config/` - Database configuration
- `server/utils/` - Database seeding, triggers, and helper utilities

## Setup Instructions

### Backend

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with environment variables, for example:
   ```env
   DB_URL=postgres://username:password@host:port/database
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   JWT_ACCESS_TTL=20m
   JWT_REFRESH_TTL_DAYS=7
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm run dev
   ```

## Usage

- Backend APIs are exposed under `/api/v1/`
- The frontend runs on Vite and communicates with the backend via HTTP requests
- Authentication uses Bearer tokens in the Authorization header

## Seed and Demo Data

- The backend contains seed scripts for roles, default admin/TPO data, and demo placement data
- Example script:
  ```bash
  npm run seed:demo-2024-2025
  ```

## Notes

- The backend automatically syncs Sequelize models with the PostgreSQL database when started
- Refresh tokens are stored as hashed values in the database for security
- The project uses CORS configuration to allow the frontend origin defined by `FRONTEND_URL`

## License

This project is provided as-is for demonstration and development purposes.
