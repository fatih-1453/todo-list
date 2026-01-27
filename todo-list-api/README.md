# Todo-List API

Backend API for the Todo-List application built with Express.js, Drizzle ORM, PostgreSQL, and Better Auth.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm/npm/yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file and configure:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` and other variables in `.env`

3. Generate and run database migrations:
   ```bash
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication (`/api/auth/*`)
- `POST /api/auth/sign-up` - Register
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get session

### Tasks (`/api/tasks`)
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/toggle` - Toggle done
- `DELETE /api/tasks/:id` - Delete task

### Team (`/api/team`)
- Full CRUD operations for team members

### Reminders (`/api/reminders`)
- Full CRUD for reminders
- `GET /api/reminders/today` - Today's reminders

### Chat (`/api/chat`)
- `GET /api/chat/conversations` - List conversations
- `POST /api/chat/ai` - AI assistant

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Statistics
- `GET /api/dashboard/performance` - Performance
- `GET /api/dashboard/weekly-report` - Report

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
