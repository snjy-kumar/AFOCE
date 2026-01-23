#!/bin/bash

# Redis Installation & Setup Script for AFOCE Backend
# This fixes the "ECONNREFUSED 127.0.0.1:6379" error

set -e

echo "🔍 Checking Redis installation..."

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is already installed"
    redis-server --version
else
    echo "❌ Redis is not installed"
    echo "📦 Installing Redis..."
    
    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        echo "❌ Cannot detect OS"
        exit 1
    fi
    
    # Install based on OS
    case $OS in
        ubuntu|debian)
            echo "Installing Redis on Ubuntu/Debian..."
            sudo apt update
            sudo apt install redis-server -y
            ;;
        fedora|rhel|centos)
            echo "Installing Redis on Fedora/RHEL/CentOS..."
            sudo dnf install redis -y
            ;;
        arch|manjaro)
            echo "Installing Redis on Arch/Manjaro..."
            sudo pacman -S redis --noconfirm
            ;;
        *)
            echo "❌ Unsupported OS: $OS"
            echo "Please install Redis manually:"
            echo "  • Ubuntu/Debian: sudo apt install redis-server"
            echo "  • Fedora/RHEL: sudo dnf install redis"
            echo "  • Arch: sudo pacman -S redis"
            echo "  • Docker: docker run -d -p 6379:6379 redis:alpine"
            exit 1
            ;;
    esac
fi

# Check if Redis is running
echo ""
echo "🔍 Checking if Redis is running..."

if redis-cli ping &> /dev/null; then
    echo "✅ Redis is already running"
else
    echo "⚠️  Redis is not running. Starting Redis..."
    
    # Try systemd first
    if command -v systemctl &> /dev/null; then
        echo "Starting Redis with systemd..."
        sudo systemctl start redis-server 2>/dev/null || sudo systemctl start redis
        sudo systemctl enable redis-server 2>/dev/null || sudo systemctl enable redis
        echo "✅ Redis started with systemd"
    else
        # Fallback to manual start
        echo "Starting Redis manually..."
        redis-server --daemonize yes
        echo "✅ Redis started in daemon mode"
    fi
    
    # Wait for Redis to start
    sleep 2
fi

# Test Redis connection
echo ""
echo "🧪 Testing Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is responding"
    echo ""
    echo "Redis Information:"
    redis-cli INFO server | grep -E "redis_version|os|uptime"
else
    echo "❌ Redis is not responding"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if Redis is running: ps aux | grep redis"
    echo "2. Check Redis logs: journalctl -u redis-server -n 50"
    echo "3. Try starting manually: redis-server"
    exit 1
fi

echo ""
echo "🎉 Redis is ready!"
echo ""
echo "Now you can start the backend:"
echo "  cd /home/sanjay/projects/accounting-web-app/server"
echo "  npm run dev"
echo ""
echo "Redis commands:"
echo "  • Check status: redis-cli ping"
echo "  • Stop: sudo systemctl stop redis-server"
echo "  • Restart: sudo systemctl restart redis-server"
echo "  • Monitor: redis-cli MONITOR"
