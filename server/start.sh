#!/bin/bash

# AFOCE Backend - Quick Start Script
# This script helps you quickly perform common operations

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main menu
show_menu() {
    echo ""
    print_header "AFOCE Backend - Quick Start"
    echo "1. 🚀 Setup Development Environment"
    echo "2. 📦 Install Dependencies"
    echo "3. 🔧 Setup Database (Prisma)"
    echo "4. 🏃 Start Development Server"
    echo "5. 🏗️  Build for Production"
    echo "6. 🐳 Docker - Start All Services"
    echo "7. 🐳 Docker - Stop All Services"
    echo "8. 🧪 Run Tests"
    echo "9. 📊 Run Tests with Coverage"
    echo "10. 🗄️  Open Prisma Studio"
    echo "11. 🔍 Check Health"
    echo "12. 📚 Open API Documentation"
    echo "13. 🧹 Clean Build Artifacts"
    echo "14. 📝 View Logs (Docker)"
    echo "0. ❌ Exit"
    echo ""
    read -p "Select an option: " choice
}

# Option handlers
setup_dev_env() {
    print_header "Setting Up Development Environment"
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 20+"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm not found"
        exit 1
    fi
    
    # Check Docker
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker installed: $DOCKER_VERSION"
    else
        print_warning "Docker not found (optional for development)"
    fi
    
    # Check .env file
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        read -p "Create from template? (y/n): " create_env
        if [ "$create_env" = "y" ]; then
            if [ -f .env.docker ]; then
                cp .env.docker .env
                print_success "Created .env from template"
                print_warning "Please edit .env and set secure values!"
            else
                print_error "No template found"
            fi
        fi
    else
        print_success ".env file exists"
    fi
    
    print_success "Environment check complete!"
}

install_deps() {
    print_header "Installing Dependencies"
    npm install
    print_success "Dependencies installed!"
}

setup_database() {
    print_header "Setting Up Database"
    
    print_warning "Generating Prisma Client..."
    npx prisma generate
    
    print_warning "Running migrations..."
    npx prisma migrate dev
    
    read -p "Seed database with test data? (y/n): " seed_choice
    if [ "$seed_choice" = "y" ]; then
        npm run seed
        print_success "Database seeded!"
    fi
    
    print_success "Database setup complete!"
}

start_dev() {
    print_header "Starting Development Server"
    npm run dev
}

build_prod() {
    print_header "Building for Production"
    npm run build
    print_success "Build complete! Output in ./dist"
}

docker_start() {
    print_header "Starting Docker Services"
    
    if [ ! -f docker-compose.yml ]; then
        print_error "docker-compose.yml not found"
        exit 1
    fi
    
    docker-compose up -d
    print_success "Services started!"
    
    echo ""
    print_warning "Waiting for services to be healthy..."
    sleep 5
    
    docker-compose ps
    
    echo ""
    print_success "Services running:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - API: http://localhost:5000/api"
    echo "  - Docs: http://localhost:5000/api-docs"
}

docker_stop() {
    print_header "Stopping Docker Services"
    docker-compose down
    print_success "Services stopped!"
}

run_tests() {
    print_header "Running Tests"
    npm test
}

run_coverage() {
    print_header "Running Tests with Coverage"
    npm run test:coverage
    print_success "Coverage report generated in ./coverage"
}

prisma_studio() {
    print_header "Opening Prisma Studio"
    print_warning "Prisma Studio will open at http://localhost:5555"
    npx prisma studio
}

check_health() {
    print_header "Checking Server Health"
    
    if command_exists curl; then
        response=$(curl -s http://localhost:5000/api/health || echo "ERROR")
        if [ "$response" != "ERROR" ]; then
            echo "$response" | jq . 2>/dev/null || echo "$response"
            print_success "Server is healthy!"
        else
            print_error "Server is not responding"
        fi
    else
        print_warning "curl not found. Visit: http://localhost:5000/api/health"
    fi
}

open_docs() {
    print_header "Opening API Documentation"
    
    URL="http://localhost:5000/api-docs"
    
    if command_exists xdg-open; then
        xdg-open "$URL"
    elif command_exists open; then
        open "$URL"
    else
        print_warning "Please open: $URL"
    fi
}

clean_build() {
    print_header "Cleaning Build Artifacts"
    
    rm -rf dist
    rm -rf node_modules/.cache
    rm -rf coverage
    
    print_success "Build artifacts cleaned!"
}

view_logs() {
    print_header "Viewing Docker Logs"
    docker-compose logs -f
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1) setup_dev_env ;;
        2) install_deps ;;
        3) setup_database ;;
        4) start_dev ;;
        5) build_prod ;;
        6) docker_start ;;
        7) docker_stop ;;
        8) run_tests ;;
        9) run_coverage ;;
        10) prisma_studio ;;
        11) check_health ;;
        12) open_docs ;;
        13) clean_build ;;
        14) view_logs ;;
        0) 
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid option"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
