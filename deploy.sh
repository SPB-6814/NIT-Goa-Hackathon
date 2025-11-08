#!/bin/bash

# 🚀 Quick Deployment Helper Script
# This script helps prepare your project for Vercel deployment

echo "🚀 NIT Goa Hackathon - Vercel Deployment Helper"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check for .gitignore
if [ ! -f .gitignore ]; then
    echo "⚠️  Warning: No .gitignore found!"
else
    # Check if .env is in gitignore
    if grep -q "^\.env$" .gitignore; then
        echo "✅ .env file is properly ignored"
    else
        echo "⚠️  Warning: .env might not be ignored!"
        echo "   Add '.env' to your .gitignore file"
    fi
fi

# Test build
echo ""
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo ""
echo "📋 Pre-Deployment Checklist:"
echo "=============================="
echo ""
echo "Before deploying, make sure you have:"
echo ""
echo "1. ✓ Supabase URL and Key (already in .env.example)"
echo "2. ⚠ Gemini API Key - Get from: https://aistudio.google.com/app/apikey"
echo ""
echo "Environment Variables Needed in Vercel:"
echo "---------------------------------------"
echo "• VITE_SUPABASE_URL"
echo "• VITE_SUPABASE_PUBLISHABLE_KEY"
echo "• VITE_GEMINI_API_KEY"
echo ""
echo "📚 Next Steps:"
echo "=============="
echo ""
echo "Option 1: Deploy via Vercel Dashboard (Easiest)"
echo "------------------------------------------------"
echo "1. Push code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Visit: https://vercel.com/new"
echo "3. Import your GitHub repository"
echo "4. Add environment variables"
echo "5. Click Deploy!"
echo ""
echo "Option 2: Deploy via Vercel CLI"
echo "--------------------------------"
echo "1. Install CLI: npm install -g vercel"
echo "2. Login: vercel login"
echo "3. Deploy: vercel"
echo "4. Add env vars: vercel env add VITE_GEMINI_API_KEY"
echo "5. Deploy to prod: vercel --prod"
echo ""
echo "📖 Full guide: See VERCEL_DEPLOYMENT.md"
echo ""
echo "✨ Your project is ready for deployment!"
