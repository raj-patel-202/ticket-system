const { useState, useEffect, useRef } = React;
const { Link, Navigate } = ReactRouterDOM;

window.Dashboard = () => {
    const { user } = window.useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const tabsRef = useRef(null);
    const eventsPanelRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    // Modal state for post-hosting ticket pricing and promotional offers
    const [selectedEventForPricing, setSelectedEventForPricing] = useState(null);
    const [pricingForm, setPricingForm] = useState({ price_per_ticket: '', offer_percent: 0 });
    const [pricingSubmitting, setPricingSubmitting] = useState(false);
    const [pricingMsg, setPricingMsg] = useState(null);

    const openPricingModal = (ev) => {
        setSelectedEventForPricing(ev);
        setPricingForm({
            price_per_ticket: ev.price_per_ticket != null ? ev.price_per_ticket : '',
            offer_percent: ev.offer_percent != null ? ev.offer_percent : 0
        });
        setPricingMsg(null);
    };

    const handleSavePricing = async (e) => {
        if (e) e.preventDefault();
        if (!selectedEventForPricing) return;

        const priceVal = parseFloat(pricingForm.price_per_ticket);
        const offerVal = parseFloat(pricingForm.offer_percent) || 0;

        if (isNaN(priceVal) || priceVal <= 0) {
            setPricingMsg({ type: 'error', text: 'Please enter a valid base price greater than $0.00' });
            return;
        }
        if (offerVal < 0 || offerVal > 90) {
            setPricingMsg({ type: 'error', text: 'Promotional offer discount must be between 0% and 90%.' });
            return;
        }

        setPricingSubmitting(true);
        setPricingMsg(null);

        try {
            const res = await fetch(`/api/events/${selectedEventForPricing.event_id}/pricing`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price_per_ticket: priceVal,
                    offer_percent: offerVal
                })
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.detail || 'Failed to update pricing.');
            }

            const updatedEvent = await res.json();
            setData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    events: prev.events.map(ev => ev.event_id === updatedEvent.event_id ? { ...ev, ...updatedEvent } : ev)
                };
            });

            setPricingMsg({ type: 'success', text: `Pricing updated! Attendee price is now $${updatedEvent.current_price.toFixed(2)}` });
            setTimeout(() => {
                setSelectedEventForPricing(null);
            }, 1200);
        } catch (err) {
            setPricingMsg({ type: 'error', text: err.message || 'Network error updating pricing.' });
        } finally {
            setPricingSubmitting(false);
        }
    };

    // If user is not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If user is logged in but not an organizer or admin
    if (user.user_type !== 'organizer' && user.user_type !== 'admin') {
        return (
            <div className="container fade-up" style={{ maxWidth: '640px', paddingTop: '80px', paddingBottom: '80px' }}>
                <div className="glass-panel" style={{ padding: '44px 36px', textAlign: 'center' }}>
                    <div className="morph-icon-box" style={{ margin: '0 auto 20px', width: '48px', height: '48px', color: 'var(--accent-primary)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <span className="kicker" style={{ display: 'inline-block', marginBottom: '8px' }}>ORGANIZER ACCESS ONLY</span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                        Organizer Privileges Required
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 24px' }}>
                        This dashboard is reserved for event organizers to manage venues, seat allocations, live capacities, and ticket sales.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/" className="btn btn-glass btn-sm">
                            ← Browse Events
                        </Link>
                        <Link to="/register" className="btn btn-primary btn-sm">
                            Register as Organizer
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await fetch('/api/organizer/dashboard');
            if (res.ok) {
                const json = await res.json();
                setData(json);
            } else {
                let errText = 'Server error or session expired.';
                try {
                    const errJson = await res.json();
                    if (errJson && errJson.detail) {
                        errText = Array.isArray(errJson.detail)
                            ? errJson.detail.map(d => d.msg).join(', ')
                            : errJson.detail;
                    }
                } catch (_) {}
                setErrorMsg(errText);
                setData(null);
            }
        } catch (err) {
            setErrorMsg(err.message || 'Network connection failed. Please check if the server is running.');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    // Measure active tab for capsule slider
    const updateIndicator = (tabKey) => {
        if (!tabsRef.current) return;
        const activeBtn = tabsRef.current.querySelector(`[data-tab="${tabKey}"]`);
        if (activeBtn) {
            setIndicatorStyle({
                left: activeBtn.offsetLeft,
                width: activeBtn.offsetWidth,
                opacity: 1
            });
        }
    };

    useEffect(() => {
        updateIndicator(categoryFilter);
    }, [categoryFilter, data]);

    useEffect(() => {
        const timer = setTimeout(() => {
            updateIndicator(categoryFilter);
        }, 60);

        const handleResize = () => updateIndicator(categoryFilter);
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleTabSelect = (tabKey) => {
        setCategoryFilter(tabKey);

        // Smoothly scroll/slide page so the events panel and table data sit cleanly in view
        requestAnimationFrame(() => {
            if (eventsPanelRef.current) {
                const navbarHeight = 65;
                const rect = eventsPanelRef.current.getBoundingClientRect();
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                const targetY = currentScroll + rect.top - navbarHeight - 16;

                window.scrollTo({
                    top: Math.max(0, targetY),
                    behavior: 'smooth'
                });
            }
        });
    };

    const formatDate = (isoStr) => {
        try {
            const d = new Date(isoStr);
            if (isNaN(d.getTime())) return isoStr;
            return d.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (_) {
            return isoStr;
        }
    };

    // State 1: Loading
    if (loading) {
        return <window.DashboardSkeleton />;
    }

    // State 2: Error / No Information Available
    if (!data) {
        return (
            <div className="container fade-up" style={{ maxWidth: '640px', paddingTop: '70px', paddingBottom: '70px' }}>
                <div className="glass-panel" style={{ padding: '44px 36px', textAlign: 'center' }}>
                    <div className="morph-icon-box" style={{ margin: '0 auto 20px', width: '50px', height: '50px', color: 'var(--accent-primary)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <span className="kicker" style={{ display: 'inline-block', marginBottom: '8px' }}>ORGANIZER PORTAL</span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                        No Dashboard Information Available
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 24px' }}>
                        {errorMsg 
                            ? `We could not load your analytics (${errorMsg}). You can retry the connection or navigate to host an event.`
                            : 'Unable to retrieve your live organizer metrics right now. You can retry loading or navigate to host an event.'}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={fetchData} className="btn btn-glass btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6" />
                                <path d="M1 20v-6h6" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            Retry Connection
                        </button>
                        <Link 
                            to="/host-event" 
                            className="btn btn-primary btn-sm" 
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Host an Event →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { stats, events } = data;
    const allEventsList = events || [];
    const hasEvents = allEventsList.length > 0;

    const filteredEvents = allEventsList.filter(ev => {
        if (categoryFilter === 'all') return true;
        return ev.event_type === categoryFilter;
    });

    const counts = {
        all: allEventsList.length,
        theater: allEventsList.filter(e => e.event_type === 'theater').length,
        concert: allEventsList.filter(e => e.event_type === 'concert').length,
        sport: allEventsList.filter(e => e.event_type === 'sport').length
    };

    return (
        <div className="container fade-up" style={{ paddingBottom: '70px', paddingTop: '10px' }}>
            {/* Glass Hero Banner with Greeting and Quick Host Action */}
            <div className="dashboard-hero">
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '999px', background: 'rgba(24, 24, 27, 0.05)', border: '1px solid rgba(24, 24, 27, 0.09)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        <span>ORGANIZER PORTAL</span>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                        Welcome back, {user.username}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                        Track ticket sales velocity, manage live auditorium seat allocations, and launch dynamic events.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                        onClick={fetchData} 
                        className="btn btn-glass btn-sm" 
                        title="Refresh metrics"
                        style={{ padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.82rem' }}
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 4v6h-6" />
                            <path d="M1 20v-6h6" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                    <Link 
                        to="/host-event" 
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Host New Event
                    </Link>
                </div>
            </div>


            {/* Glass KPI Cards Grid with Smooth Tint Gradients */}
            <div className="dashboard-kpi-grid">
                {/* Total Events */}
                <div className="dashboard-kpi-card" style={{ '--kpi-glow': 'rgba(122, 18, 48, 0.08)' }}>
                    <div className="dashboard-kpi-header">
                        <div className="dashboard-kpi-label">TOTAL STAGES</div>
                        <div className="dashboard-kpi-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                    </div>
                    <div className="dashboard-kpi-value">
                        {stats.total_events}
                    </div>
                    <div className="dashboard-kpi-sub">
                        {hasEvents ? `${allEventsList.length} active on platform` : 'No events hosted yet'}
                    </div>
                </div>

                {/* Tickets Sold */}
                <div className="dashboard-kpi-card" style={{ '--kpi-glow': 'rgba(123, 47, 247, 0.08)' }}>
                    <div className="dashboard-kpi-header">
                        <div className="dashboard-kpi-label">TICKETS SOLD</div>
                        <div className="dashboard-kpi-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                    </div>
                    <div className="dashboard-kpi-value">
                        {stats.total_sold}
                    </div>
                    <div className="dashboard-kpi-sub">
                        Reserved attendee passes
                    </div>
                </div>

                {/* Avg Occupancy */}
                <div className="dashboard-kpi-card" style={{ '--kpi-glow': 'rgba(217, 119, 6, 0.08)' }}>
                    <div className="dashboard-kpi-header">
                        <div className="dashboard-kpi-label">AVG OCCUPANCY</div>
                        <div className="dashboard-kpi-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 20V10" />
                                <path d="M12 20V4" />
                                <path d="M6 20v-6" />
                            </svg>
                        </div>
                    </div>
                    <div className="dashboard-kpi-value" style={{ color: stats.occupancy_pct >= 80 ? '#10b981' : 'var(--text-primary)' }}>
                        {stats.occupancy_pct}%
                    </div>
                    <div className="dashboard-kpi-sub">
                        Overall venue capacity filled
                    </div>
                </div>

                {/* Gross Revenue */}
                <div className="dashboard-kpi-card" style={{ '--kpi-glow': 'rgba(16, 185, 129, 0.08)' }}>
                    <div className="dashboard-kpi-header">
                        <div className="dashboard-kpi-label">GROSS REVENUE</div>
                        <div className="dashboard-kpi-icon" style={{ color: '#10b981' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                    </div>
                    <div className="dashboard-kpi-value" style={{ color: '#10b981' }}>
                        ${stats.total_revenue.toFixed(2)}
                    </div>
                    <div className="dashboard-kpi-sub">
                        Net ticket transactions
                    </div>
                </div>
            </div>

            {/* Full-Width Events Management Glass Panel */}
            <div className="dashboard-events-panel" ref={eventsPanelRef}>
                <div className="dashboard-table-header">
                    <div>
                        <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                            Your Hosted Events
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                            Live auditorium occupancies, base ticket prices, and seat mapping overview
                        </p>
                    </div>

                    {/* B&W Filter Tabs with Smooth Sliding Capsule */}
                    {hasEvents && (
                        <div className="filter-tabs dashboard-tabs" ref={tabsRef}>
                            <div
                                className={`capsule-slider tab-theme-${categoryFilter}`}
                                style={{
                                    transform: `translateX(${indicatorStyle.left}px)`,
                                    width: `${indicatorStyle.width}px`,
                                    opacity: indicatorStyle.opacity
                                }}
                            />
                            <button 
                                type="button" 
                                data-tab="all"
                                className={`filter-tab ${categoryFilter === 'all' ? 'active' : ''}`}
                                onClick={() => handleTabSelect('all')}
                                title="Show all events"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                                </svg>
                                <span>All ({counts.all})</span>
                            </button>
                            <button 
                                type="button" 
                                data-tab="theater"
                                className={`filter-tab filter-tab--theater ${categoryFilter === 'theater' ? 'active' : ''}`}
                                onClick={() => handleTabSelect('theater')}
                                title="Theater & Performing Arts"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 11c0 5 4 9 9 9s9-4 9-9-4-7-9-7-9 2-9 7z" />
                                    <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
                                    <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor" />
                                    <path d="M8.5 15.5c1.2 1.5 5.8 1.5 7 0" />
                                </svg>
                                <span>Theater ({counts.theater})</span>
                            </button>
                            <button 
                                type="button" 
                                data-tab="concert"
                                className={`filter-tab filter-tab--concert ${categoryFilter === 'concert' ? 'active' : ''}`}
                                onClick={() => handleTabSelect('concert')}
                                title="Concerts & Live Music"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18V5l12-2v13" />
                                    <circle cx="6" cy="18" r="3" />
                                    <circle cx="18" cy="16" r="3" />
                                </svg>
                                <span>Concert ({counts.concert})</span>
                            </button>
                            <button 
                                type="button" 
                                data-tab="sport"
                                className={`filter-tab filter-tab--sport ${categoryFilter === 'sport' ? 'active' : ''}`}
                                onClick={() => handleTabSelect('sport')}
                                title="Sporting Matches & Tournaments"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                    <path d="M4 22h16" />
                                    <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
                                    <path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2z" />
                                </svg>
                                <span>Sport ({counts.sport})</span>
                            </button>
                        </div>
                    )}
                </div>

                {!hasEvents ? (
                    <div className="dashboard-empty-card">
                        <div className="morph-icon-box" style={{ margin: '0 auto 16px', width: '46px', height: '46px', color: 'var(--text-primary)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                            No Events Published Yet
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '22px', fontSize: '0.86rem', maxWidth: '400px', margin: '0 auto 22px', lineHeight: 1.5 }}>
                            Publish an event to start accepting ticket reservations, monitor live capacity, and view seat selection maps.
                        </p>
                        <Link 
                            to="/host-event" 
                            className="btn btn-primary btn-sm"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Host Your First Event
                        </Link>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div key={categoryFilter} className="dashboard-empty-card card-slide-transition">
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            No {categoryFilter} events found
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 auto 16px' }}>
                            You have not published any events in this category.
                        </p>
                        <button 
                            type="button" 
                            onClick={() => handleTabSelect('all')} 
                            className="btn btn-glass btn-sm"
                        >
                            View All Events
                        </button>
                    </div>
                ) : (
                    <div key={categoryFilter} className="card-slide-transition" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table className="dashboard-glass-table">
                            <thead>
                                <tr>
                                    <th>Event Title</th>
                                    <th>Category</th>
                                    <th>Date & Showtime</th>
                                    <th>Base Rate</th>
                                    <th>Promo Offer</th>
                                    <th>Attendee Rate</th>
                                    <th>Capacity Fill</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEvents.map(ev => {
                                    const pct = ev.capacity > 0 ? Math.round((ev.sold_tickets / ev.capacity) * 100) : 0;
                                    const fillGradient = ev.event_type === 'theater' 
                                        ? 'linear-gradient(90deg, #7a1230, #a21d42)'
                                        : ev.event_type === 'sport'
                                            ? 'linear-gradient(90deg, #146c43, #16a34a)'
                                            : 'linear-gradient(90deg, #7b2ff7, #9333ea)';
                                    const hasOffer = ev.offer_percent && ev.offer_percent > 0;
                                    const attendeePrice = ev.current_price != null ? ev.current_price : ev.price_per_ticket;

                                    return (
                                        <tr key={ev.event_id}>
                                            <td>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                                                    {ev.event_name}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span>{ev.venue}</span>
                                                    <span style={{ opacity: 0.5 }}>·</span>
                                                    <span className="mono" style={{ fontSize: '0.72rem' }}>#EV-{ev.event_id}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`dash-type-badge dash-type-${ev.event_type}`}>
                                                    <span style={{ 
                                                        width: '5px', 
                                                        height: '5px', 
                                                        borderRadius: '50%', 
                                                        background: ev.event_type === 'theater' ? '#7a1230' : ev.event_type === 'sport' ? '#146c43' : '#7b2ff7',
                                                        display: 'inline-block' 
                                                    }}></span>
                                                    {ev.event_type}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                                {formatDate(ev.time)}
                                            </td>
                                            <td>
                                                <span className="mono" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    ${ev.price_per_ticket.toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                {hasOffer ? (
                                                    <span style={{ 
                                                        display: 'inline-flex', 
                                                        alignItems: 'center', 
                                                        gap: '4px', 
                                                        background: 'rgba(239, 68, 68, 0.1)', 
                                                        color: '#dc2626', 
                                                        border: '1px solid rgba(239, 68, 68, 0.25)', 
                                                        borderRadius: '999px', 
                                                        padding: '2px 8px', 
                                                        fontSize: '0.72rem', 
                                                        fontWeight: 700, 
                                                        fontFamily: 'var(--font-mono)' 
                                                    }}>
                                                        🔥 {ev.offer_percent}% OFF
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 700, color: hasOffer ? '#10b981' : 'var(--text-primary)' }}>
                                                        ${attendeePrice.toFixed(2)}
                                                    </span>
                                                    {ev.hike_percent > 0 && (
                                                        <span style={{ fontSize: '0.68rem', color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                                                            +{ev.hike_percent}% surge
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="dash-occupancy">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{ev.sold_tickets} of {ev.capacity}</span>
                                                        <strong style={{ color: pct >= 90 ? '#dc2626' : pct >= 50 ? '#d97706' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                                                            {pct}%
                                                        </strong>
                                                    </div>
                                                    <div className="dash-occupancy-bar">
                                                        <div 
                                                            className="dash-occupancy-fill" 
                                                            style={{ 
                                                                width: `${Math.min(100, pct)}%`, 
                                                                background: fillGradient 
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                                    <button 
                                                        type="button"
                                                        onClick={() => openPricingModal(ev)} 
                                                        className="btn btn-primary btn-sm" 
                                                        style={{ fontSize: '0.76rem', padding: '6px 12px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                        title="Modify ticket pricing or apply promotional offers"
                                                    >
                                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="1" x2="12" y2="23" />
                                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                                        </svg>
                                                        Set Price & Offer
                                                    </button>
                                                    <Link 
                                                        to={`/events/${ev.event_id}/select-seat`} 
                                                        className="btn btn-glass btn-sm" 
                                                        style={{ fontSize: '0.76rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                                                    >
                                                        Seat Map →
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal: Post-Hosting Ticket Pricing & Promotional Offers */}
            {selectedEventForPricing && ReactDOM.createPortal(
                <div 
                    className="pricing-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !pricingSubmitting) {
                            setSelectedEventForPricing(null);
                        }
                    }}
                >
                    <div className="pricing-modal-dialog">
                        {/* Header */}
                        <div className="pricing-modal-header">
                            <div style={{ paddingRight: '12px' }}>
                                <span className="kicker" style={{ display: 'inline-block', marginBottom: '2px', fontSize: '0.68rem' }}>
                                    ORGANIZER PRICING
                                </span>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 2px', color: '#0f172a', letterSpacing: '-0.02em' }}>
                                    Adjust Price & Offer
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '340px' }}>
                                    {selectedEventForPricing.event_name} · {selectedEventForPricing.venue}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => !pricingSubmitting && setSelectedEventForPricing(null)}
                                className="pricing-modal-close"
                                aria-label="Close dialog"
                                title="Close dialog"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Status / Feedback alerts */}
                        {pricingMsg && (
                            <div 
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    marginBottom: '14px',
                                    fontSize: '0.82rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: pricingMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                    border: `1px solid ${pricingMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                                    color: pricingMsg.type === 'success' ? '#065f46' : '#991b1b',
                                    fontWeight: 600
                                }}
                            >
                                <span>{pricingMsg.type === 'success' ? '✓' : '⚠️'}</span>
                                <span>{pricingMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSavePricing}>
                            {/* Input 1: Base Ticket Price */}
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                                    Base Ticket Price ($ USD)
                                </label>
                                <div className="pricing-input-wrap">
                                    <span className="pricing-input-prefix">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        max="10000"
                                        value={pricingForm.price_per_ticket}
                                        onChange={(e) => setPricingForm({ ...pricingForm, price_per_ticket: e.target.value })}
                                        className="pricing-input-field"
                                        placeholder="75.00"
                                        required
                                        disabled={pricingSubmitting}
                                    />
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                                    Organizers can reprice tickets at any time after hosting.
                                </span>
                            </div>

                            {/* Input 2: Quick Promotional Offer Presets */}
                            <div style={{ marginBottom: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                                        Promotional Offer / Discount
                                    </label>
                                    <span style={{ 
                                        fontFamily: 'var(--font-mono)', 
                                        fontSize: '0.76rem', 
                                        fontWeight: 700, 
                                        padding: '2px 8px', 
                                        borderRadius: '6px',
                                        background: pricingForm.offer_percent > 0 ? '#fef2f2' : '#f1f5f9',
                                        color: pricingForm.offer_percent > 0 ? '#e11d48' : '#64748b',
                                        border: `1px solid ${pricingForm.offer_percent > 0 ? '#fecdd3' : '#e2e8f0'}`
                                    }}>
                                        {pricingForm.offer_percent}% OFF
                                    </span>
                                </div>

                                {/* Preset Offer Pills */}
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    {[0, 5, 10, 15, 20, 25, 30].map(pct => {
                                        const isSelected = Number(pricingForm.offer_percent) === pct;
                                        return (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => setPricingForm({ ...pricingForm, offer_percent: pct })}
                                                disabled={pricingSubmitting}
                                                className={`pricing-preset-pill ${isSelected ? 'active' : ''}`}
                                            >
                                                {pct === 0 ? 'No Offer (0%)' : `${pct}% OFF`}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Slider for granular customization */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="75"
                                        step="1"
                                        value={pricingForm.offer_percent}
                                        onChange={(e) => setPricingForm({ ...pricingForm, offer_percent: Number(e.target.value) })}
                                        disabled={pricingSubmitting}
                                        style={{ flex: 1, accentColor: '#18181b', cursor: 'pointer', height: '4px' }}
                                    />
                                    <div style={{ width: '56px' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="90"
                                            value={pricingForm.offer_percent}
                                            onChange={(e) => setPricingForm({ ...pricingForm, offer_percent: Math.min(90, Math.max(0, Number(e.target.value) || 0)) })}
                                            disabled={pricingSubmitting}
                                            style={{ 
                                                width: '100%',
                                                padding: '5px 6px', 
                                                textAlign: 'center', 
                                                fontFamily: 'var(--font-mono)', 
                                                fontSize: '0.82rem', 
                                                fontWeight: 600,
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                color: '#0f172a',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Live Calculation Preview Card */}
                            {(() => {
                                const base = parseFloat(pricingForm.price_per_ticket) || 0;
                                const hike = selectedEventForPricing.hike_percent || 0;
                                const surgePrice = roundPrice(base * (1 + hike / 100));
                                const offerPct = parseFloat(pricingForm.offer_percent) || 0;
                                const discount = roundPrice(surgePrice * (offerPct / 100));
                                const finalPrice = Math.max(roundPrice(surgePrice - discount), 1.0);

                                function roundPrice(num) {
                                    return Math.round(num * 100) / 100;
                                }

                                return (
                                    <div className="pricing-preview-box">
                                        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                                            Live Attendee Checkout Breakdown
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#475569' }}>Base Ticket Price:</span>
                                                <span className="mono" style={{ color: '#0f172a', fontWeight: 600 }}>${base.toFixed(2)}</span>
                                            </div>
                                            {hike > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b45309', fontWeight: 600 }}>
                                                    <span>Milestone Surge (+{hike}%):</span>
                                                    <span className="mono">+${(surgePrice - base).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {offerPct > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e11d48', fontWeight: 600 }}>
                                                    <span>Promotional Offer (-{offerPct}%):</span>
                                                    <span className="mono">-${discount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>Final Attendee Unit Price:</span>
                                                <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: offerPct > 0 ? '#059669' : '#0f172a' }}>
                                                    ${finalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Modal Action Buttons */}
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '2px' }}>
                                <button
                                    type="button"
                                    onClick={() => !pricingSubmitting && setSelectedEventForPricing(null)}
                                    disabled={pricingSubmitting}
                                    className="btn btn-glass btn-sm"
                                    style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={pricingSubmitting}
                                    className="btn btn-primary btn-sm"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '130px', justifyContent: 'center', padding: '7px 16px', borderRadius: '8px', fontSize: '0.8rem' }}
                                >
                                    {pricingSubmitting ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
