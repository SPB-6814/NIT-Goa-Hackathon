#!/bin/bash

# 🚀 Deployment Helper Script for NIT Goa Hackathon Platform

echo "🎯 Starting deployment preparation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if git is initialized
echo "📋 Step 1: Checking Git status..."
if [ -d .git ]; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${RED}❌ Git not initialized. Run: git init${NC}"
    exit 1
fi

# Step 2: Check for uncommitted changes
echo ""
echo "📋 Step 2: Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

# Step 3: Test build
echo ""
echo "📋 Step 3: Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
fi

# Step 4: Check environment variables
echo ""
echo "📋 Step 4: Checking environment variables..."
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
    echo ""
    echo "📝 Environment variables to add to Vercel:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    grep "VITE_" .env | while read -r line; do
        var_name=$(echo "$line" | cut -d '=' -f 1)
        echo "   - $var_name"
    done
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

# Step 5: Check if .env is in .gitignore
echo ""
echo "📋 Step 5: Checking .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ .env is in .gitignore${NC}"
else
    echo -e "${RED}❌ WARNING: .env is NOT in .gitignore!${NC}"
    echo "   Add it to prevent exposing secrets"
fi

# Step 6: Remote repository check
echo ""
echo "📋 Step 6: Checking Git remote..."
if git remote -v | grep -q origin; then
    echo -e "${GREEN}✅ Git remote configured:${NC}"
    git remote -v | head -2
else
    echo -e "${RED}❌ No Git remote configured${NC}"
    echo "   Run: git remote add origin <your-github-repo-url>"
fi

# Step 7: Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Deployment Readiness Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Go to: https://vercel.com"
echo "3. Click 'Import Project'"
echo "4. Select your repository"
echo "5. Add environment variables (listed above)"
echo "6. Click 'Deploy'"
echo ""
echo "📖 Full guide: DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}🎉 Ready to deploy!${NC}"
