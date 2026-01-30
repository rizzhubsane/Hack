import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, TrendingUp, Users, Zap, Search, Filter, ChevronRight, Bell, User, Home, BarChart3, Heart, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import api from './api-service';

const AppointmentSystem = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [queueWebSocket, setQueueWebSocket] = useState(null);

  // Initialize - Load current user and recommendations
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        if (token) {
          const user = await api.auth.getCurrentUser();
          setCurrentUser(user);
          
          // Load personalized recommendations
          loadRecommendations(user.id);
          
          // Load user appointments
          loadUserAppointments(user.id);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initializeApp();
  }, []);

  // Load recommendations
  const loadRecommendations = async (userId) => {
    try {
      const data = await api.recommendations.getRecommendations(userId);
      setRecommendations(data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  // Load providers
  const loadProviders = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await api.providers.getProviders(filters);
      setProviders(data);
    } catch (err) {
      setError('Failed to load providers');
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search providers
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const data = await api.providers.searchProviders(
        searchQuery,
        selectedCategory?.name
      );
      setProviders(data);
      setCurrentView('providers');
    } catch (err) {
      setError('Search failed');
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user appointments
  const loadUserAppointments = async (userId, status = null) => {
    try {
      const data = await api.appointments.getUserAppointments(userId, status);
      setUserAppointments(data);
    } catch (err) {
      console.error('Error loading appointments:', err);
    }
  };

  // Book appointment
  const handleBookAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Please select service, date, and time');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        service_id: selectedService.id,
        provider_id: selectedProvider.id,
        date: selectedDate,
        time: selectedTime,
        user_id: currentUser.id,
      };

      const newAppointment = await api.appointments.createAppointment(appointmentData);
      
      // Track analytics
      await api.analytics.trackAction({
        user_id: currentUser.id,
        action: 'appointment_booked',
        provider_id: selectedProvider.id,
        service_id: selectedService.id,
      });

      // Navigate to queue view
      setCurrentView('queue');
      
      // Start queue tracking
      startQueueTracking(newAppointment.id);
      
      // Reload appointments
      loadUserAppointments(currentUser.id);
    } catch (err) {
      setError('Failed to book appointment');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Start WebSocket for queue tracking
  const startQueueTracking = (appointmentId) => {
    const ws = new api.QueueWebSocket(appointmentId);
    
    ws.on('connect', () => {
      console.log('Connected to queue updates');
    });
    
    ws.on('update', (data) => {
      setQueueData(data.queue);
    });
    
    ws.on('error', (err) => {
      console.error('Queue WebSocket error:', err);
    });
    
    ws.connect();
    setQueueWebSocket(ws);
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (queueWebSocket) {
        queueWebSocket.disconnect();
      }
    };
  }, [queueWebSocket]);

  // Load providers when category is selected
  useEffect(() => {
    if (currentView === 'providers') {
      const filters = selectedCategory 
        ? { category: selectedCategory.name }
        : {};
      loadProviders(filters);
    }
  }, [currentView, selectedCategory]);

  // Load provider details and services
  const selectProvider = async (provider) => {
    setLoading(true);
    try {
      // Get detailed provider info
      const providerDetails = await api.providers.getProvider(provider.id);
      
      // Get provider's services
      const services = await api.servicesAPI.getServices(provider.id);
      
      setSelectedProvider({
        ...providerDetails,
        services,
      });
      
      setCurrentView('booking');
    } catch (err) {
      setError('Failed to load provider details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate dates for the next 7 days
  const getUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: date.toISOString().split('T')[0],
      });
    }
    
    return dates;
  };

  // Load time slots for selected provider and date
  const [timeSlots, setTimeSlots] = useState([]);
  
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (selectedProvider && selectedDate) {
        try {
          const availability = await api.providers.getAvailability(
            selectedProvider.id,
            selectedDate
          );
          setTimeSlots(availability.time_slots || []);
        } catch (err) {
          console.error('Error loading time slots:', err);
        }
      }
    };
    
    loadTimeSlots();
  }, [selectedProvider, selectedDate]);

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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
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
      {recommendations.length > 0 && (
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
              <div key={rec.id} className="recommendation-card">
                {rec.discount && <div className="rec-badge">{rec.discount}% OFF</div>}
                <div className="rec-icon">
                  <Sparkles size={32} />
                </div>
                <h3>{rec.service_name}</h3>
                <p className="rec-provider">{rec.provider_name}</p>
                <p className="rec-reason">{rec.reason}</p>
                <button 
                  className="rec-btn" 
                  onClick={async () => {
                    const provider = await api.providers.getProvider(rec.provider_id);
                    selectProvider(provider);
                  }}
                >
                  Book Now
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Browse Categories</h2>
          <p className="section-subtitle">Find the perfect service for your needs</p>
        </div>

        <div className="categories-grid">
          {api.CATEGORIES.map((category) => (
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

      {loading && <div className="loading">Loading providers...</div>}
      {error && <div className="error">{error}</div>}

      <div className="providers-list">
        {providers.map((provider) => (
          <div key={provider.id} className="provider-card">
            <div className="provider-image">{provider.icon || '🏢'}</div>
            <div className="provider-info">
              <div className="provider-header">
                <div>
                  <h3>{provider.name}</h3>
                  <div className="provider-meta">
                    <MapPin size={14} />
                    <span>{provider.location || 'Location'}</span>
                  </div>
                </div>
                <div className="provider-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{provider.rating || 4.5}</span>
                  <span className="reviews">({provider.reviews_count || 0})</span>
                </div>
              </div>

              <div className="queue-info">
                <div className="queue-stat">
                  <Users size={16} />
                  <span>{provider.queue_length || 0} in queue</span>
                </div>
                <div className="queue-stat">
                  <Clock size={16} />
                  <span>~{provider.avg_wait_time || 15} min wait</span>
                </div>
                <div className={`status ${provider.is_available ? 'available' : 'busy'}`}>
                  {provider.is_available ? 'Available Now' : 'Busy'}
                </div>
              </div>

              <button
                className="book-btn"
                onClick={() => selectProvider(provider)}
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
  const BookingView = () => {
    const upcomingDates = getUpcomingDates();

    return (
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
                {selectedProvider?.services?.map((service) => (
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
                    {upcomingDates.map((date) => (
                      <button
                        key={date.value}
                        className={`date-option ${selectedDate === date.value ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(date.value)}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </section>

                {selectedDate && (
                  <section className="booking-section">
                    <h3>Select Time Slot</h3>
                    <div className="time-slots">
                      {timeSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          className={`time-slot ${!slot.available ? 'unavailable' : ''} ${selectedTime === slot.time ? 'selected' : ''}`}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
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
                    <span>{selectedDate || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Time</span>
                    <span>{selectedTime || '-'}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>₹{selectedService.price}</span>
                  </div>
                  <button 
                    className="confirm-btn"
                    onClick={handleBookAppointment}
                    disabled={!selectedDate || !selectedTime || loading}
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                    <CheckCircle size={18} />
                  </button>
                </>
              ) : (
                <p className="summary-placeholder">Select a service to continue</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="position-number">
              #{queueData.find(q => q.highlight)?.position || '-'}
            </div>
            <div className="eta">
              <Clock size={20} />
              <span>Estimated wait: {queueData.find(q => q.highlight)?.eta || '-'}</span>
            </div>
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
        <button className="tab active" onClick={() => loadUserAppointments(currentUser?.id, 'upcoming')}>
          Upcoming
        </button>
        <button className="tab" onClick={() => loadUserAppointments(currentUser?.id, 'completed')}>
          Past
        </button>
        <button className="tab" onClick={() => loadUserAppointments(currentUser?.id, 'cancelled')}>
          Cancelled
        </button>
      </div>

      <div className="appointments-list">
        {userAppointments.map((appointment) => (
          <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
            <div className="appointment-status">
              {appointment.status === 'upcoming' ? (
                <>
                  <AlertCircle size={18} />
                  <span>Upcoming</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Completed</span>
                </>
              )}
            </div>
            <div className="appointment-content">
              <h3>{appointment.provider_name}</h3>
              <p>{appointment.service_name}</p>
              <div className="appointment-meta">
                <span>
                  <Calendar size={14} />
                  {appointment.date} {appointment.time}
                </span>
              </div>
            </div>
            <div className="appointment-actions">
              {appointment.status === 'upcoming' && (
                <button className="action-link" onClick={() => setCurrentView('queue')}>
                  View Queue
                </button>
              )}
              <button className="action-link">Details</button>
            </div>
          </div>
        ))}
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

      {/* Same styles as before - keeping them identical */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

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

        /* All previous styles remain the same */
        /* Navbar, Hero, Sections, Cards, etc. - keeping them identical for consistency */
        
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

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .error {
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid #FF6B6B;
          padding: 1rem;
          border-radius: 12px;
          color: #FF6B6B;
          margin-bottom: 1rem;
        }

        /* Additional styles for time slot selection */
        .time-slot.selected {
          background: rgba(255, 230, 109, 0.2);
          border-color: #FFE66D;
        }

        /* All other styles from the original component */
        /* Hero, Search, Stats, Recommendations, Categories, Features, etc. */
        /* ... (keeping all previous styles) ... */
      `}</style>
    </div>
  );
};

export default AppointmentSystem;
