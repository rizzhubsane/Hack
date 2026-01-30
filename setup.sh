#!/bin/bash

# Appointment System - Quick Setup Script
# This script sets up both frontend and backend for development

echo "🚀 Setting up Appointment & Queue Tracking System..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "setup.sh" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# ============================================
# BACKEND SETUP
# ============================================

echo -e "${BLUE}🔧 Setting up Backend...${NC}"

cd backend || exit

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
# Database
DATABASE_URL=sqlite:///./appointment.db

# Security
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000

# Redis (optional - for queue management)
REDIS_URL=redis://localhost:6379

# Server
API_VERSION=v1
EOF
    echo -e "${GREEN}✅ Backend .env created${NC}"
fi

# Initialize database
echo "Initializing database..."
python3 << EOF
from app.database import engine, Base
from app.models import appointment, user  # Import all models

Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
EOF

cd ..
echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# ============================================
# FRONTEND SETUP
# ============================================

echo -e "${BLUE}🎨 Setting up Frontend...${NC}"

cd frontend || exit

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Install required packages
npm install lucide-react

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000/api/v1
EOF
    echo -e "${GREEN}✅ Frontend .env created${NC}"
fi

cd ..
echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# ============================================
# CREATE START SCRIPT
# ============================================

echo -e "${BLUE}📝 Creating start script...${NC}"

cat > start.sh << 'EOF'
#!/bin/bash

# Start script for Appointment System

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Appointment System...${NC}"
echo ""

# Start backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}Starting Frontend Server...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Both servers started!${NC}"
echo ""
echo "📡 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start.sh

echo -e "${GREEN}✅ Start script created${NC}"
echo ""

# ============================================
# FINAL INSTRUCTIONS
# ============================================

echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo "  ./start.sh"
echo ""
echo -e "${BLUE}Or start manually:${NC}"
echo ""
echo "  Backend:"
echo "    cd backend"
echo "    source venv/bin/activate"
echo "    uvicorn app.main:app --reload"
echo ""
echo "  Frontend:"
echo "    cd frontend"
echo "    npm start"
echo ""
echo -e "${BLUE}Access points:${NC}"
echo "  📡 Backend API: http://localhost:8000"
echo "  📚 API Docs: http://localhost:8000/docs"
echo "  🎨 Frontend: http://localhost:3000"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
