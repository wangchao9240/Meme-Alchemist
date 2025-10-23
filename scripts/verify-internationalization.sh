#!/bin/bash

# Verify Internationalization Script
# This script checks if all Chinese text has been removed from src directories

echo "🌍 Verifying Internationalization..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check for Chinese characters
check_chinese() {
    local dir=$1
    local name=$2
    
    echo "Checking $name..."
    
    # Search for Chinese characters in .ts, .tsx, .js, .jsx files
    # Exclude node_modules, dist, .next, .wrangler
    results=$(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -path "*/.next/*" \
        -not -path "*/.wrangler/*" \
        -exec grep -l -P "[\p{Han}]" {} \; 2>/dev/null)
    
    if [ -z "$results" ]; then
        echo -e "${GREEN}✓ No Chinese characters found in $name${NC}"
        return 0
    else
        echo -e "${RED}✗ Chinese characters found in $name:${NC}"
        echo "$results"
        return 1
    fi
}

# Check directories
frontend_ok=0
backend_ok=0
shared_ok=0

check_chinese "./frontend/components" "Frontend Components"
frontend_ok=$?

check_chinese "./frontend/app" "Frontend App"
frontend_ok=$((frontend_ok + $?))

check_chinese "./backend/src" "Backend Source"
backend_ok=$?

check_chinese "./packages/shared" "Shared Package"
shared_ok=$?

echo ""
echo "================================"
echo "Summary:"
echo "================================"

if [ $frontend_ok -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend: Clean${NC}"
else
    echo -e "${RED}✗ Frontend: Contains Chinese${NC}"
fi

if [ $backend_ok -eq 0 ]; then
    echo -e "${GREEN}✓ Backend: Clean${NC}"
else
    echo -e "${RED}✗ Backend: Contains Chinese${NC}"
fi

if [ $shared_ok -eq 0 ]; then
    echo -e "${GREEN}✓ Shared: Clean${NC}"
else
    echo -e "${RED}✗ Shared: Contains Chinese${NC}"
fi

echo ""

# Overall result
total=$((frontend_ok + backend_ok + shared_ok))
if [ $total -eq 0 ]; then
    echo -e "${GREEN}🎉 Internationalization Complete!${NC}"
    echo "All source code is now in English."
    exit 0
else
    echo -e "${YELLOW}⚠️  Some files still contain Chinese characters.${NC}"
    echo "Please review the files listed above."
    exit 1
fi

