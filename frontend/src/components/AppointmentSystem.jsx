import React, { useState, useEffect } from 'react';


import { Calendar, Clock, MapPin, Star, TrendingUp, Users, Zap, Search, Filter, ChevronRight, Bell, User, Home, BarChart3, Heart, CheckCircle, AlertCircle, Sparkles, LogOut, Lock } from 'lucide-react';
import { providersAPI, servicesAPI, authAPI, appointmentsAPI, QueueWebSocket } from '../services/api-service';

const AppointmentSystem = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerServices, setProviderServices] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user profile here
      authAPI.getCurrentUser().then(u => setUser(u)).catch(() => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      try {
        await authAPI.login({ username: loginEmail.trim(), password: loginPassword.trim() });
      } catch (err) {
        // Auto-register for demo if login fails (simplified flow)
        if (loginEmail.includes('@')) {
          try {
            await authAPI.register({ email: loginEmail.trim(), password: loginPassword.trim(), username: loginEmail.split('@')[0].trim() });
            await authAPI.login({ username: loginEmail.trim(), password: loginPassword.trim() });
          } catch (regErr) {
            throw err; // Throw original login error if register also fails
          }
        } else {
          throw err;
        }
      }
      setIsAuthenticated(true);
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
      if (currentUser.user_type === 'provider') {
        setCurrentView('provider-dashboard');
      } else {
        setCurrentView('home');
      }
    } catch (error) {
      console.error("Login Error Details:", error);
      setAuthError(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('home');
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      setCurrentView('login');
      return;
    }
    if (!selectedService) return;

    try {
      // Create appointment for "Today" at selected time (or default 30 mins from now)
      const now = new Date();
      const appointmentData = {
        service_id: selectedService.id,
        provider_id: selectedProvider.id,
        start_time: new Date(now.getTime() + 30 * 60000).toISOString(), // Mock time: 30 mins from now
        notes: "Booked via QuickBook"
      };

      const result = await appointmentsAPI.createAppointment(appointmentData);
      // Refresh appointments
      const apps = await appointmentsAPI.getUserAppointments(user.id);
      setUserAppointments(apps);

      alert(`Booking Successful! Your Token Number is #${result.token_number}`);

      setCurrentView('queue'); // Send to queue view to track
    } catch (error) {
      alert("Booking failed: " + error.message);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await appointmentsAPI.cancelAppointment(id);
      // Refresh list
      const apps = await appointmentsAPI.getUserAppointments(user.id);
      setUserAppointments(apps);
    } catch (error) {
      console.error("Cancel failed", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      appointmentsAPI.getUserAppointments(user.id).then(setUserAppointments).catch(console.error);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedProvider) {
      const fetchServices = async () => {
        try {
          const servicesData = await servicesAPI.getServices(selectedProvider.id);
          setProviderServices(servicesData);
        } catch (error) {
          console.error("Failed to load services", error);
        }
      };
      fetchServices();
    }
  }, [selectedProvider]);

  // Simulated data
  // Categories aligned with Java Reference
  const categories = [
    { id: 1, name: 'Doctor', icon: '🩺', color: '#FF6B6B', providers: 12 },
    { id: 2, name: 'Beauty Parlour', icon: '💇', color: '#4ECDC4', providers: 8 },
    { id: 3, name: 'Lawyer', icon: '⚖️', color: '#FFE66D', providers: 5 },
    { id: 4, name: 'Dentist', icon: '🦷', color: '#A8E6CF', providers: 6 },
  ];

  const [providers, setProviders] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // Switch to providers view to show results
      const results = await providersAPI.searchProviders(searchQuery);
      // Map results to match frontend format if needed
      const formattedResults = results.map(p => ({
        id: p.id,
        name: p.name,
        category: p.profession,
        rating: p.avg_rating || 4.5,
        reviews: p.total_reviews || 0,
        location: 'Downtown', // Mock
        image: p.profession === 'Healthcare' ? '🏥' : '💆',
        waitTime: 15,
        available: p.is_active,
        queueLength: 0,
        services: [] // We fetch these on selection
      }));
      setProviders(formattedResults);
      setCurrentView('providers');
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const providersData = await providersAPI.getProviders();
        const formattedProviders = providersData.map(p => ({
          id: p.id,
          name: p.name,
          category: p.profession,
          rating: p.avg_rating || 4.5,
          reviews: Math.floor(Math.random() * 500) + 10,
          location: 'Downtown',
          image: p.profession === 'Healthcare' ? '🏥' : '💆',
          waitTime: 15, // Mock value
          available: p.is_active,
          queueLength: 0, // Mock value
          services: []
        }));
        setProviders(formattedProviders);
      } catch (error) {
        console.error("Failed to load providers:", error);
      }
    };
    loadData();
  }, []);

  const dummy_providers = [
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

  // Setup WebSocket for Real-time Queue
  useEffect(() => {
    // Only connect if we have an active appointment (mocking ID 1 for now or selected provider)
    // In real app, we'd get the appointment ID from user's active appointment
    if (selectedProvider && isAuthenticated) {
      const socket = new QueueWebSocket(1); // Using appointment_id=1 as testing default

      socket.on('update', (data) => {
        if (data.queue) {
          setQueueData(data.queue);
        }
      });

      socket.connect();

      return () => socket.disconnect();
    }
  }, [selectedProvider, isAuthenticated]);

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

  // Login View
  const LoginView = () => (
    <div className="login-view" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
          <input
            type="text"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
            placeholder="citydoctor"
          />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
            placeholder="password123"
          />
        </div>
        {authError && <p style={{ color: '#FF6B6B', marginBottom: '1rem' }}>{authError}</p>}
        <button type="submit" className=" search-btn" style={{ width: '100%', justifyContent: 'center' }}>
          Login / Register
        </button>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '10px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
            <strong style={{ color: '#4ECDC4' }}>Try these provider accounts:</strong>
          </p>
          <ul style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', paddingLeft: '1.5rem', margin: 0 }}>
            <li><code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>citydoctor</code> / password123</li>
            <li><code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>beautyspa</code> / password123</li>
            <li><code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>brightsmile</code> / password123</li>
          </ul>
        </div>
      </form>
    </div>
  );

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

          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for services, providers, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Sparkles size={18} />
              Search
            </button>
          </form>

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
              {providerServices.length > 0 ? (
                providerServices.map((service) => (
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
                ))
              ) : (
                <div className="no-services">
                  <p>No services found for this provider.</p>
                  <p className="debug-hint text-sm text-gray-400">Debug: Provider ID {selectedProvider?.id}</p>
                </div>
              )}
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
                <button className="confirm-btn" onClick={handleBookAppointment}>
                  {isAuthenticated ? 'Confirm Booking' : 'Login to Book'}
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
  const QueueView = () => {
    const [queueStatus, setQueueStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const activeAppt = userAppointments.find(a =>
      ['SCHEDULED', 'IN_PROGRESS'].includes(a.status) &&
      new Date(a.date_time).getDate() === new Date().getDate()
    );

    useEffect(() => {
      if (activeAppt) {
        const fetchStatus = async () => {
          try {
            const status = await appointmentsAPI.getQueuePosition(activeAppt.id);
            setQueueStatus(status);
          } catch (e) {
            console.error("Queue fetch error", e);
          } finally {
            setLoading(false);
          }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
      } else {
        setLoading(false);
      }
    }, [activeAppt]);

    if (!activeAppt) {
      return (
        <div className="queue-view" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>No Active Queue</h2>
          <p>You don't have any appointments scheduled for today.</p>
          <button className="action-btn" onClick={() => setCurrentView('providers')} style={{ marginTop: '1rem' }}>
            Book Appointment
          </button>
        </div>
      );
    }

    return (
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
              <div className="position-label">Your Token</div>
              <div className="position-number" style={{ color: '#4ECDC4' }}>#{queueStatus?.your_token || activeAppt.token_number}</div>
              <div className="eta">
                <span style={{ fontSize: '0.9rem', color: '#888' }}>Current Serving: #{queueStatus?.current_token || '-'}</span>
              </div>
              <div className="eta" style={{ marginTop: '0.5rem' }}>
                <Clock size={20} />
                <span>
                  {queueStatus?.position === 0 ? "You are next!" :
                    queueStatus?.position < 0 ? "It's your turn!" :
                      `People ahead: ${queueStatus?.position || 0} (~${queueStatus?.wait_time || 0} min)`}
                </span>
              </div>
            </div>

            <div className="appointment-details">
              <h3>{activeAppt.provider_id}</h3> {/* Ideal: Provider Name */}
              <p>{activeAppt.service_name}</p>
              <p className="appointment-time">
                <Calendar size={16} />
                {new Date(activeAppt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="queue-actions">
            {/* Actions */}
            <button className="action-btn  danger" onClick={() => handleCancelAppointment(activeAppt.id)}>
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    );
  };



  // Provider Dashboard View (Cockpit)
  const ProviderDashboard = () => {
    const [currentServing, setCurrentServing] = useState(null);
    const [waitingList, setWaitingList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCockpitData = async () => {
      setLoading(true);
      try {
        const apps = await appointmentsAPI.getProviderAppointments();
        // Filter appointments for Today
        // Backend typically returns all or filtered. Let's assume list.
        // Sort by token/time

        const now = new Date();
        const active = apps.filter(a => ['SCHEDULED', 'IN_PROGRESS'].includes(a.status));

        const current = active.find(a => a.status === 'IN_PROGRESS');
        const waiting = active.filter(a => a.status === 'SCHEDULED' && new Date(a.date_time).getDate() === now.getDate()); // Naive day check
        const sortedWaiting = waiting.sort((a, b) => a.token_number - b.token_number);

        setCurrentServing(current);
        setWaitingList(sortedWaiting);
      } catch (e) {
        console.error("Cockpit load error", e);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchCockpitData();
      // Poll every 5s for updates (Poor man's real-time)
      const interval = setInterval(fetchCockpitData, 5000);
      return () => clearInterval(interval);
    }, []);

    const handleCallNext = async () => {
      try {
        await appointmentsAPI.callNext();
        fetchCockpitData();
      } catch (e) {
        alert("Error calling next: " + e.message);
      }
    };

    const handleFinish = async () => {
      try {
        await appointmentsAPI.finishCurrent();
        fetchCockpitData();
      } catch (e) {
        alert("Error finishing: " + e.message);
      }
    };

    return (
      <div className="dashboard-view">
        <div className="view-header">
          <h2>Live Session Control (Cockpit)</h2>
          <div className="live-indicator">
            <span style={{ color: '#4ECDC4' }}>● Live</span>
            <span style={{ marginLeft: 10 }}>{user?.username}</span>
          </div>
        </div>

        <div className="cockpit-container" style={{ padding: '1rem' }}>
          {/* CURRENT SERVING */}
          <section className="current-serving-section" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#888', marginBottom: '1rem' }}>Currently Serving</h3>
            {currentServing ? (
              <div className="current-card" style={{
                background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(78, 205, 196, 0.2) 100%)',
                border: '2px solid #4ECDC4',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4ECDC4' }}>
                    Token #{currentServing.token_number}
                  </div>
                  <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{currentServing.service_name}</div>
                  {/* We might not have username easily unless backend joins it. Model has user_id. 
                                Let's assume we might show ID or just Service for now until backend sends name. 
                                The Java ref shows username. Backend schema AppointmentResponse needs to verify if it has user info.
                            */}
                  <div style={{ color: '#aaa', marginTop: '0.5rem' }}>User ID: {currentServing.user_id}</div>
                </div>
                <button
                  className="action-btn"
                  style={{
                    background: '#FF6B6B',
                    color: 'white',
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={handleFinish}
                >
                  Finish Current
                </button>
              </div>
            ) : (
              <div className="empty-state" style={{
                padding: '2rem',
                textAlign: 'center',
                border: '2px dashed #444',
                borderRadius: '16px',
                color: '#666'
              }}>
                <h3>Room Empty (Idle)</h3>
                <p>Call the next customer to start</p>
              </div>
            )}
          </section>

          {/* WAITING LIST */}
          <section className="waiting-list-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#888' }}>Waiting Room ({waitingList.length})</h3>
              {!currentServing && waitingList.length > 0 && (
                <button
                  className="action-btn"
                  style={{
                    background: '#4ECDC4',
                    color: 'black',
                    padding: '0.8rem 1.5rem',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={handleCallNext}
                >
                  <Bell size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Call Next Person
                </button>
              )}
            </div>

            <div className="waiting-list" style={{ display: 'grid', gap: '1rem' }}>
              {waitingList.map((appt) => (
                <div key={appt.id} className="waiting-card" style={{
                  background: '#222',
                  padding: '1rem',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      background: '#333',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}>#{appt.token_number}</span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{appt.service_name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#888' }}>
                        {new Date(appt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {currentServing && (
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Waiting...</span>
                  )}
                </div>
              ))}
              {waitingList.length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No one waiting.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  };

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
        {userAppointments.length > 0 ? (
          userAppointments.map((app) => (
            <div key={app.id} className="appointment-card upcoming">
              <div className="appointment-status">
                <AlertCircle size={18} />
                <span>{app.status || 'Scheduled'}</span>
              </div>
              <div className="appointment-content">
                <h3>Appointment #{app.id}</h3>
                <p>Service: {app.service ? app.service.name : 'Unknown Service'}</p>
                <div className="appointment-meta">
                  <span>
                    <Calendar size={14} />
                    {new Date(app.start_time).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="appointment-actions">
                <button
                  className="action-link"
                  style={{ color: '#FF6B6B' }}
                  onClick={() => handleCancelAppointment(app.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '2rem' }}>
            No upcoming appointments found.
          </p>
        )}
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
          <button onClick={() => isAuthenticated ? setCurrentView('dashboard') : setCurrentView('login')}>
            <User size={20} />
            <span>{isAuthenticated ? 'Profile' : 'Login'}</span>
          </button>
          {isAuthenticated && (
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>
              <LogOut size={20} />
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'home' && <HomeView />}
        {currentView === 'login' && (
          <div className="login-view" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                  placeholder="citydoctor"
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                  placeholder="password123"
                />
              </div>
              {authError && <p style={{ color: '#FF6B6B', marginBottom: '1rem' }}>{authError}</p>}
              <button type="submit" className="search-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Login / Register
              </button>
              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '10px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#4ECDC4' }}>Try these provider accounts:</strong>
                </p>
                <ul style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', paddingLeft: '1.5rem', margin: 0 }}>
                  <li><code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>citydoctor</code> / password123</li>
                  <li><code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>beautyspa</code> / password123</li>
                  <li><code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>brightsmile</code> / password123</li>
                </ul>
              </div>
            </form>
          </div>
        )}
        {currentView === 'providers' && <ProvidersView />}
        {currentView === 'booking' && <BookingView />}
        {currentView === 'queue' && <QueueView />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'provider-dashboard' && <ProviderDashboard />}

      </main>

      {/* Debug Panel - Remove in production */}
      <div className="debug-panel">
        <div>Auth: {isAuthenticated ? 'YES' : 'NO'}</div>
        <div>User: {user ? user.username : 'None'} ({user?.user_type})</div>
        <div>View: {currentView}</div>
        <div>Prov: {selectedProvider?.id}</div>
        <div>Svcs: {providerServices.length}</div>
        <button onClick={() => {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
          window.location.reload();
        }}>Force Logout</button>
      </div>

      <style jsx>{`
        /* Debug Panel */
        .debug-panel {
          position: fixed;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 9999;
          color: #0f0;
          max-width: 300px;
        }
        .debug-panel button {
           background: #333;
           color: white;
           border: 1px solid #555;
           margin-top: 5px;
           padding: 2px 5px;
           cursor: pointer;
        }

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
