# Task Management Application

A full-stack task management application built with React, Node.js, Express.js, and PostgreSQL.

## Features

- **Dashboard Overview**: View task statistics (Total, To Do, In Progress, Completed, Overdue)
- **Progress Tracking**: Weekly progress and overall completion rate
- **Board View**: Kanban-style board with three columns (To Do, In Progress, Completed)
- **Add Tasks**: Create new tasks with title, description, priority, status, assignee, and due date
- **Task Management**: Update task status, delete tasks
- **Search & Filter**: Search tasks and filter by status, priority, and due date
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Project Structure

```
Task_managament/
├── backend/
│   ├── routes/
│   │   └── tasks.js       # Task API routes
│   ├── server.js          # Express server setup
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service
│   │   ├── App.js
│   │   └── index.js
│   └── package.json       # Frontend dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL connection string:
```
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanagement
PORT=5000
NODE_ENV=development
```

5. Make sure your PostgreSQL database is running and accessible.

6. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend server will run on `http://localhost:5000` and automatically create the necessary database tables.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional, defaults to localhost:5000):
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/stats/summary` - Get task statistics

## Database Schema

The application uses a single `tasks` table with the following structure:

- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(255) NOT NULL)
- `description` (TEXT)
- `priority` (VARCHAR(20) DEFAULT 'Medium')
- `status` (VARCHAR(20) DEFAULT 'To Do')
- `assigned_to` (VARCHAR(255))
- `due_date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Usage

1. **Adding a Task**: Click the "+ Add Task" button, fill in the form, and click "Create Task"
2. **Updating Task Status**: Check the checkbox on a task card to mark it as completed, or uncheck to move it back to To Do
3. **Deleting a Task**: Click the "×" button on a task card
4. **Searching**: Use the search bar to find tasks by title or description
5. **Filtering**: Use the dropdown filters to filter tasks by status, priority, or due date

## Technologies Used

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **HTTP Client**: Axios

## License

ISC

