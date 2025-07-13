# Skalice API

REST API for the Skalice futsal tournament management system.

## Features

- Tournament edition management
- Team and player management
- Match scheduling and results
- Match events tracking
- Team and player assignments to tournament editions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=skalice
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Make sure PostgreSQL is running locally or update the database connection settings

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Tournament Editions
- `GET /api/tournament-editions` - Get all tournament editions
- `GET /api/tournament-editions/:id` - Get single tournament edition
- `POST /api/tournament-editions` - Create tournament edition
- `PUT /api/tournament-editions/:id` - Update tournament edition
- `DELETE /api/tournament-editions/:id` - Delete tournament edition

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get single player
- `POST /api/players` - Create player
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Matches
- `GET /api/matches` - Get all matches (with optional filters)
- `GET /api/matches/:id` - Get single match
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match
- `POST /api/matches/:id/events` - Add match event
- `DELETE /api/matches/:id/events/:eventIndex` - Remove match event

### Edition Teams
- `GET /api/edition-teams/:editionId` - Get teams for tournament edition
- `POST /api/edition-teams/:editionId` - Add team to tournament edition
- `DELETE /api/edition-teams/:editionId/:teamId` - Remove team from tournament edition

### Edition Players
- `GET /api/edition-players/:editionId/:teamId` - Get players for team in tournament edition
- `POST /api/edition-players/:editionId/:teamId` - Add player to team in tournament edition
- `DELETE /api/edition-players/:editionId/:teamId/:playerId` - Remove player from team in tournament edition

## Data Models

### Tournament Edition
```typescript
{
  id: string;
  name: string;
  year: number;
  category: 'senior' | 'veteran';
  phases: {
    kvalifikacije: boolean;
    grupa: boolean;
    knockout: boolean;
  };
  knockoutTeams?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Team
```typescript
{
  id: string;
  name: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Player
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Match
```typescript
{
  id: string;
  tournamentEditionId: string;
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  phase: string;
  group?: string;
  qualificationRound?: number;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'finished';
  events: Array<{
    type: 'start' | 'goal' | 'yellow' | 'red' | 'penalty' | '10m' | 'end';
    minute: number;
    playerId?: string;
    teamId?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Technologies

- Node.js
- Express.js
- TypeScript
- PostgreSQL with TypeORM
- CORS for cross-origin requests 