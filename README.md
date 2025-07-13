# Skalice Futsal Tournament App

A modern futsal tournament management system with real-time updates, content management, and responsive design.

## 🚀 Quick Deploy

1. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

2. **Follow the deployment guide:**
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment instructions

## 📁 Project Structure

```
Skalice/
├── api/                 # Backend API (Node.js/Express/TypeORM)
├── client-app/          # Public client app (React/Vite)
├── admin-app/           # Admin panel (React/Vite)
├── DEPLOYMENT.md        # Detailed deployment guide
├── deploy.sh           # Deployment script
└── README.md           # This file
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeORM** for database management
- **PostgreSQL** (Neon) for data storage
- **WebSocket** for real-time updates

### Frontend
- **React** with **TypeScript**
- **Vite** for fast development
- **Material-UI** for components
- **Contentful** for content management

## 🌐 Live Features

- **Real-time match updates** via WebSocket
- **Content management** with Contentful integration
- **Responsive design** for mobile and desktop
- **Admin panel** for tournament management
- **Image gallery** with modal viewer
- **Document management**

## 🔧 Environment Variables

### Backend API
```env
DATABASE_URL=postgresql://neondb_owner:npg_uC0zRgA9EQro@ep-late-cloud-a27v7815-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3001
```

### Client App
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-api-domain.com
VITE_CONTENTFUL_SPACE_ID=your_contentful_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_contentful_access_token
# ... other Contentful variables
```

## 📖 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [API Documentation](./api/README.md) - Backend API documentation

## 🚀 Deployment Platforms

- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel or Netlify
- **Database**: Neon PostgreSQL (already configured)

## 📞 Support

For deployment issues, check:
1. Environment variables are set correctly
2. Database connection is working
3. API endpoints are responding
4. WebSocket connections are established

## 🎯 Next Steps

After deployment:
1. Test all features
2. Configure Contentful content model
3. Add initial tournament data
4. Set up admin accounts
5. Configure custom domain (optional) 