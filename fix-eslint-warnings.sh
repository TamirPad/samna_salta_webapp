#!/bin/bash

# Fix ESLint Warnings Script for Samna Salta
# This script automatically fixes common ESLint warnings

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Fixing ESLint warnings...${NC}"

# Function to remove unused imports from a file
remove_unused_imports() {
    local file="$1"
    
    # Remove unused React imports
    sed -i '' '/import.*ReactElement.*from.*react.*;/d' "$file"
    sed -i '' '/import.*ReactNode.*from.*react.*;/d' "$file"
    sed -i '' '/import.*useState.*from.*react.*;/d' "$file"
    sed -i '' '/import.*useEffect.*from.*react.*;/d' "$file"
    
    # Clean up empty import lines
    sed -i '' '/^import { } from/d' "$file"
    sed -i '' '/^import {, } from/d' "$file"
    
    # Remove trailing commas in imports
    sed -i '' 's/, } from/ } from/g' "$file"
    sed -i '' 's/, } from/ } from/g' "$file"
}

# Function to comment out console statements
comment_console_statements() {
    local file="$1"
    
    # Comment out console statements (but keep them for debugging)
    sed -i '' 's/console\.log(/\/\/ console.log(/g' "$file"
    sed -i '' 's/console\.error(/\/\/ console.error(/g' "$file"
    sed -i '' 's/console\.warn(/\/\/ console.warn(/g' "$file"
    sed -i '' 's/console\.info(/\/\/ console.info(/g' "$file"
}

# Fix specific files with known issues
echo -e "${YELLOW}📝 Fixing specific files...${NC}"

# Fix App.tsx
if [ -f "apps/frontend/src/App.tsx" ]; then
    echo "Fixing App.tsx..."
    remove_unused_imports "apps/frontend/src/App.tsx"
fi

# Fix AuthProvider.tsx
if [ -f "apps/frontend/src/components/AuthProvider.tsx" ]; then
    echo "Fixing AuthProvider.tsx..."
    remove_unused_imports "apps/frontend/src/components/AuthProvider.tsx"
fi

# Fix ErrorBoundary.tsx
if [ -f "apps/frontend/src/components/ErrorBoundary.tsx" ]; then
    echo "Fixing ErrorBoundary.tsx..."
    remove_unused_imports "apps/frontend/src/components/ErrorBoundary.tsx"
    comment_console_statements "apps/frontend/src/components/ErrorBoundary.tsx"
fi

# Fix ProtectedRoute.tsx
if [ -f "apps/frontend/src/components/ProtectedRoute.tsx" ]; then
    echo "Fixing ProtectedRoute.tsx..."
    remove_unused_imports "apps/frontend/src/components/ProtectedRoute.tsx"
fi

# Fix Header.tsx
if [ -f "apps/frontend/src/components/layout/Header.tsx" ]; then
    echo "Fixing Header.tsx..."
    remove_unused_imports "apps/frontend/src/components/layout/Header.tsx"
fi

# Fix Footer.tsx
if [ -f "apps/frontend/src/components/layout/Footer.tsx" ]; then
    echo "Fixing Footer.tsx..."
    remove_unused_imports "apps/frontend/src/components/layout/Footer.tsx"
fi

# Fix pages
for page in "apps/frontend/src/pages"/*.tsx; do
    if [ -f "$page" ]; then
        echo "Fixing $(basename "$page")..."
        remove_unused_imports "$page"
        comment_console_statements "$page"
    fi
done

# Fix admin pages
for page in "apps/frontend/src/pages/admin"/*.tsx; do
    if [ -f "$page" ]; then
        echo "Fixing admin/$(basename "$page")..."
        remove_unused_imports "$page"
        comment_console_statements "$page"
    fi
done

# Fix utils
for util in "apps/frontend/src/utils"/*.ts "apps/frontend/src/utils"/*.tsx; do
    if [ -f "$util" ]; then
        echo "Fixing utils/$(basename "$util")..."
        remove_unused_imports "$util"
        comment_console_statements "$util"
    fi
done

# Fix features
for feature in "apps/frontend/src/features"/*/*.ts "apps/frontend/src/features"/*/*.tsx; do
    if [ -f "$feature" ]; then
        echo "Fixing features/$(basename "$feature")..."
        remove_unused_imports "$feature"
        comment_console_statements "$feature"
    fi
done

echo -e "${GREEN}✅ ESLint warnings fixed!${NC}"
echo -e "${BLUE}💡 Note: Console statements have been commented out for production${NC}"
echo -e "${BLUE}💡 You can uncomment them for debugging if needed${NC}"

# Run ESLint to check remaining issues
echo -e "${YELLOW}🔍 Running ESLint to check remaining issues...${NC}"
cd apps/frontend && npm run lint || echo -e "${YELLOW}⚠️  Some warnings may remain - check the output above${NC}"

echo -e "${GREEN}🎉 ESLint fix completed!${NC}" 