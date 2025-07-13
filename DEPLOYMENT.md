# Skalice Futsal Tournament App - Deployment Guide

## Overview
This guide will help you deploy the Skalice Futsal Tournament application to production. The app consists of:
- **Backend API** (Node.js/Express/TypeORM)
- **Client App** (React/Vite)
- **Admin App** (React/Vite)
- **Database** (Neon PostgreSQL)

## 1. Database Setup (Neon PostgreSQL)

Your database is already set up with Neon PostgreSQL:
```
postgresql://neondb_owner:npg_uC0zRgA9EQro@ep-late-cloud-a27v7815-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 2. Backend API Deployment

### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Connect your GitHub repository
4. Set the root directory to `/api`
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_uC0zRgA9EQro@ep-late-cloud-a27v7815-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NODE_ENV=production
   PORT=3001
   ```

### Option B: Render
1. Go to [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the root directory to `/api`
5. Build command: `npm install && npm run build`
6. Start command: `npm start`
7. Add environment variables (same as above)

### Option C: Heroku
1. Install Heroku CLI
2. Create a new Heroku app
3. Add PostgreSQL addon
4. Set environment variables:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_uC0zRgA9EQro@ep-late-cloud-a27v7815-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NODE_ENV=production
   ```

## 3. Client App Deployment (Vercel)

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Set the root directory to `/client-app`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   VITE_WS_URL=wss://your-api-domain.com
   VITE_CONTENTFUL_SPACE_ID=your_contentful_space_id
   VITE_CONTENTFUL_ACCESS_TOKEN=your_contentful_access_token
   VITE_CONTENTFUL_ENVIRONMENT=master
   VITE_CONTENTFUL_CONTENT_TYPE=article
   VITE_CONTENTFUL_TITLE_FIELD=title
   VITE_CONTENTFUL_CONTENT_FIELD=content
   VITE_CONTENTFUL_IMAGE_FIELD=images
   VITE_CONTENTFUL_FEATURED_IMAGE_FIELD=feturedImage
   VITE_CONTENTFUL_DOCUMENTS_FIELD=documents
   ```

## 4. Admin App Deployment (Vercel)

1. Create another Vercel project
2. Set the root directory to `/admin-app`
3. Add environment variables:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   VITE_WS_URL=wss://your-api-domain.com
   ```

## 5. Environment Variables Reference

### Backend API (.env)
```env
DATABASE_URL=postgresql://neondb_owner:npg_uC0zRgA9EQro@ep-late-cloud-a27v7815-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3001
```

### Client App (.env)
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-api-domain.com
VITE_CONTENTFUL_SPACE_ID=your_contentful_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_contentful_access_token
VITE_CONTENTFUL_ENVIRONMENT=master
VITE_CONTENTFUL_CONTENT_TYPE=article
VITE_CONTENTFUL_TITLE_FIELD=title
VITE_CONTENTFUL_CONTENT_FIELD=content
VITE_CONTENTFUL_IMAGE_FIELD=images
VITE_CONTENTFUL_FEATURED_IMAGE_FIELD=feturedImage
VITE_CONTENTFUL_DOCUMENTS_FIELD=documents
```

### Admin App (.env)
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-api-domain.com
```

## 6. Deployment Steps

### Step 1: Deploy Backend API
1. Choose your deployment platform (Railway/Render/Heroku)
2. Set environment variables
3. Deploy and get the API URL

### Step 2: Deploy Client App
1. Deploy to Vercel
2. Set environment variables with your API URL
3. Get the client app URL

### Step 3: Deploy Admin App
1. Deploy to Vercel
2. Set environment variables with your API URL
3. Get the admin app URL

### Step 4: Test Everything
1. Test API endpoints
2. Test client app functionality
3. Test admin app functionality
4. Test WebSocket connections

## 7. Post-Deployment Checklist

- [ ] API is responding to requests
- [ ] Database connection is working
- [ ] Client app can fetch data from API
- [ ] Admin app can manage data
- [ ] WebSocket connections work
- [ ] Contentful integration works
- [ ] All features are functional

## 8. Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure your API allows requests from your client domains
2. **Database connection**: Verify DATABASE_URL is correct
3. **Environment variables**: Double-check all VITE_ variables are set
4. **WebSocket**: Ensure WS_URL uses wss:// for production

### Support:
- Check deployment platform logs for errors
- Verify environment variables are set correctly
- Test API endpoints individually
- Check browser console for client-side errors 