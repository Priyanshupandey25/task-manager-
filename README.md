# Task Manager Web Application

A full-stack Task Manager app built with Node.js, Express, MongoDB, and a responsive vanilla HTML/CSS/JavaScript frontend.

## Features

- Secure user signup and login
- Password hashing using bcryptjs
- JWT-based authentication
- User-specific task data isolation
- Add, view, complete/undo, and delete tasks
- Responsive and professional UI

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Libraries: jsonwebtoken, bcryptjs, cors, dotenv

## Project Structure

- backend
  - config
  - controllers
  - middleware
  - models
  - routes
  - server.js
- frontend
  - css
  - js
  - index.html

## Setup Instructions

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Update values in `.env`:

- `MONGODB_URI` (local or MongoDB Atlas connection string)
- `JWT_SECRET` (long random secret)
- `GROQ_API_KEY` (your Groq API key)
- `GROQ_MODEL` (optional Groq model name, defaults to `llama-3.1-8b-instant`)

4. Start backend server:

```bash
npm run dev
```

5. Open the app in your browser:

- Visit `http://localhost:5000`

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Tasks (Protected)

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Notes

- All task routes require `Authorization: Bearer <token>`.
- Frontend stores token and basic user data in browser localStorage.
