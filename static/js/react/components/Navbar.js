const { Link, useNavigate, useLocation } = ReactRouterDOM;
const { useState, useEffect, useRef } = React;

window.Navbar = () => {
    const { user, logout } = window.useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navLinksRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/');
    };

    // Determine current active navigation key
    let activeNav = '';
    const pathname = location.pathname;
    if (pathname === '/') {
        activeNav = 'events';
    } else if (pathname.startsWith('/dashboard')) {
        activeNav = 'dashboard';
    } else if (pathname.startsWith('/host-event')) {
        activeNav = 'host-event';
    } else if (pathname.startsWith('/my-tickets')) {
        activeNav = 'my-tickets';
    } else if (pathname.startsWith('/admin')) {
        activeNav = 'admin';
    }

    // Measure active tab for capsule slider
    const updateIndicator = (key) => {
        if (!navLinksRef.current) return;
        if (!key) {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
            return;
        }
        const activeEl = navLinksRef.current.querySelector(`[data-nav="${key}"]`);
        if (activeEl) {
            setIndicatorStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth,
                opacity: 1
            });
        } else {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
        }
    };

    useEffect(() => {
        updateIndicator(activeNav);
    }, [activeNav, user]);

    useEffect(() => {
        const timer = setTimeout(() => updateIndicator(activeNav), 40);
        const handleResize = () => updateIndicator(activeNav);
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [activeNav]);

    return (
        <nav className="glass-navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand-wrap">
                    <div className="brand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <span className="brand-text">AuraPass</span>
                </Link>

                <div className="nav-links" ref={navLinksRef}>
                    {/* Semi-transparent morph glass capsule slider */}
                    <div
                        className="nav-capsule-slider"
                        style={{
                            transform: `translateX(${indicatorStyle.left}px)`,
                            width: `${indicatorStyle.width}px`,
                            opacity: indicatorStyle.opacity
                        }}
                    />

                    <Link
                        to="/"
                        data-nav="events"
                        className={`nav-link ${activeNav === 'events' ? 'active' : ''}`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Events</span>
                    </Link>

                    {user?.user_type === 'buyer' && (
                        <Link
                            to="/my-tickets"
                            data-nav="my-tickets"
                            className={`nav-link ${activeNav === 'my-tickets' ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>My Tickets</span>
                        </Link>
                    )}

                    {user?.user_type === 'organizer' && (
                        <>
                            <Link
                                to="/dashboard"
                                data-nav="dashboard"
                                className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/host-event"
                                data-nav="host-event"
                                className={`nav-link ${activeNav === 'host-event' ? 'active' : ''}`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="16" />
                                    <line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                                <span>Host Event</span>
                            </Link>
                        </>
                    )}

                    {user?.user_type === 'admin' && (
                        <Link
                            to="/admin"
                            data-nav="admin"
                            className={`nav-link ${activeNav === 'admin' ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Admin</span>
                        </Link>
                    )}
                </div>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <div className="user-badge" title={`Signed in as ${user.username} (${user.user_type})`}>
                                <span className="user-avatar-dot">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <span className="user-name-text">{user.username}</span>
                                <span className={`user-role-tag role-${user.user_type}`}>
                                    {user.user_type}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="btn btn-glass btn-sm btn-logout" title="Sign out of account">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                <span>Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-glass btn-sm">Sign In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
