#!/bin/bash
# ============================================
# LAZXR — Git + Netlify Setup Script
# Run this from inside the lazxr-site folder
# ============================================

set -e

echo "🚀 LAZXR Git Setup"
echo "===================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Install it first:"
    echo "   Mac: brew install git"
    echo "   Windows: https://git-scm.com/download/win"
    exit 1
fi

# Check if GitHub CLI is available (optional)
HAS_GH=false
if command -v gh &> /dev/null; then
    HAS_GH=true
fi

echo "Step 1: Initializing Git repo..."
git init
git add .
git commit -m "feat: LAZXR site v4 — 3D configurator + multi-product + SEO"

echo ""
echo "Step 2: Creating branches..."
git branch develop
git branch preprod

echo ""
echo "Step 3: Setting up main branch..."
git branch -M main

echo ""
if [ "$HAS_GH" = true ]; then
    echo "Step 4: Creating GitHub repo (via GitHub CLI)..."
    gh repo create lazxr-site --public --source=. --remote=origin --push
    
    echo ""
    echo "Step 5: Pushing all branches..."
    git push -u origin main
    git push -u origin develop
    git push -u origin preprod
else
    echo "Step 4: GitHub CLI not found."
    echo ""
    echo "📋 Manual steps:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Create repo named 'lazxr-site' (Public)"
    echo "   3. DON'T initialize with README (we already have one)"
    echo "   4. Copy the repo URL and run:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/lazxr-site.git"
    echo "   git push -u origin main"
    echo "   git push -u origin develop"
    echo "   git push -u origin preprod"
fi

echo ""
echo "✅ Git setup complete!"
echo ""
echo "📋 Next: Connect to Netlify"
echo "   1. Go to https://app.netlify.com"
echo "   2. 'Add new site' → 'Import an existing project'"
echo "   3. Choose GitHub → Select 'lazxr-site'"
echo "   4. Branch to deploy: main"
echo "   5. Publish directory: . (root)"
echo "   6. Click 'Deploy site'"
echo "   7. Go to Site settings → Domain management"
echo "   8. Add custom domain: lazxr.com"
echo ""
echo "🔄 After Netlify is connected:"
echo "   - Push to main → auto-deploys to lazxr.com"
echo "   - Push to preprod → creates preview URL"
echo "   - Push to develop → creates preview URL"
echo ""
echo "📝 Workflow for new features:"
echo "   git checkout develop"
echo "   git checkout -b feature/my-new-feature"
echo "   # ... make changes ..."
echo "   git add . && git commit -m 'feat: description'"
echo "   git push -u origin feature/my-new-feature"
echo "   # Create PR: feature/my-new-feature → develop"
echo "   # After review: merge develop → preprod"
echo "   # After validation: merge preprod → main (auto-deploy)"
