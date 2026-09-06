const { useState, useEffect, useRef } = React;
const { Link } = ReactRouterDOM;

const SHOWCASE_IDEAS = [
    "Concerts & Live Music",
    "Theater & Performing Arts",
    "Sporting Matches",
    "Dynamic Pricing"
];

window.Home = () => {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('');
    const { user } = window.useAuth();

    // Typewriter effect state
    const [ideaIndex, setIdeaIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Sliding capsule measurement ref & state
    const tabsRef = useRef(null);
    const tabsWrapperRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    const handleTabSelect = (tabKey) => {
        setFilter(tabKey);

        // Smoothly scroll/slide page only if tabs are scrolled far below the sticky threshold
        requestAnimationFrame(() => {
            if (tabsWrapperRef.current) {
                const navbarHeight = 60;
                const rect = tabsWrapperRef.current.getBoundingClientRect();
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                // If tabs are below the sticky position (e.g. user is at top of page), bring into view
                if (rect.top > navbarHeight + 30) {
                    const targetY = currentScroll + rect.top - navbarHeight - 12;
                    window.scrollTo({
                        top: Math.max(0, targetY),
                        behavior: 'smooth'
                    });
                }
            }
        });
    };

    // Typewriter loop with generous reading gap
    useEffect(() => {
        const fullText = SHOWCASE_IDEAS[ideaIndex];
        let timeout;

        if (!isDeleting) {
            // Typing forward letter-by-letter
            if (displayText.length < fullText.length) {
                timeout = setTimeout(() => {
                    setDisplayText(fullText.slice(0, displayText.length + 1));
                }, 45);
            } else {
                // Full type displayed - 3.8s reading time gap so the user can easily read
                timeout = setTimeout(() => {
                    setIsDeleting(true);
                }, 3800);
            }
        } else {
            // Erasing backward
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(fullText.slice(0, displayText.length - 1));
                }, 25);
            } else {
                // Erased completely - pause for 650ms before typing the next type
                timeout = setTimeout(() => {
                    setIsDeleting(false);
                    setIdeaIndex((prev) => (prev + 1) % SHOWCASE_IDEAS.length);
                }, 650);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, ideaIndex]);

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
        updateIndicator(filter);
    }, [filter]);

    useEffect(() => {
        // Initial measurement
        const timer = setTimeout(() => {
            updateIndicator(filter);
        }, 60);

        const handleResize = () => updateIndicator(filter);
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        fetchEvents(filter);
    }, [filter]);

    const fetchEvents = async (type) => {
        let url = '/api/events/';
        if (type) {
            url += `?event_type=${type}`;
        }
        try {
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (err) {
            console.error("Failed to fetch events:", err);
        }
    };

    return (
        <div className="container">
            <header className="section-head fade-up">
                <div className="hero-badge-container">
                    <div className="hero-badge--typewriter">
                        <span className="typewriter-content">
                            <span className="typewriter-text">{displayText}</span>
                            <span className="typewriter-cursor"></span>
                        </span>
                    </div>
                </div>
                <h1 className="section-title">Stage, Screen & Stadium</h1>
                <p className="section-subtitle">Real-time availability and dynamic pricing. Pick your seats and secure your pass.</p>
                <div style={{ marginTop: '16px' }}>
                    <div className="group-discount-pill">
                        <span className="discount-tag-icon">🏷️</span>
                        <span><strong>Special Booking Offer:</strong> Enjoy <strong>5% OFF</strong> on every additional ticket when you book more than 2 tickets!</span>
                    </div>
                </div>
            </header>

            <div className="filter-tabs-wrapper fade-up fade-up-d1" ref={tabsWrapperRef}>
                <div className="filter-tabs" ref={tabsRef}>
                    {/* Smooth Sliding Capsule Background */}
                    <div
                        className={`capsule-slider tab-theme-${filter || 'all'}`}
                        style={{
                            transform: `translateX(${indicatorStyle.left}px)`,
                            width: `${indicatorStyle.width}px`,
                            opacity: indicatorStyle.opacity
                        }}
                    />

                    <button
                        data-tab=""
                        onClick={() => handleTabSelect('')}
                        className={`filter-tab ${filter === '' ? 'active' : ''}`}
                        title="Show all events"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span>All</span>
                    </button>
                    <button
                        data-tab="concert"
                        onClick={() => handleTabSelect('concert')}
                        className={`filter-tab filter-tab--concert ${filter === 'concert' ? 'active' : ''}`}
                        title="Concerts & Live Music"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                        </svg>
                        <span>Concerts</span>
                    </button>
                    <button
                        data-tab="theater"
                        onClick={() => handleTabSelect('theater')}
                        className={`filter-tab filter-tab--theater ${filter === 'theater' ? 'active' : ''}`}
                        title="Theater & Performing Arts"
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
                        data-tab="sport"
                        onClick={() => handleTabSelect('sport')}
                        className={`filter-tab filter-tab--sport ${filter === 'sport' ? 'active' : ''}`}
                        title="Sporting Matches & Tournaments"
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

            {events.length === 0 ? (
                <div key={filter || 'all'} className="empty-tickets-glass card-slide-transition fade-up fade-up-d2">
                    <div className="empty-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="6" width="20" height="12" rx="3" />
                            <circle cx="7" cy="12" r="1.5" fill="currentColor" />
                            <path d="M12 6v12" strokeDasharray="2 2" />
                            <circle cx="17" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>
                        {filter ? `No ${filter} events listed yet` : 'No Live Events Currently Listed'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
                        {filter
                            ? `Try switching to another category tab or check back soon.`
                            : `Upcoming concerts, theater productions, and sports matches will appear here with interactive seat maps.`}
                    </p>

                    <div className="empty-cta-box">
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                {user?.user_type === 'organizer' ? 'Ready to host an event?' : 'Are you an event organizer?'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {user?.user_type === 'organizer'
                                    ? 'Publish your live event right from your organizer dashboard.'
                                    : 'Sign in to create, price, and publish your own live events.'}
                            </div>
                        </div>
                        {user?.user_type === 'organizer' ? (
                            <Link to="/host-event" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                                Host Event →
                            </Link>
                        ) : (
                            <Link to="/login" className="btn btn-glass btn-sm" style={{ whiteSpace: 'nowrap' }}>
                                Sign In →
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div key={filter || 'all'} className="event-grid card-slide-transition">
                    {events.map((ev, index) => {
                        const soldPercent = (ev.sold_tickets / ev.capacity) * 100;
                        const remaining = Math.max(0, ev.capacity - ev.sold_tickets);
                        const isSoldOut = remaining === 0 || ev.sold_tickets >= ev.capacity;

                        const formatDate = (isoStr) => {
                            if (!isoStr) return '';
                            try {
                                const d = new Date(isoStr);
                                if (isNaN(d.getTime())) return isoStr.split('T')[0];
                                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            } catch (_) {
                                return isoStr.split('T')[0];
                            }
                        };

                        const formatStartsIn = (item) => {
                            if (item.time_left_str) {
                                return item.time_left_str.replace(' left', '');
                            }
                            if (!item.time) return 'Soon';
                            const diff = new Date(item.time) - new Date();
                            if (diff <= 0) return 'Live now';
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            if (hours < 24) return `${Math.max(1, hours)}h`;
                            const days = Math.floor(hours / 24);
                            return `${days}d`;
                        };

                        return (
                            <div
                                key={ev.event_id}
                                className={`ticket ticket--${ev.event_type} fade-up`}
                                style={{ animationDelay: `${(index % 4) * 0.08}s` }}
                            >
                                <div className="ticket__main">
                                    <div className="ticket__top">
                                        <span className="ticket__type">{ev.event_type}</span>
                                        <span className="ticket__id">#EV-{ev.event_id}</span>
                                    </div>

                                    <h2 className="ticket__title">{ev.event_name}</h2>
                                    {ev.subtitle ? (
                                        <p className="ticket__subtitle">{ev.subtitle}</p>
                                    ) : (
                                        <p className="ticket__subtitle" style={{ visibility: 'hidden' }}>—</p>
                                    )}

                                    <div className="ticket__divider"></div>

                                    <div className="ticket__meta">
                                        <div className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
                                                <circle cx="12" cy="9.5" r="2.3" />
                                            </svg>
                                            <div className="stack">
                                                <span className="meta-label">Venue</span>
                                                <span className="meta-value">{ev.venue}</span>
                                            </div>
                                        </div>
                                        <div className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <rect x="3" y="5" width="18" height="16" rx="2" />
                                                <path d="M3 9h18M8 3v4M16 3v4" />
                                            </svg>
                                            <div className="stack">
                                                <span className="meta-label">Date</span>
                                                <span className="meta-value">{formatDate(ev.time)}</span>
                                            </div>
                                        </div>
                                        <div className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M12 7v5l3.5 2" />
                                            </svg>
                                            <div className="stack">
                                                <span className="meta-label">Starts in</span>
                                                <span className="meta-value">{formatStartsIn(ev)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ticket__bottom" style={{ marginTop: '6px' }}>
                                        <div className="sold-block">
                                            <span className="meta-label">Sold — {ev.sold_tickets} of {ev.capacity}</span>
                                            <div className="sold-bar">
                                                <div className="sold-bar__fill" style={{ width: `${Math.min(100, soldPercent)}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="price-block">
                                            <span className="meta-label">Price</span>
                                            <div className="price-wrap">
                                                <span className="price">${ev.current_price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="ticket__perforation">
                                    <span className="notch notch--left"></span>
                                    <span className="notch notch--right"></span>
                                </div>

                                <div className="ticket__buy">
                                    <div className="avail">
                                        <span className="avail__count">{isSoldOut ? 'Sold out' : `${remaining} left`}</span>
                                        <span className="avail__label">of {ev.capacity} total</span>
                                    </div>

                                    {user?.user_type === 'organizer' ? (
                                        <div className="select-btn select-btn--organizer">
                                            View Only (Organizer)
                                        </div>
                                    ) : isSoldOut ? (
                                        <button className="select-btn select-btn--sold-out" type="button" disabled>
                                            Sold out
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <Link to={`/events/${ev.event_id}/select-seat`} className="select-btn">
                                            Select seats
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
