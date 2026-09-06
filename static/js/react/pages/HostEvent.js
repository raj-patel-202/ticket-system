const { useState, useEffect, useRef } = React;
const { Link, useNavigate, Navigate } = ReactRouterDOM;

window.HostEvent = () => {
    const { user } = window.useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        event_name: '',
        subtitle: '',
        event_type: 'concert',
        venue: '',
        time: '',
        capacity: 50,
        price_per_ticket: 45.0
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Sliding capsule tab indicator
    const tabsRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    const updateIndicator = (typeKey) => {
        if (!tabsRef.current) return;
        const activeBtn = tabsRef.current.querySelector(`[data-tab="${typeKey}"]`);
        if (activeBtn) {
            setIndicatorStyle({
                left: activeBtn.offsetLeft,
                width: activeBtn.offsetWidth,
                opacity: 1
            });
        }
    };

    useEffect(() => {
        updateIndicator(formData.event_type);
    }, [formData.event_type]);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateIndicator(formData.event_type);
        }, 60);

        const handleResize = () => updateIndicator(formData.event_type);
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // If user is not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If user is not an organizer, show notice
    if (user.user_type !== 'organizer' && user.user_type !== 'admin') {
        return (
            <div className="auth-page-container fade-up" style={{ maxWidth: '640px' }}>
                <div className="glass-panel" style={{ padding: '36px 30px', textAlign: 'center' }}>
                    <div className="empty-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Organizer Access Required
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        Only registered organizer accounts can publish and price live events. Switch to or register an organizer account to host events.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <Link to="/" className="btn btn-glass btn-sm">Explore Events</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Register as Organizer</Link>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.event_name.trim()) {
            setError('Please enter an event name.');
            return;
        }
        if (!formData.venue.trim()) {
            setError('Please enter a venue.');
            return;
        }
        if (!formData.time) {
            setError('Please select a date and showtime.');
            return;
        }
        if (!formData.capacity || formData.capacity < 10 || formData.capacity > 120) {
            setError('Capacity must be between 10 and 120 seats.');
            return;
        }
        if (!formData.price_per_ticket || formData.price_per_ticket <= 0) {
            setError('Base price must be greater than $0.');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/events/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name: formData.event_name.trim(),
                    event_type: formData.event_type,
                    venue: formData.venue.trim(),
                    time: formData.time,
                    capacity: Number(formData.capacity),
                    price_per_ticket: Number(formData.price_per_ticket),
                    subtitle: formData.subtitle.trim()
                })
            });

            const resData = await res.json();

            if (!res.ok) {
                const errDetail = Array.isArray(resData.detail)
                    ? resData.detail.map(d => d.msg).join(', ')
                    : (resData.detail || 'Failed to publish event');
                throw new Error(errDetail);
            }

            setSuccess('Event published successfully! Redirecting to dashboard...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 800);
        } catch (err) {
            setError(err.message || 'An error occurred while creating the event.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="host-event-container fade-up">
            <div className="host-event-card">
                {/* Top Section: Live Event Details & Highlights */}
                <div className="host-event-hero">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                                Host a Live Event
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0 }}>
                                Publish upcoming concerts, theater productions, or sporting tournaments with real-time 3D seat locks.
                            </p>
                        </div>
                        <Link to="/dashboard" className="btn btn-glass btn-sm" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                            ← Back to Dashboard
                        </Link>
                    </div>

                    {/* Compact Feature Chips Strip */}
                    <div className="host-feature-strip">
                        <div className="host-feature-chip">
                            <div className="chip-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l12-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="18" cy="16" r="3" />
                                </svg>
                            </div>
                            <div>
                                <div className="chip-title">Any Event Genre</div>
                                <div className="chip-sub">Concerts, theater plays, & sports</div>
                            </div>
                        </div>

                        <div className="host-feature-chip">
                            <div className="chip-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                            </div>
                            <div>
                                <div className="chip-title">Dynamic Surge Pricing</div>
                                <div className="chip-sub">Demand-driven transparent curve</div>
                            </div>
                        </div>

                        <div className="host-feature-chip">
                            <div className="chip-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                                </svg>
                            </div>
                            <div>
                                <div className="chip-title">Interactive 3D Seating</div>
                                <div className="chip-sub">Dynamic venue map from capacity</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="alert-box alert-danger" style={{ padding: '10px 14px', marginBottom: '16px', fontSize: '0.84rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert-box alert-success" style={{ padding: '10px 14px', marginBottom: '16px', fontSize: '0.84rem' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>{success}</span>
                    </div>
                )}

                {/* Form with Centered Category and Balanced 2-Column Fields */}
                <form onSubmit={handleSubmit}>
                    {/* Centered Event Selection Type in Middle of Form */}
                    <div className="host-category-wrapper">
                        <div className="filter-tabs host-category-tabs" ref={tabsRef}>
                            <div
                                className={`capsule-slider tab-theme-${formData.event_type}`}
                                style={{
                                    transform: `translateX(${indicatorStyle.left}px)`,
                                    width: `${indicatorStyle.width}px`,
                                    opacity: indicatorStyle.opacity
                                }}
                            />
                            <button
                                type="button"
                                data-tab="concert"
                                className={`filter-tab ${formData.event_type === 'concert' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, event_type: 'concert' })}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l12-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="18" cy="16" r="3" />
                                </svg>
                                <span>Concert</span>
                            </button>
                            <button
                                type="button"
                                data-tab="theater"
                                className={`filter-tab ${formData.event_type === 'theater' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, event_type: 'theater' })}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 11c0 5 4 9 9 9s9-4 9-9-4-7-9-7-9 2-9 7z" />
                                    <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
                                    <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor" />
                                    <path d="M8.5 15.5c1.2 1.5 5.8 1.5 7 0" />
                                </svg>
                                <span>Theater</span>
                            </button>
                            <button
                                type="button"
                                data-tab="sport"
                                className={`filter-tab ${formData.event_type === 'sport' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, event_type: 'sport' })}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                    <path d="M4 22h16" />
                                    <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
                                    <path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2z" />
                                </svg>
                                <span>Sporting</span>
                            </button>
                        </div>
                    </div>

                    <div className="host-form-grid">
                        {/* LEFT COLUMN: 3 Fields (Event Name, Subtitle, Venue) */}
                        <div>
                            {/* Event Name */}
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '5px', fontWeight: 600 }}>
                                    Event Name
                                </label>
                                <div className="input-with-icon">
                                    <div className="input-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="e.g. Neon Horizon Tour"
                                        value={formData.event_name}
                                        onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Subtitle / Headliner */}
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '5px', fontWeight: 600 }}>
                                    Subtitle / Headliner
                                </label>
                                <div className="input-with-icon">
                                    <div className="input-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. World Tour Live in Concert"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Venue & Location */}
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '5px', fontWeight: 600 }}>
                                    Venue & Location
                                </label>
                                <div className="input-with-icon">
                                    <div className="input-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="e.g. Madison Square Garden, NY"
                                        value={formData.venue}
                                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Date/Time, Capacity & Price in one row, Publish Event Button */}
                        <div>
                            {/* Date & Showtime */}
                            <div className="form-group" style={{ marginBottom: '14px' }}>
                                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '5px', fontWeight: 600 }}>
                                    Date & Showtime
                                </label>
                                <div className="input-with-icon">
                                    <div className="input-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Capacity and Price Side by Side in One Row */}
                            <div className="form-row-2" style={{ marginBottom: '14px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '5px', fontWeight: 600 }}>
                                        Capacity (10 - 120)
                                    </label>
                                    <div className="input-with-icon">
                                        <div className="input-icon-wrap">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            min="10"
                                            max="120"
                                            placeholder="50"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || '' })}
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '5px', fontWeight: 600 }}>
                                        Base Price ($)
                                    </label>
                                    <div className="input-with-icon">
                                        <div className="input-icon-wrap">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="1" x2="12" y2="23" />
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            className="form-control"
                                            required
                                            min="1"
                                            step="0.5"
                                            placeholder="45.00"
                                            value={formData.price_per_ticket}
                                            onChange={(e) => setFormData({ ...formData, price_per_ticket: parseFloat(e.target.value) || '' })}
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Publish Event Button in bottom right */}
                            <div className="form-group" style={{ marginBottom: 0, marginTop: '24px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', height: '42px', fontSize: '0.92rem', fontWeight: 600 }}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Publishing Event...' : 'Publish Event →'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
