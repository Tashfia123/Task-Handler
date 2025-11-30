# Database Initialization for Neon PostgreSQL

## Quick Start

To initialize your Neon PostgreSQL database, simply run:

```bash
npm run init-db
```

## Prerequisites

1. Make sure you have a `.env` file in the `backend` folder
2. Add your Neon PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
PORT=5000
NODE_ENV=development
```

## How to Get Your Neon Connection String

1. Log in to your [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to the "Connection Details" section
4. Copy the connection string
5. Paste it into your `.env` file as `DATABASE_URL`

## Usage

### Initialize Database
```bash
cd backend
npm run init-db
```

This will:
- ✓ Connect to your Neon database
- ✓ Create the `tasks` table
- ✓ Create indexes for better performance
- ✓ Display the table structure

### Start Server (tables auto-create)
```bash
npm start
```

The server will also automatically create tables if they don't exist when it starts.

## What Gets Created

- **tasks table** with columns:
  - `id` (auto-increment primary key)
  - `title` (required)
  - `description` (optional)
  - `priority` (default: 'Medium')
  - `status` (default: 'To Do')
  - `assigned_to` (optional)
  - `due_date` (optional)
  - `created_at` (auto-timestamp)
  - `updated_at` (auto-timestamp)

- **Index** on `status` column for faster queries

## Troubleshooting

### Error: "password authentication failed"
- Check your `.env` file has the correct `DATABASE_URL`
- Make sure you copied the full connection string from Neon

### Error: "database does not exist"
- Neon creates the database automatically, but check your connection string
- Make sure you're using the correct database name (usually `neondb`)

### Error: "Connection refused"
- Check your internet connection
- Verify your Neon project is active
- Make sure the connection string is correct

## Notes

- The script uses SSL for Neon connections automatically
- Tables are created with `IF NOT EXISTS`, so it's safe to run multiple times
- The script will show you the table structure after successful initialization

