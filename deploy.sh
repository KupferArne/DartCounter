#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment process...${NC}"

# Ensure we're on the main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo -e "${BLUE}Switching to main branch...${NC}"
    git checkout main
fi

# Save any uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${BLUE}You have uncommitted changes. Please commit or stash them first.${NC}"
    exit 1
fi

# Switch to gh-pages branch
echo -e "${BLUE}Switching to gh-pages branch...${NC}"
git checkout gh-pages

# Get the latest web files from main
echo -e "${BLUE}Updating files from main branch...${NC}"
git checkout main -- web

# Move files to root
echo -e "${BLUE}Moving files to root directory...${NC}"
mv web/* .
rm -rf web

# Add and commit changes
echo -e "${BLUE}Committing changes...${NC}"
git add .
git commit -m "Update deployment $(date +'%Y-%m-%d %H:%M:%S')"

# Push to GitHub
echo -e "${BLUE}Pushing to GitHub...${NC}"
git push origin gh-pages

# Switch back to main branch
echo -e "${BLUE}Switching back to main branch...${NC}"
git checkout main

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your site will be available at: https://kupferarne.github.io/DartCounter/${NC}"
echo -e "${BLUE}Note: It may take a few minutes for the changes to be visible.${NC}" 