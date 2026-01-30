# 🎯 Appointment & Queue Tracking System

> A modern, AI-powered online appointment booking system with real-time queue tracking, inspired by BookMyShow.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)

## ✨ Features

### 🎨 Frontend Features
- **Modern UI/UX**: Dark theme with gradient accents and smooth animations
- **Smart Search**: Intelligent search across services, providers, and categories
- **AI Recommendations**: Personalized service suggestions based on user history
- **Real-time Queue Tracking**: Live updates of queue position and wait times
- **Category Browsing**: Easy navigation through service categories
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Booking Management**: View and manage upcoming, past, and cancelled appointments

### ⚙️ Backend Features
- **RESTful API**: Clean, well-documented API with FastAPI
- **Real-time Updates**: WebSocket support for live queue tracking
- **AI-Powered Recommendations**: Smart suggestions based on user preferences
- **Queue Management**: Efficient queue handling with position tracking
- **Analytics**: Comprehensive analytics for users and providers
- **Authentication**: Secure JWT-based authentication
- **Database Support**: SQLAlchemy ORM with support for PostgreSQL, MySQL, SQLite

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Home   │  │ Providers│  │  Booking │  │   Queue  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Providers│  │Appointments│ │Analytics │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Services │  │  Queue   │  │AI Recomm.│                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │    Database     │
                │  (PostgreSQL)   │
                └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- PostgreSQL (or SQLite for development)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd appointment-system
```

2. **Run the setup script**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Start the application**
```bash
./start.sh
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📂 Project Structure

```
appointment-system/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Application entry point
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── providers.py
│   │   │   ├── services.py
│   │   │   ├── appointments.py
│   │   │   ├── recommendations.py
│   │   │   ├── analytics.py
│   │   │   └── websocket.py
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── database.py        # Database connection
│   ├── tests/                 # Backend tests
│   ├── requirements.txt
│   └── .env
│
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── AppointmentSystem.jsx
│   │   ├── services/
│   │   │   └── api-service.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── docs/                       # Documentation
├── setup.sh                    # Setup script
├── start.sh                    # Start script
├── INTEGRATION_GUIDE.md        # Integration guide
└── README.md                   # This file
```

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/appointment_db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Providers
- `GET /api/v1/providers` - List all providers
- `GET /api/v1/providers/{id}` - Get provider details
- `GET /api/v1/providers/search` - Search providers
- `GET /api/v1/providers/{id}/availability` - Get availability
- `GET /api/v1/providers/{id}/queue` - Get queue status

### Appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/user/{user_id}` - Get user appointments
- `PUT /api/v1/appointments/{id}` - Update appointment
- `POST /api/v1/appointments/{id}/cancel` - Cancel appointment
- `POST /api/v1/appointments/{id}/reschedule` - Reschedule

### Recommendations
- `GET /api/v1/recommendations/user/{user_id}` - Get personalized recommendations
- `GET /api/v1/recommendations/trending` - Get trending services

Full API documentation available at: http://localhost:8000/docs

## 🎨 Design System

### Colors
- Primary: `#FFE66D` (Yellow)
- Secondary: `#FF6B6B` (Red)
- Accent: `#4ECDC4` (Teal)
- Background: `#0a0a0a` - `#1a1a2e` (Dark gradient)

### Typography
- Font Family: Outfit (Google Fonts)
- Weights: 300, 400, 500, 600, 700, 800

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment (Docker)
```bash
cd backend
docker build -t appointment-backend .
docker run -p 8000:8000 appointment-backend
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build folder to your hosting service
```

## 📊 Database Schema

### Main Tables
- **users**: User accounts and profiles
- **providers**: Service providers (clinics, salons, etc.)
- **services**: Available services
- **appointments**: Booked appointments
- **queue**: Real-time queue management
- **recommendations**: AI-generated recommendations
- **analytics**: User and provider analytics

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy ORM
- Rate limiting (configurable)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by BookMyShow's UI/UX
- Built with FastAPI and React
- Icons by Lucide React

## 📞 Support

For support, email support@example.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Payment gateway integration
- [ ] Email/SMS notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Provider mobile app
- [ ] Video consultation support
- [ ] Calendar integration

---

**Made with ❤️ by Your Team**
