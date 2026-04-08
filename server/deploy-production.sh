#!/bin/bash
# Production Deployment Script
# Run this script to deploy to production environment

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║   AFOCE - Production Deployment                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo "Copy .env.production.example to .env.production and fill in values"
    exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js version: $(node -v)"

# Check if database is accessible
echo -n "  Checking database connection... "
if npm run db:check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Database not accessible${NC}"
    exit 1
fi

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --production=false

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Build TypeScript
echo "🔨 Building application..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not created${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Build successful"

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests

# Check for vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
npm audit --audit-level=high

# Create uploads directory if it doesn't exist
echo "📁 Setting up file directories..."
mkdir -p uploads/{logos,receipts,invoices,attachments,temp}
chmod 755 uploads
echo -e "${GREEN}✓${NC} Directories created"

# Backup database before deployment (optional)
if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
    echo "💾 Creating database backup..."
    npm run db:backup
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✓ Production deployment ready                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Review .env.production settings"
echo "2. Start server with: npm start"
echo "3. Or use PM2: pm2 start ecosystem.config.js --env production"
echo ""
