const { Link, useNavigate, useLocation } = ReactRouterDOM;
const { useState, useEffect, useRef } = React;

window.Navbar = () => {
    const { user, logout } = window.useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navLinksRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async (e) => {
        if (e) e.preventDefault();
        setMobileMenuOpen(false);
        await logout();
        navigate('/');
    };

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.classList.add('mobile-nav-locked');
        } else {
            document.body.classList.remove('mobile-nav-locked');
        }
        return () => document.body.classList.remove('mobile-nav-locked');
    }, [mobileMenuOpen]);

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

    // Measure active tab for desktop capsule slider
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
        const handleResize = () => {
            updateIndicator(activeNav);
            if (window.innerWidth > 860) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [activeNav]);

    return (
        <header className="glass-navbar">
            <div className="navbar-inner">
                {/* Brand Logo */}
                <Link to="/" className="brand-wrap" onClick={() => setMobileMenuOpen(false)}>
                    <div className="brand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                    </div>
                    <span className="brand-text">AuraPass</span>
                </Link>

                {/* Desktop Central Nav Links */}
                <nav className="nav-links desktop-nav" ref={navLinksRef} aria-label="Main Navigation">
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
                </nav>

                {/* Desktop Right Side Actions */}
                <div className="nav-actions desktop-actions">
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

                {/* Mobile Header Controls: quick action & hamburger button */}
                <div className="mobile-header-controls">
                    {user ? (
                        <div className="mobile-user-pill" onClick={() => setMobileMenuOpen(prev => !prev)} title="View menu & account">
                            <span className="user-avatar-dot">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <span className="mobile-username">{user.username}</span>
                        </div>
                    ) : (
                        <div className="mobile-auth-btn-group">
                            <Link to="/login" className="btn btn-glass btn-xs mobile-signin-btn">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-xs mobile-getstarted-btn">
                                Get Started
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        className={`mobile-hamburger-btn ${mobileMenuOpen ? 'is-open' : ''}`}
                        onClick={() => setMobileMenuOpen(prev => !prev)}
                        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className="hamburger-line line-1"></span>
                        <span className="hamburger-line line-2"></span>
                        <span className="hamburger-line line-3"></span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Backdrop */}
            <div
                className={`mobile-nav-backdrop ${mobileMenuOpen ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile Slide-Down Glass Drawer */}
            <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'is-open' : ''}`} aria-hidden={!mobileMenuOpen}>
                <div className="mobile-drawer-header">
                    <div className="mobile-drawer-title">Navigation Menu</div>
                    <button
                        type="button"
                        className="mobile-drawer-close"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close navigation menu"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="mobile-nav-list">
                    <Link
                        to="/"
                        className={`mobile-nav-item ${activeNav === 'events' ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="mobile-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="mobile-nav-label">
                            <span className="title">Events</span>
                            <span className="desc">Explore live concerts, theater & sports</span>
                        </div>
                    </Link>

                    {user?.user_type === 'buyer' && (
                        <Link
                            to="/my-tickets"
                            className={`mobile-nav-item ${activeNav === 'my-tickets' ? 'is-active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="mobile-nav-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div className="mobile-nav-label">
                                <span className="title">My Tickets</span>
                                <span className="desc">View purchased passes & seat QR codes</span>
                            </div>
                        </Link>
                    )}

                    {user?.user_type === 'organizer' && (
                        <>
                            <Link
                                to="/dashboard"
                                className={`mobile-nav-item ${activeNav === 'dashboard' ? 'is-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="mobile-nav-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                        <line x1="12" y1="22.08" x2="12" y2="12" />
                                    </svg>
                                </div>
                                <div className="mobile-nav-label">
                                    <span className="title">Dashboard</span>
                                    <span className="desc">Manage active events & pricing</span>
                                </div>
                            </Link>

                            <Link
                                to="/host-event"
                                className={`mobile-nav-item ${activeNav === 'host-event' ? 'is-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="mobile-nav-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="16" />
                                        <line x1="8" y1="12" x2="16" y2="12" />
                                    </svg>
                                </div>
                                <div className="mobile-nav-label">
                                    <span className="title">Host Event</span>
                                    <span className="desc">Publish a new concert, theater, or match</span>
                                </div>
                            </Link>
                        </>
                    )}

                    {user?.user_type === 'admin' && (
                        <Link
                            to="/admin"
                            className={`mobile-nav-item ${activeNav === 'admin' ? 'is-active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="mobile-nav-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="mobile-nav-label">
                                <span className="title">Admin Panel</span>
                                <span className="desc">Platform overview & user controls</span>
                            </div>
                        </Link>
                    )}
                </div>

                <div className="mobile-drawer-footer">
                    {user ? (
                        <div className="mobile-user-card">
                            <div className="mobile-user-info">
                                <span className="user-avatar-dot">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <div>
                                    <div className="mobile-user-name">{user.username}</div>
                                    <span className={`user-role-tag role-${user.user_type}`}>
                                        {user.user_type}
                                    </span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn btn-glass btn-sm btn-mobile-signout">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="mobile-auth-actions">
                            <Link to="/login" className="btn btn-glass" onClick={() => setMobileMenuOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
