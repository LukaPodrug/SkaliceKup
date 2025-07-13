# API Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **PostgreSQL** (local or cloud)

## PostgreSQL Setup

### Option 1: Local PostgreSQL (Recommended for development)

#### Install PostgreSQL on macOS:
```bash
# Using Homebrew
brew install postgresql

# Start PostgreSQL service
brew services start postgresql
```

#### Install PostgreSQL on Windows:
Download and install from [PostgreSQL Download Center](https://www.postgresql.org/download/windows/)

#### Install PostgreSQL on Linux (Ubuntu):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Option 2: PostgreSQL Cloud Services

1. **Heroku Postgres** - Easy setup with Heroku
2. **AWS RDS** - Managed PostgreSQL on AWS
3. **Google Cloud SQL** - Managed PostgreSQL on GCP
4. **DigitalOcean Managed Databases** - Simple managed PostgreSQL

## Database Setup

### Create Database and User (Local PostgreSQL)

1. **Connect to PostgreSQL:**
```bash
psql postgres
```

2. **Create database and user:**
```sql
CREATE DATABASE skalice;
CREATE USER skalice_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE skalice TO skalice_user;
```

3. **Exit PostgreSQL:**
```sql
\q
```

## API Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your PostgreSQL connection details
# For local PostgreSQL:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=skalice_user
DB_PASSWORD=your_password
DB_NAME=skalice

# For cloud PostgreSQL (example):
# DB_HOST=your-host.amazonaws.com
# DB_PORT=5432
# DB_USERNAME=your_username
# DB_PASSWORD=your_password
# DB_NAME=skalice
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Test the API:**
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Skalice API is running"
}
```

## API Client Setup

The API client has been copied to both the admin and client apps:

- `admin-app/src/utils/apiClient.ts`
- `client-app/src/utils/apiClient.ts`

To use the API client in your React components:

```typescript
import { apiClient } from '../utils/apiClient';

// Example usage
const fetchTournamentEditions = async () => {
  const response = await apiClient.getTournamentEditions();
  if (response.data) {
    console.log('Tournament editions:', response.data);
  } else {
    console.error('Error:', response.error);
  }
};
```

## Troubleshooting

### PostgreSQL Connection Issues

1. **Check if PostgreSQL is running:**
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app for PostgreSQL service
```

2. **Test PostgreSQL connection:**
```bash
psql -h localhost -U skalice_user -d skalice
```

3. **Common issues:**
   - PostgreSQL not installed
   - PostgreSQL service not started
   - Wrong connection credentials
   - Firewall blocking connection
   - Database/user doesn't exist

### Port Already in Use

If port 5000 is already in use, change it in your `.env` file:
```
PORT=5001
```

### TypeScript Errors

If you see TypeScript errors, make sure all dependencies are installed:
```bash
npm install
npm run build
```

### Database Migration Issues

If you need to reset the database:
```bash
# Drop and recreate database
psql postgres -c "DROP DATABASE IF EXISTS skalice;"
psql postgres -c "CREATE DATABASE skalice;"
```

## Next Steps

1. Start the API server: `npm run dev`
2. Update your React apps to use the API client
3. Test the endpoints with tools like Postman or curl
4. Integrate the API calls into your existing components 