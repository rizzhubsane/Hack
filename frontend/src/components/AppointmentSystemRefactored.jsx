import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, TrendingUp, Users, Zap, Search, Filter, ChevronRight, Bell, User, Home, BarChart3, Heart, CheckCircle, AlertCircle, Sparkles, LogOut } from 'lucide-react';
import { providersAPI, servicesAPI, authAPI, appointmentsAPI, QueueWebSocket } from '../services/api-service';
import './AppointmentSystem.css';

// --- Sub-Components defined OUTSIDE main component to prevent re-renders ---

const LoginView = ({ loginEmail, setLoginEmail, loginPassword, setLoginPassword, handleLogin, authError, setCurrentView }) => (
    <div className="login-view" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h2>
        <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email / Username</label>
                <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                    placeholder="guest@example.com"
                />
            </div>
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                    placeholder="password"
                />
            </div>
            {authError && <p style={{ color: '#FF6B6B', marginBottom: '1rem' }}>{authError}</p>}
            <button type="submit" className="search-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Login / Register
            </button>
        </form>
    </div>
);

const HomeView = ({ handleSearch, searchQuery, setSearchQuery, recommendations, categories, setSelectedCategory, setCurrentView }) => (
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

const ProvidersView = ({ providers, selectedCategory, setCurrentView, setSelectedProvider }) => (
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

const BookingView = ({ selectedProvider, providerServices, selectedService, setSelectedService, timeSlots, handleBookAppointment, setCurrentView, isAuthenticated }) => (
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

const QueueView = ({ userAppointments, setCurrentView, handleCancelAppointment }) => {
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
    }, [activeAppt]); // appointmentsAPI is stable

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

const ProviderDashboard = ({ user }) => {
    const [currentServing, setCurrentServing] = useState(null);
    const [waitingList, setWaitingList] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCockpitData = async () => {
        setLoading(true);
        try {
            const apps = await appointmentsAPI.getProviderAppointments();
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

const DashboardView = ({ userAppointments, handleCancelAppointment }) => (
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

// --- MAIN COMPONENT ---

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
    const [providers, setProviders] = useState([]);

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
                await authAPI.login({ username: loginEmail, password: loginPassword });
            } catch (err) {
                // Auto-register for demo if login fails (simplified flow)
                if (loginEmail.includes('@')) {
                    try {
                        await authAPI.register({ email: loginEmail, password: loginPassword, username: loginEmail.split('@')[0] });
                        await authAPI.login({ username: loginEmail, password: loginPassword });
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
            setAuthError('Login failed. Please check credentials.');
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
            // Create appointment for "Today" at selected time
            const now = new Date();
            const appointmentData = {
                service_id: selectedService.id,
                provider_id: selectedProvider.id,
                start_time: new Date(now.getTime() + 30 * 60000).toISOString(), // Mock time
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

    // Categories aligned with Java Reference
    const categories = [
        { id: 1, name: 'Doctor', icon: '🩺', color: '#FF6B6B', providers: 12 },
        { id: 2, name: 'Beauty Parlour', icon: '💇', color: '#4ECDC4', providers: 8 },
        { id: 3, name: 'Lawyer', icon: '⚖️', color: '#FFE66D', providers: 5 },
        { id: 4, name: 'Dentist', icon: '🦷', color: '#A8E6CF', providers: 6 },
    ];

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
                image: p.profession === 'Doctor' ? '🏥' : (p.profession === 'Beauty Parlour' ? '💇' : (p.profession === 'Dentist' ? '🦷' : '⚖️')),
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
                    image: p.profession === 'Doctor' ? '🏥' : (p.profession === 'Beauty Parlour' ? '💇' : (p.profession === 'Dentist' ? '🦷' : '⚖️')),
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
        if (selectedProvider && isAuthenticated) {
            const socket = new QueueWebSocket(1); // Using appointment_id=1 default

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
                {currentView === 'home' && (
                    <HomeView
                        handleSearch={handleSearch}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        recommendations={recommendations}
                        categories={categories}
                        setSelectedCategory={setSelectedCategory}
                        setCurrentView={setCurrentView}
                    />
                )}
                {currentView === 'login' && (
                    <LoginView
                        loginEmail={loginEmail}
                        setLoginEmail={setLoginEmail}
                        loginPassword={loginPassword}
                        setLoginPassword={setLoginPassword}
                        handleLogin={handleLogin}
                        authError={authError}
                        setCurrentView={setCurrentView}
                    />
                )}
                {currentView === 'providers' && (
                    <ProvidersView
                        providers={providers}
                        selectedCategory={selectedCategory}
                        setCurrentView={setCurrentView}
                        setSelectedProvider={setSelectedProvider}
                    />
                )}
                {currentView === 'booking' && (
                    <BookingView
                        selectedProvider={selectedProvider}
                        providerServices={providerServices}
                        selectedService={selectedService}
                        setSelectedService={setSelectedService}
                        timeSlots={timeSlots}
                        handleBookAppointment={handleBookAppointment}
                        setCurrentView={setCurrentView}
                        isAuthenticated={isAuthenticated}
                    />
                )}
                {currentView === 'queue' && (
                    <QueueView
                        userAppointments={userAppointments}
                        setCurrentView={setCurrentView}
                        handleCancelAppointment={handleCancelAppointment}
                    />
                )}
                {currentView === 'dashboard' && (
                    <DashboardView
                        userAppointments={userAppointments}
                        handleCancelAppointment={handleCancelAppointment}
                    />
                )}
                {currentView === 'provider-dashboard' && (
                    <ProviderDashboard user={user} />
                )}

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
        </div>
    );
};

export default AppointmentSystem;
