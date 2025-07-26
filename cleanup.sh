#!/bin/bash

# Samna Salta Webapp - Project Cleanup Script
# This script cleans up the project by removing temporary files, cleaning builds, and organizing the structure

set -e

echo "🧹 Starting project cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Remove temporary and backup files
print_status "Removing temporary and backup files..."
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name "*.bak" -delete 2>/dev/null || true
find . -name "*.backup" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
print_success "Temporary files removed"

# 2. Clean build directories
print_status "Cleaning build directories..."
rm -rf apps/frontend/build 2>/dev/null || true
rm -rf apps/backend/dist 2>/dev/null || true
rm -rf packages/common/dist 2>/dev/null || true
rm -rf coverage 2>/dev/null || true
rm -rf apps/frontend/coverage 2>/dev/null || true
print_success "Build directories cleaned"

# 3. Clean node_modules (optional - uncomment if needed)
# print_status "Cleaning node_modules..."
# rm -rf node_modules 2>/dev/null || true
# rm -rf apps/*/node_modules 2>/dev/null || true
# rm -rf packages/*/node_modules 2>/dev/null || true
# print_success "node_modules cleaned"

# 4. Clean logs
print_status "Cleaning log files..."
find . -name "*.log" -delete 2>/dev/null || true
rm -rf apps/backend/logs/* 2>/dev/null || true
print_success "Log files cleaned"

# 5. Clean cache directories
print_status "Cleaning cache directories..."
rm -rf .cache 2>/dev/null || true
rm -rf .parcel-cache 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf apps/frontend/.cache 2>/dev/null || true
print_success "Cache directories cleaned"

# 6. Clean test artifacts
print_status "Cleaning test artifacts..."
rm -rf test-results 2>/dev/null || true
rm -rf playwright-report 2>/dev/null || true
rm -rf playwright/.cache 2>/dev/null || true
rm -rf storybook-static 2>/dev/null || true
print_success "Test artifacts cleaned"

# 7. Clean TypeScript build info
print_status "Cleaning TypeScript build info..."
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
print_success "TypeScript build info cleaned"

# 8. Clean package-lock files (optional - uncomment if needed)
# print_status "Cleaning package-lock files..."
# rm -f package-lock.json 2>/dev/null || true
# rm -f apps/*/package-lock.json 2>/dev/null || true
# rm -f packages/*/package-lock.json 2>/dev/null || true
# print_success "Package-lock files cleaned"

# 9. Clean environment files (except examples)
print_status "Cleaning environment files..."
find . -name ".env" ! -name ".env.example" -delete 2>/dev/null || true
find . -name ".env.local" -delete 2>/dev/null || true
find . -name ".env.development.local" -delete 2>/dev/null || true
find . -name ".env.test.local" -delete 2>/dev/null || true
find . -name ".env.production.local" -delete 2>/dev/null || true
print_success "Environment files cleaned"

# 10. Clean IDE and editor files
print_status "Cleaning IDE and editor files..."
rm -rf .vscode 2>/dev/null || true
rm -rf .idea 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
print_success "IDE files cleaned"

# 11. Clean SSL certificates
print_status "Cleaning SSL certificates..."
find . -name "*.pem" -delete 2>/dev/null || true
find . -name "*.key" -delete 2>/dev/null || true
find . -name "*.crt" -delete 2>/dev/null || true
print_success "SSL certificates cleaned"

# 12. Clean Docker artifacts
print_status "Cleaning Docker artifacts..."
docker system prune -f 2>/dev/null || print_warning "Docker not available or no containers to clean"
print_success "Docker artifacts cleaned"

# 13. Clean npm cache
print_status "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || print_warning "npm cache clean failed"
print_success "npm cache cleaned"

# 14. Check for large files
print_status "Checking for large files (>10MB)..."
find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | head -10 | while read file; do
    print_warning "Large file found: $file ($(du -h "$file" | cut -f1))"
done

# 15. Check for TODO comments
print_status "Checking for TODO comments..."
TODO_COUNT=$(grep -r "TODO" . --exclude-dir=node_modules --exclude-dir=.git --exclude=cleanup.sh | wc -l)
print_warning "Found $TODO_COUNT TODO comments in the codebase"

# 16. Check for console.log statements
print_status "Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console\.log" . --exclude-dir=node_modules --exclude-dir=.git --exclude=cleanup.sh | wc -l)
print_warning "Found $CONSOLE_COUNT console.log statements in the codebase"

# 17. Generate cleanup report
print_status "Generating cleanup report..."
CLEANUP_REPORT="CLEANUP_REPORT_$(date +%Y%m%d_%H%M%S).txt"

cat > "$CLEANUP_REPORT" << EOF
Samna Salta Webapp - Cleanup Report
Generated on: $(date)

Summary:
- TODO comments found: $TODO_COUNT
- Console.log statements found: $CONSOLE_COUNT

Files cleaned:
- Temporary files (*.tmp, *.temp, *.bak, *.backup, *~)
- Build directories (build/, dist/, coverage/)
- Cache directories (.cache, .parcel-cache, .turbo)
- Log files (*.log)
- Test artifacts (test-results/, playwright-report/)
- TypeScript build info (*.tsbuildinfo)
- Environment files (.env, .env.local, etc.)
- IDE files (.vscode/, .idea/, *.swp, *.swo)
- SSL certificates (*.pem, *.key, *.crt)

Recommendations:
1. Review and address TODO comments
2. Remove console.log statements from production code
3. Consider implementing proper logging
4. Review large files for optimization
5. Update .gitignore if needed

EOF

print_success "Cleanup report generated: $CLEANUP_REPORT"

# 18. Final status
print_status "Cleanup completed successfully! 🎉"
print_status "Next steps:"
echo "  1. Review the cleanup report: $CLEANUP_REPORT"
echo "  2. Address TODO comments"
echo "  3. Remove console.log statements"
echo "  4. Run 'npm install' if you cleaned node_modules"
echo "  5. Test the application"

print_success "Project cleanup completed! ✨" 