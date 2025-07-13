#!/bin/bash

echo "🚀 Skalice Futsal Tournament App - Deployment Script"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking project structure..."
if [ ! -d "api" ]; then
    echo "❌ API directory not found"
    exit 1
fi

if [ ! -d "client-app" ]; then
    echo "❌ Client app directory not found"
    exit 1
fi

if [ ! -d "admin-app" ]; then
    echo "❌ Admin app directory not found"
    exit 1
fi

echo "✅ Project structure looks good!"

# Build API
echo "🔨 Building API..."
cd api
npm install
npm run build
cd ..

# Build client app
echo "🔨 Building client app..."
cd client-app
npm install
npm run build
cd ..

# Build admin app
echo "🔨 Building admin app..."
cd admin-app
npm install
npm run build
cd ..

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push"
echo ""
echo "2. Deploy Backend API:"
echo "   - Go to Railway/Render/Heroku"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to '/api'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "3. Deploy Client App:"
echo "   - Go to Vercel"
echo "   - Import your GitHub repo"
echo "   - Set root directory to '/client-app'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "4. Deploy Admin App:"
echo "   - Create another Vercel project"
echo "   - Set root directory to '/admin-app'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 