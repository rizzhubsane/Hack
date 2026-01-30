import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, TrendingUp, Users, Zap, Search, Filter, ChevronRight, Bell, User, Home, BarChart3, Heart, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const AppointmentSystem = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated data
  const categories = [
    { id: 1, name: 'Healthcare', icon: '🏥', color: '#FF6B6B', providers: 245 },
    { id: 2, name: 'Beauty & Spa', icon: '💆', color: '#4ECDC4', providers: 189 },
    { id: 3, name: 'Fitness', icon: '💪', color: '#95E1D3', providers: 156 },
    { id: 4, name: 'Consultation', icon: '👔', color: '#FFE66D', providers: 312 },
    { id: 5, name: 'Automotive', icon: '🚗', color: '#A8E6CF', providers: 98 },
    { id: 6, name: 'Home Services', icon: '🏠', color: '#FFB6B9', providers: 203 },
  ];

  const providers = [
    {
      id: 1,
      name: 'CityHealth Medical Center',
      category: 'Healthcare',
      rating: 4.8,
      reviews: 2341,
      location: 'Downtown, 2.3 km',
      image: '🏥',
      waitTime: 15,
      available: true,
      queueLength: 8,
      services: [
        { id: 1, name: 'General Consultation', duration: 30, price: 500 },
        { id: 2, name: 'Dental Checkup', duration: 45, price: 800 },
        { id: 3, name: 'Eye Examination', duration: 20, price: 600 },
      ]
    },
    {
      id: 2,
      name: 'Glow Spa & Wellness',
      category: 'Beauty & Spa',
      rating: 4.9,
      reviews: 1876,
      location: 'Central Plaza, 1.8 km',
      image: '💆',
      waitTime: 10,
      available: true,
      queueLength: 5,
      services: [
        { id: 4, name: 'Full Body Massage', duration: 60, price: 1500 },
        { id: 5, name: 'Facial Treatment', duration: 45, price: 1200 },
        { id: 6, name: 'Hair Styling', duration: 90, price: 2000 },
      ]
    },
    {
      id: 3,
      name: 'FitZone Training Studio',
      category: 'Fitness',
      rating: 4.7,
      reviews: 987,
      location: 'Sports Complex, 3.1 km',
      image: '💪',
      waitTime: 5,
      available: true,
      queueLength: 3,
      services: [
        { id: 7, name: 'Personal Training', duration: 60, price: 1000 },
        { id: 8, name: 'Yoga Class', duration: 45, price: 500 },
        { id: 9, name: 'Nutrition Consultation', duration: 30, price: 800 },
      ]
    },
  ];

  const timeSlots = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: true },
    { time: '10:00 AM', available: false },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: false },
    { time: '12:00 PM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '03:30 PM', available: false },
    { time: '04:00 PM', available: true },
  ];

  // Simulate live queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueData([
        { position: 1, name: 'John D.', status: 'in-service', eta: 'Now' },
        { position: 2, name: 'Sarah M.', status: 'waiting', eta: '5 min' },
        { position: 3, name: 'Mike R.', status: 'waiting', eta: '15 min' },
        { position: 4, name: 'You', status: 'waiting', eta: '25 min', highlight: true },
        { position: 5, name: 'Emma L.', status: 'waiting', eta: '35 min' },
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // AI Recommendations simulation
  useEffect(() => {
    setRecommendations([
      {
        id: 1,
        provider: 'Glow Spa & Wellness',
        service: 'Facial Treatment',
        reason: 'Based on your previous visits',
        discount: 20,
        priority: 'high'
      },
      {
        id: 2,
        provider: 'CityHealth Medical Center',
        service: 'Health Checkup',
        reason: 'Due for annual checkup',
        discount: 15,
        priority: 'medium'
      },
      {
        id: 3,
        provider: 'FitZone Training Studio',
        service: 'Personal Training',
        reason: 'Popular in your area',
        discount: 10,
        priority: 'low'
      },
    ]);
  }, []);

  // Home View
  const HomeView = () => (
    <div className="home-view">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Book Smarter,
            <br />
            <span className="gradient-text">Wait Less</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered appointments with real-time queue tracking
          </p>
          
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for services, providers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">
              <Sparkles size={18} />
              Search
            </button>
          </div>

          <div className="quick-stats">
            <div className="stat">
              <TrendingUp size={20} />
              <div>
                <div className="stat-value">50K+</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            <div className="stat">
              <Users size={20} />
              <div>
                <div className="stat-value">1,200+</div>
                <div className="stat-label">Providers</div>
              </div>
            </div>
            <div className="stat">
              <Zap size={20} />
              <div>
                <div className="stat-value">5 min</div>
                <div className="stat-label">Avg Wait Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Sparkles size={24} />
              AI Recommendations
            </h2>
            <p className="section-subtitle">Personalized suggestions just for you</p>
          </div>
        </div>

        <div className="recommendations-grid">
          {recommendations.map((rec) => (
            <div key={rec.id} className={`recommendation-card priority-${rec.priority}`}>
              <div className="rec-badge">{rec.discount}% OFF</div>
              <div className="rec-icon">
                <Sparkles size={32} />
              </div>
              <h3>{rec.service}</h3>
              <p className="rec-provider">{rec.provider}</p>
              <p className="rec-reason">{rec.reason}</p>
              <button className="rec-btn" onClick={() => setCurrentView('providers')}>
                Book Now
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Browse Categories</h2>
          <p className="section-subtitle">Find the perfect service for your needs</p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              style={{ '--category-color': category.color }}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentView('providers');
              }}
            >
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{category.providers} providers</p>
              <div className="category-arrow">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon" style={{ background: '#FFE66D' }}>
              <Zap size={28} />
            </div>
            <h3>Instant Booking</h3>
            <p>Book appointments in seconds with real-time availability</p>
          </div>
          <div className="feature">
            <div className="feature-icon" style={{ background: '#4ECDC4' }}>
              <BarChart3 size={28} />
            </div>
            <h3>Live Queue Tracking</h3>
            <p>See your position and wait time in real-time</p>
          </div>
          <div className="feature">
            <div className="feature-icon" style={{ background: '#FF6B6B' }}>
              <Sparkles size={28} />
            </div>
            <h3>AI Recommendations</h3>
            <p>Smart suggestions based on your preferences and history</p>
          </div>
          <div className="feature">
            <div className="feature-icon" style={{ background: '#95E1D3' }}>
              <Bell size={28} />
            </div>
            <h3>Smart Notifications</h3>
            <p>Get notified when it's almost your turn</p>
          </div>
        </div>
      </section>
    </div>
  );

  // Providers List View
  const ProvidersView = () => (
    <div className="providers-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => setCurrentView('home')}>
          ← Back
        </button>
        <h2>
          {selectedCategory ? selectedCategory.name : 'All Providers'}
        </h2>
        <button className="filter-btn">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="providers-list">
        {providers.map((provider) => (
          <div key={provider.id} className="provider-card">
            <div className="provider-image">{provider.image}</div>
            <div className="provider-info">
              <div className="provider-header">
                <div>
                  <h3>{provider.name}</h3>
                  <div className="provider-meta">
                    <MapPin size={14} />
                    <span>{provider.location}</span>
                  </div>
                </div>
                <div className="provider-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{provider.rating}</span>
                  <span className="reviews">({provider.reviews})</span>
                </div>
              </div>

              <div className="queue-info">
                <div className="queue-stat">
                  <Users size={16} />
                  <span>{provider.queueLength} in queue</span>
                </div>
                <div className="queue-stat">
                  <Clock size={16} />
                  <span>~{provider.waitTime} min wait</span>
                </div>
                <div className={`status ${provider.available ? 'available' : 'busy'}`}>
                  {provider.available ? 'Available Now' : 'Busy'}
                </div>
              </div>

              <div className="services-preview">
                {provider.services.slice(0, 2).map((service) => (
                  <span key={service.id} className="service-tag">
                    {service.name}
                  </span>
                ))}
                {provider.services.length > 2 && (
                  <span className="service-tag more">
                    +{provider.services.length - 2} more
                  </span>
                )}
              </div>

              <button
                className="book-btn"
                onClick={() => {
                  setSelectedProvider(provider);
                  setCurrentView('booking');
                }}
              >
                View Services & Book
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Booking View
  const BookingView = () => (
    <div className="booking-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => setCurrentView('providers')}>
          ← Back
        </button>
        <h2>{selectedProvider?.name}</h2>
      </div>

      <div className="booking-container">
        <div className="booking-main">
          <section className="booking-section">
            <h3>Select Service</h3>
            <div className="services-list">
              {selectedProvider?.services.map((service) => (
                <div
                  key={service.id}
                  className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="service-details">
                    <h4>{service.name}</h4>
                    <div className="service-meta">
                      <span>
                        <Clock size={14} />
                        {service.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="service-price">₹{service.price}</div>
                </div>
              ))}
            </div>
          </section>

          {selectedService && (
            <>
              <section className="booking-section">
                <h3>Select Date</h3>
                <div className="date-picker">
                  {['Today', 'Tomorrow', 'Jan 31', 'Feb 1', 'Feb 2'].map((date, idx) => (
                    <button key={idx} className={`date-option ${idx === 0 ? 'selected' : ''}`}>
                      {date}
                    </button>
                  ))}
                </div>
              </section>

              <section className="booking-section">
                <h3>Select Time Slot</h3>
                <div className="time-slots">
                  {timeSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      className={`time-slot ${!slot.available ? 'unavailable' : ''}`}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="booking-summary">
          <div className="summary-card">
            <h3>Booking Summary</h3>
            {selectedService ? (
              <>
                <div className="summary-item">
                  <span>Service</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="summary-item">
                  <span>Duration</span>
                  <span>{selectedService.duration} min</span>
                </div>
                <div className="summary-item">
                  <span>Date</span>
                  <span>Today</span>
                </div>
                <div className="summary-item">
                  <span>Time</span>
                  <span>-</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{selectedService.price}</span>
                </div>
                <button className="confirm-btn">
                  Confirm Booking
                  <CheckCircle size={18} />
                </button>
              </>
            ) : (
              <p className="summary-placeholder">Select a service to continue</p>
            )}
          </div>

          <div className="queue-preview">
            <div className="queue-header">
              <Users size={18} />
              <span>Current Queue Status</span>
            </div>
            <div className="queue-status">
              <div className="queue-number">{selectedProvider?.queueLength}</div>
              <div className="queue-label">People Waiting</div>
            </div>
            <div className="wait-time">
              Estimated wait: ~{selectedProvider?.waitTime} min
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Queue Tracking View
  const QueueView = () => (
    <div className="queue-view">
      <div className="view-header">
        <h2>Live Queue Tracking</h2>
        <div className="live-indicator">
          <div className="pulse"></div>
          <span>Live</span>
        </div>
      </div>

      <div className="queue-container">
        <div className="queue-info-card">
          <div className="queue-position">
            <div className="position-label">Your Position</div>
            <div className="position-number">#4</div>
            <div className="eta">
              <Clock size={20} />
              <span>Estimated wait: 25 minutes</span>
            </div>
          </div>

          <div className="appointment-details">
            <h3>CityHealth Medical Center</h3>
            <p>General Consultation • Dr. Sarah Johnson</p>
            <p className="appointment-time">
              <Calendar size={16} />
              Today, 3:00 PM
            </p>
          </div>
        </div>

        <div className="queue-list">
          <h3>Queue Status</h3>
          {queueData.map((person) => (
            <div
              key={person.position}
              className={`queue-item ${person.highlight ? 'highlight' : ''} ${person.status}`}
            >
              <div className="queue-position-badge">{person.position}</div>
              <div className="queue-person-info">
                <div className="queue-name">{person.name}</div>
                <div className="queue-eta">{person.eta}</div>
              </div>
              <div className="queue-status-indicator">
                {person.status === 'in-service' ? (
                  <div className="status-badge in-service">In Service</div>
                ) : (
                  <div className="status-badge waiting">Waiting</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="queue-actions">
          <button className="action-btn secondary">
            <Bell size={18} />
            Notify Me
          </button>
          <button className="action-btn danger">
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="dashboard-view">
      <div className="view-header">
        <h2>My Appointments</h2>
      </div>

      <div className="appointments-tabs">
        <button className="tab active">Upcoming</button>
        <button className="tab">Past</button>
        <button className="tab">Cancelled</button>
      </div>

      <div className="appointments-list">
        <div className="appointment-card upcoming">
          <div className="appointment-status">
            <AlertCircle size={18} />
            <span>In 2 hours</span>
          </div>
          <div className="appointment-content">
            <h3>CityHealth Medical Center</h3>
            <p>General Consultation</p>
            <div className="appointment-meta">
              <span>
                <Calendar size={14} />
                Today, 3:00 PM
              </span>
              <span>
                <MapPin size={14} />
                Downtown, 2.3 km
              </span>
            </div>
          </div>
          <div className="appointment-actions">
            <button className="action-link" onClick={() => setCurrentView('queue')}>
              View Queue
            </button>
            <button className="action-link">Reschedule</button>
          </div>
        </div>

        <div className="appointment-card completed">
          <div className="appointment-status success">
            <CheckCircle size={18} />
            <span>Completed</span>
          </div>
          <div className="appointment-content">
            <h3>Glow Spa & Wellness</h3>
            <p>Facial Treatment</p>
            <div className="appointment-meta">
              <span>
                <Calendar size={14} />
                Jan 20, 2:00 PM
              </span>
            </div>
          </div>
          <div className="appointment-actions">
            <button className="action-link">Rate Service</button>
            <button className="action-link">Book Again</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <Sparkles size={28} />
          <span>QuickBook</span>
        </div>
        <div className="nav-links">
          <button
            className={currentView === 'home' ? 'active' : ''}
            onClick={() => setCurrentView('home')}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
          <button
            className={currentView === 'queue' ? 'active' : ''}
            onClick={() => setCurrentView('queue')}
          >
            <BarChart3 size={20} />
            <span>Queue</span>
          </button>
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            <Calendar size={20} />
            <span>My Bookings</span>
          </button>
          <button>
            <Heart size={20} />
            <span>Favorites</span>
          </button>
          <button>
            <User size={20} />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'home' && <HomeView />}
        {currentView === 'providers' && <ProvidersView />}
        {currentView === 'booking' && <BookingView />}
        {currentView === 'queue' && <QueueView />}
        {currentView === 'dashboard' && <DashboardView />}
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          min-height: 100vh;
          color: #ffffff;
        }

        /* Navbar */
        .navbar {
          background: rgba(26, 26, 46, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
        }

        .nav-links button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .nav-links button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .nav-links button.active {
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          color: #0a0a0a;
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          padding: 4rem 2rem;
          margin-bottom: 3rem;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 50%, #4ECDC4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(20deg); }
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3rem;
          font-weight: 400;
        }

        /* Search Bar */
        .search-bar {
          max-width: 700px;
          margin: 0 auto 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .search-bar:focus-within {
          border-color: #FFE66D;
          box-shadow: 0 0 30px rgba(255, 230, 109, 0.3);
        }

        .search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
        }

        .search-bar input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-btn {
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          color: #0a0a0a;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .search-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(255, 230, 109, 0.4);
        }

        /* Quick Stats */
        .quick-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 3rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Section */
        .section {
          margin-bottom: 4rem;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        /* Recommendations Grid */
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .recommendation-card {
          background: linear-gradient(135deg, rgba(255, 230, 109, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%);
          border: 2px solid rgba(255, 230, 109, 0.3);
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .recommendation-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #FFE66D 0%, #FF6B6B 100%);
        }

        .recommendation-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(255, 230, 109, 0.3);
        }

        .rec-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: #FF6B6B;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .rec-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0a;
          margin-bottom: 1.5rem;
        }

        .recommendation-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .rec-provider {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
        }

        .rec-reason {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .rec-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.875rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .rec-btn:hover {
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          color: #0a0a0a;
        }

        /* Categories Grid */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .category-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--category-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .category-card:hover::before {
          transform: scaleX(1);
        }

        .category-card:hover {
          transform: translateY(-5px);
          border-color: var(--category-color);
          box-shadow: 0 10px 40px rgba(255, 255, 255, 0.1);
        }

        .category-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .category-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .category-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .category-arrow {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          color: var(--category-color);
          opacity: 0;
          transition: all 0.3s ease;
        }

        .category-card:hover .category-arrow {
          opacity: 1;
          transform: translateX(5px);
        }

        /* Features Section */
        .features-section {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 30px;
          padding: 4rem 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature {
          text-align: center;
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #0a0a0a;
        }

        .feature h3 {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .feature p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Providers View */
        .providers-view,
        .booking-view,
        .queue-view,
        .dashboard-view {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Provider Card */
        .providers-list {
          display: grid;
          gap: 1.5rem;
        }

        .provider-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          gap: 2rem;
          transition: all 0.3s ease;
        }

        .provider-card:hover {
          transform: translateX(5px);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 5px 30px rgba(255, 255, 255, 0.1);
        }

        .provider-image {
          font-size: 5rem;
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .provider-info {
          flex: 1;
        }

        .provider-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .provider-header h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .provider-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .provider-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #FFE66D;
          font-weight: 600;
        }

        .reviews {
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
        }

        .queue-info {
          display: flex;
          gap: 2rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .queue-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .status {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status.available {
          background: rgba(78, 205, 196, 0.2);
          color: #4ECDC4;
        }

        .status.busy {
          background: rgba(255, 107, 107, 0.2);
          color: #FF6B6B;
        }

        .services-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .service-tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .service-tag.more {
          background: rgba(255, 230, 109, 0.1);
          border-color: rgba(255, 230, 109, 0.3);
          color: #FFE66D;
        }

        .book-btn {
          width: 100%;
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          color: #0a0a0a;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .book-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 5px 20px rgba(255, 230, 109, 0.4);
        }

        /* Booking View */
        .booking-container {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
        }

        .booking-section {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .booking-section h3 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .services-list {
          display: grid;
          gap: 1rem;
        }

        .service-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .service-option:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .service-option.selected {
          background: rgba(255, 230, 109, 0.1);
          border-color: #FFE66D;
        }

        .service-details h4 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .service-meta {
          display: flex;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .service-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .service-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FFE66D;
        }

        .date-picker {
          display: flex;
          gap: 1rem;
        }

        .date-option {
          flex: 1;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .date-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .date-option.selected {
          background: rgba(255, 230, 109, 0.1);
          border-color: #FFE66D;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .time-slot {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .time-slot:hover:not(.unavailable) {
          background: rgba(255, 255, 255, 0.05);
          border-color: #FFE66D;
        }

        .time-slot.unavailable {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .booking-summary {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          position: sticky;
          top: 100px;
        }

        .summary-card h3 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .summary-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 1.5rem 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .summary-placeholder {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          padding: 2rem 0;
        }

        .confirm-btn {
          width: 100%;
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          color: #0a0a0a;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .confirm-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 5px 20px rgba(255, 230, 109, 0.4);
        }

        .queue-preview {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
        }

        .queue-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
        }

        .queue-status {
          margin-bottom: 1rem;
        }

        .queue-number {
          font-size: 3rem;
          font-weight: 700;
          color: #4ECDC4;
        }

        .queue-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .wait-time {
          color: rgba(255, 255, 255, 0.7);
        }

        /* Queue View */
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 107, 107, 0.2);
          border-radius: 20px;
          color: #FF6B6B;
          font-weight: 600;
        }

        .pulse {
          width: 8px;
          height: 8px;
          background: #FF6B6B;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .queue-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .queue-info-card {
          background: linear-gradient(135deg, rgba(255, 230, 109, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%);
          border: 2px solid rgba(255, 230, 109, 0.3);
          border-radius: 24px;
          padding: 3rem;
          margin-bottom: 2rem;
        }

        .queue-position {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .position-label {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .position-number {
          font-size: 5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .eta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .appointment-details h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .appointment-details p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
        }

        .appointment-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .queue-list {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .queue-list h3 {
          margin-bottom: 1.5rem;
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .queue-item.highlight {
          background: rgba(255, 230, 109, 0.1);
          border-color: #FFE66D;
        }

        .queue-item.in-service {
          background: rgba(78, 205, 196, 0.1);
          border-color: #4ECDC4;
        }

        .queue-position-badge {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .queue-item.highlight .queue-position-badge {
          background: #FFE66D;
          color: #0a0a0a;
        }

        .queue-person-info {
          flex: 1;
        }

        .queue-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .queue-eta {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-badge.in-service {
          background: rgba(78, 205, 196, 0.2);
          color: #4ECDC4;
        }

        .status-badge.waiting {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
        }

        .queue-actions {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .action-btn.danger {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #FF6B6B;
        }

        .action-btn.danger:hover {
          background: rgba(255, 107, 107, 0.3);
        }

        /* Dashboard View */
        .appointments-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .tab {
          padding: 0.75rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .tab.active {
          background: linear-gradient(135deg, #FFE66D 0%, #FF6B6B 100%);
          color: #0a0a0a;
          border-color: transparent;
        }

        .appointments-list {
          display: grid;
          gap: 1.5rem;
        }

        .appointment-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .appointment-card:hover {
          transform: translateX(5px);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .appointment-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .appointment-card.upcoming .appointment-status {
          background: rgba(255, 230, 109, 0.2);
          color: #FFE66D;
        }

        .appointment-card.completed .appointment-status {
          background: rgba(78, 205, 196, 0.2);
          color: #4ECDC4;
        }

        .appointment-content h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .appointment-content p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1rem;
        }

        .appointment-meta {
          display: flex;
          gap: 2rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .appointment-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .appointment-actions {
          display: flex;
          gap: 1rem;
        }

        .action-link {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }

        .action-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .booking-container {
            grid-template-columns: 1fr;
          }

          .summary-card {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }

          .nav-links {
            display: none;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .quick-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .categories-grid,
          .recommendations-grid {
            grid-template-columns: 1fr;
          }

          .time-slots {
            grid-template-columns: repeat(2, 1fr);
          }

          .provider-card {
            flex-direction: column;
          }

          .queue-info {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentSystem;
