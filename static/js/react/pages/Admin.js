const { useState, useEffect, useRef } = React;
const { Link, Navigate } = ReactRouterDOM;

window.Admin = () => {
    const { user } = window.useAuth();

    // Data States
    const [analytics, setAnalytics] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [buyersList, setBuyersList] = useState([]);
    const [organizersList, setOrganizersList] = useState([]);
    const [healthData, setHealthData] = useState(null);

    // UI States
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'buyers' | 'organizers' | 'health'
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'buyer' | 'organizer' | 'admin'
    const [expandedBuyers, setExpandedBuyers] = useState({});
    const [expandedOrganizers, setExpandedOrganizers] = useState({});
    const [copiedCode, setCopiedCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(15); // in seconds, 0 = off

    // If user is not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Role-based access control: Admin only
    if (user.user_type !== 'admin') {
        return (
            <div className="container fade-up" style={{ maxWidth: '640px', paddingTop: '80px', paddingBottom: '80px' }}>
                <div className="glass-panel" style={{ padding: '44px 36px', textAlign: 'center' }}>
                    <div className="morph-icon-box" style={{ margin: '0 auto 20px', width: '48px', height: '48px', color: '#dc2626' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <span className="kicker" style={{ display: 'inline-block', marginBottom: '8px', color: '#dc2626' }}>ADMINISTRATOR ACCESS ONLY</span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                        Elevated Privileges Required
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 24px' }}>
                        The AuraPass Command Console is strictly restricted to system administrators. To manage users or review platform diagnostics, sign in with an administrator account.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/" className="btn btn-glass btn-sm">
                            ← Return to Events
                        </Link>
                        <Link to="/login" className="btn btn-primary btn-sm">
                            Switch Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Fetch all administrative telemetry datasets
    const fetchAllData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        setErrorMsg('');

        try {
            const [resAnalytics, resUsers, resBuyers, resOrganizers, resHealth] = await Promise.all([
                fetch('/api/admin/analytics'),
                fetch('/api/admin/users'),
                fetch('/api/admin/buyers'),
                fetch('/api/admin/organizers'),
                fetch('/api/admin/server-health')
            ]);

            if (resAnalytics.ok) setAnalytics(await resAnalytics.json());
            if (resUsers.ok) setUsersList(await resUsers.json());
            if (resBuyers.ok) setBuyersList(await resBuyers.json());
            if (resOrganizers.ok) setOrganizersList(await resOrganizers.json());
            if (resHealth.ok) setHealthData(await resHealth.json());

            if (!resAnalytics.ok && !resHealth.ok) {
                setErrorMsg('Failed to load administrative telemetry. Verify server session.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Network error communicating with administrative endpoints.');
        } finally {
            setLoading(false);
            if (isManual) {
                setTimeout(() => setRefreshing(false), 500);
            }
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Periodic auto-refresh timer
    useEffect(() => {
        if (!autoRefreshInterval || autoRefreshInterval <= 0) return;
        const intervalId = setInterval(() => {
            fetchAllData(false);
        }, autoRefreshInterval * 1000);
        return () => clearInterval(intervalId);
    }, [autoRefreshInterval]);

    const toggleBuyerExpand = (u_id) => {
        setExpandedBuyers(prev => ({ ...prev, [u_id]: !prev[u_id] }));
    };

    const toggleOrganizerExpand = (u_id) => {
        setExpandedOrganizers(prev => ({ ...prev, [u_id]: !prev[u_id] }));
    };

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedCode(text);
            setTimeout(() => setCopiedCode(null), 2000);
        }
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return 'N/A';
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (_) {
            return isoStr;
        }
    };

    const formatDateTime = (isoStr) => {
        if (!isoStr) return 'N/A';
        try {
            const d = new Date(isoStr);
            return d.toLocaleString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (_) {
            return isoStr;
        }
    };

    // Filtered User Accounts
    const filteredUsers = usersList.filter(u => {
        const matchesRole = roleFilter === 'all' || u.user_type === roleFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            String(u.u_id) === q;
        return matchesRole && matchesSearch;
    });

    // Filtered Buyers
    const filteredBuyers = buyersList.filter(b => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        const inUser = b.username.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
        const inTickets = b.tickets && b.tickets.some(t =>
            t.ticket_code.toLowerCase().includes(q) ||
            t.event_name.toLowerCase().includes(q) ||
            t.venue.toLowerCase().includes(q) ||
            t.position_of_seat.toLowerCase().includes(q)
        );
        return inUser || inTickets;
    });

    // Filtered Organizers
    const filteredOrganizers = organizersList.filter(o => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        const inUser = o.username.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
        const inEvents = o.events && o.events.some(ev =>
            ev.event_name.toLowerCase().includes(q) ||
            ev.venue.toLowerCase().includes(q) ||
            ev.event_type.toLowerCase().includes(q)
        );
        return inUser || inEvents;
    });

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
                <div className="glass-panel" style={{ padding: '60px 20px', maxWidth: '480px', margin: '0 auto' }}>
                    <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Initializing AuraPass Admin Console & Server Telemetry...
                    </p>
                </div>
            </div>
        );
    }

    const srv = healthData || analytics?.server || {};
    const metrics = analytics?.metrics || {};

    return (
        <div className="container fade-up" style={{ paddingBottom: '90px', paddingTop: '28px' }}>
            {/* Top Command Center Hero Header */}
            <div className="dashboard-hero">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span className="kicker" style={{ margin: 0 }}>PLATFORM GOVERNANCE & TELEMETRY</span>
                        <span className="role-badge role-badge-admin">Admin Privileges</span>
                    </div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Admin Command Center
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px', margin: 0 }}>
                        System load analysis, registered user directory, ticket logs, and organizer event distribution.
                    </p>
                </div>

                <div className="admin-header-actions">
                    {/* Live Server Pulse Pill */}
                    <div className="admin-status-pill" title="Real-time Server Operational Status">
                        <span className={`status-pulse-dot ${srv.status === 'degraded' ? 'warning' : ''}`} />
                        <span>Server {srv.status === 'degraded' ? 'Elevated Load' : 'Healthy'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span>{srv.uptime || 'Active'}</span>
                    </div>

                    {/* Auto-refresh interval dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.8)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>REFRESH:</span>
                        <select
                            value={autoRefreshInterval}
                            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value={10}>10s</option>
                            <option value={15}>15s</option>
                            <option value={30}>30s</option>
                            <option value={60}>60s</option>
                            <option value={0}>Manual</option>
                        </select>
                    </div>

                    {/* Manual Refresh Button */}
                    <button
                        onClick={() => fetchAllData(true)}
                        className={`admin-refresh-btn ${refreshing ? 'spinning' : ''}`}
                        title="Force sync server metrics"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
                        </svg>
                        <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className="alert-box alert-danger" style={{ marginBottom: '22px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Navigation Tabs Capsule */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div className="admin-nav-capsule">
                    <button
                        className={`admin-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span>Overview</span>
                    </button>

                    <button
                        className={`admin-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>All Accounts</span>
                        <span className="tab-badge">{usersList.length}</span>
                    </button>

                    <button
                        className={`admin-nav-tab ${activeTab === 'buyers' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('buyers'); setSearchQuery(''); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                            <rect x="2" y="6" width="20" height="12" rx="3" />
                            <circle cx="7" cy="12" r="1.5" fill="currentColor" />
                            <path d="M12 6v12" strokeDasharray="2 2" />
                            <circle cx="17" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                        <span>Attendees & Tickets</span>
                        <span className="tab-badge">{buyersList.length}</span>
                    </button>

                    <button
                        className={`admin-nav-tab ${activeTab === 'organizers' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('organizers'); setSearchQuery(''); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                        <span>Organizers & Events</span>
                        <span className="tab-badge">{organizersList.length}</span>
                    </button>

                    <button
                        className={`admin-nav-tab ${activeTab === 'health' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('health'); setSearchQuery(''); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        <span>Server Health & Load</span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* TAB 1: OVERVIEW                                               */}
            {/* ============================================================== */}
            {activeTab === 'overview' && (
                <div className="fade-up">
                    {/* Primary KPI Cards Grid */}
                    <div className="dashboard-kpi-grid">
                        {/* Total Users KPI */}
                        <div className="dashboard-kpi-card" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer' }}>
                            <div className="dashboard-kpi-header">
                                <span className="dashboard-kpi-label">TOTAL ACCOUNTS</span>
                                <div className="dashboard-kpi-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="dashboard-kpi-value">{metrics.total_users || usersList.length}</div>
                            <div className="dashboard-kpi-sub" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span><strong>{metrics.total_buyers ?? buyersList.length}</strong> Attendees</span>
                                <span>•</span>
                                <span><strong>{metrics.total_organizers ?? organizersList.length}</strong> EOs</span>
                                <span>•</span>
                                <span><strong>{metrics.total_admins || 1}</strong> Admin</span>
                            </div>
                        </div>

                        {/* Platform Revenue KPI */}
                        <div className="dashboard-kpi-card">
                            <div className="dashboard-kpi-header">
                                <span className="dashboard-kpi-label">GROSS PLATFORM REVENUE</span>
                                <div className="dashboard-kpi-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="dashboard-kpi-value">${(metrics.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className="dashboard-kpi-sub">Across all dynamic sales milestones</div>
                        </div>

                        {/* Tickets Sold KPI */}
                        <div className="dashboard-kpi-card" onClick={() => setActiveTab('buyers')} style={{ cursor: 'pointer' }}>
                            <div className="dashboard-kpi-header">
                                <span className="dashboard-kpi-label">TICKETS DISPATCHED</span>
                                <div className="dashboard-kpi-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <rect x="2" y="6" width="20" height="12" rx="3" />
                                        <circle cx="7" cy="12" r="1.5" fill="currentColor" />
                                        <path d="M12 6v12" strokeDasharray="2 2" />
                                        <circle cx="17" cy="12" r="1.5" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>
                            <div className="dashboard-kpi-value">{metrics.total_tickets_sold || 0}</div>
                            <div className="dashboard-kpi-sub">Verified cryptographic admission passes</div>
                        </div>

                        {/* Events Hosted KPI */}
                        <div className="dashboard-kpi-card" onClick={() => setActiveTab('organizers')} style={{ cursor: 'pointer' }}>
                            <div className="dashboard-kpi-header">
                                <span className="dashboard-kpi-label">EVENTS HOSTED</span>
                                <div className="dashboard-kpi-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="16" />
                                        <line x1="8" y1="12" x2="16" y2="12" />
                                    </svg>
                                </div>
                            </div>
                            <div className="dashboard-kpi-value">{metrics.total_events || 0}</div>
                            <div className="dashboard-kpi-sub">
                                <span><strong>{metrics.active_events || 0}</strong> Active on Booking Grid</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Row: Event Categories & Quick Server Load */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                        {/* Event Types Breakdown */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                                <span className="kicker" style={{ margin: 0 }}>CATEGORY DISTRIBUTION</span>
                                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Ticket Volume</span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
                                Event Genre Sales & Velocity
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {(analytics?.event_type_breakdown || []).map((t) => (
                                    <div key={t.event_type} style={{ background: 'rgba(255,255,255,0.7)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className={`dash-type-badge dash-type-${t.event_type}`}>
                                                    {t.event_type}
                                                </span>
                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                    {t.event_count} event{t.event_count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                                                ${Number(t.type_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            <span>Tickets Sold: <strong>{t.total_sold}</strong></span>
                                            <span>Share of total catalog</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Server Health Summary */}
                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                                <span className="kicker" style={{ margin: 0 }}>LIVE TELEMETRY GLANCE</span>
                                <button
                                    onClick={() => setActiveTab('health')}
                                    className="btn btn-glass btn-sm"
                                    style={{ fontSize: '0.74rem', padding: '3px 10px' }}
                                >
                                    Deep Diagnostics →
                                </button>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
                                Host Infrastructure Status
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>CPU Processor Load</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '60px', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(srv.cpu?.percent ?? srv.cpu_percent ?? 5, 100)}%`, height: '100%', background: '#18181b', borderRadius: '3px' }} />
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem' }}>
                                            {srv.cpu?.percent ?? srv.cpu_percent ?? 0}%
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>System RAM Memory</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '60px', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(srv.memory?.percent ?? srv.memory_percent ?? 40, 100)}%`, height: '100%', background: '#18181b', borderRadius: '3px' }} />
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem' }}>
                                            {srv.memory?.percent ?? srv.memory_percent ?? 0}%
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>SQLite Database Query Ping</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem', color: '#15803d' }}>
                                        {srv.database?.latency_ms ?? srv.latency_ms ?? 1.2} ms (Optimal)
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Process Uptime</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem' }}>
                                        {srv.uptime || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: ALL USER ACCOUNTS DIRECTORY                            */}
            {/* ============================================================== */}
            {activeTab === 'users' && (
                <div className="fade-up">
                    <div className="directory-toolbar">
                        <div className="directory-search-input-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="directory-search-input"
                                placeholder="Search by username, email, or user ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Role filter segmented buttons */}
                        <div className="dashboard-filter-chips">
                            <button
                                className={`dashboard-filter-chip ${roleFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('all')}
                            >
                                All ({usersList.length})
                            </button>
                            <button
                                className={`dashboard-filter-chip ${roleFilter === 'buyer' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('buyer')}
                            >
                                Attendees ({usersList.filter(u => u.user_type === 'buyer').length})
                            </button>
                            <button
                                className={`dashboard-filter-chip ${roleFilter === 'organizer' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('organizer')}
                            >
                                Organizers ({usersList.filter(u => u.user_type === 'organizer').length})
                            </button>
                            <button
                                className={`dashboard-filter-chip ${roleFilter === 'admin' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('admin')}
                            >
                                Admins ({usersList.filter(u => u.user_type === 'admin').length})
                            </button>
                        </div>
                    </div>

                    {/* Users Glass Table */}
                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <table className="dashboard-glass-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>ID</th>
                                    <th>User Account</th>
                                    <th>Role</th>
                                    <th>Activity Breakdown</th>
                                    <th>Registered Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.u_id}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                                            #{u.u_id}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="admin-avatar-box" style={{ width: '34px', height: '34px', fontSize: '0.82rem' }}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.username}</div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge role-badge-${u.user_type}`}>
                                                {u.user_type === 'buyer' ? 'Attendee' : u.user_type === 'organizer' ? 'Event Organizer' : 'Admin'}
                                            </span>
                                        </td>
                                        <td>
                                            {u.user_type === 'buyer' ? (
                                                <div style={{ fontSize: '0.82rem' }}>
                                                    <strong>{u.tickets_bought}</strong> ticket{u.tickets_bought !== 1 ? 's' : ''} bought
                                                    <span style={{ color: 'var(--text-muted)', margin: '0 5px' }}>·</span>
                                                    <span style={{ color: '#15803d', fontWeight: 600 }}>${u.total_spent.toFixed(2)} spent</span>
                                                </div>
                                            ) : u.user_type === 'organizer' ? (
                                                <div style={{ fontSize: '0.82rem' }}>
                                                    <strong>{u.events_hosted}</strong> event{u.events_hosted !== 1 ? 's' : ''} hosted
                                                    <span style={{ color: 'var(--text-muted)', margin: '0 5px' }}>·</span>
                                                    <span style={{ color: '#6d28d9', fontWeight: 600 }}>${u.organizer_revenue.toFixed(2)} sales</span>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                    Platform Administrator
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            {formatDate(u.created_at)}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {u.user_type === 'buyer' && (
                                                <button
                                                    onClick={() => { setActiveTab('buyers'); setSearchQuery(u.username); }}
                                                    className="btn btn-glass btn-sm"
                                                    style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                                                >
                                                    View Tickets →
                                                </button>
                                            )}
                                            {u.user_type === 'organizer' && (
                                                <button
                                                    onClick={() => { setActiveTab('organizers'); setSearchQuery(u.username); }}
                                                    className="btn btn-glass btn-sm"
                                                    style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                                                >
                                                    View Events →
                                                </button>
                                            )}
                                            {u.user_type === 'admin' && (
                                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>CLI Provisioned</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                            No user accounts match the current filter or search query.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: ATTENDEES & PURCHASED TICKETS                          */}
            {/* ============================================================== */}
            {activeTab === 'buyers' && (
                <div className="fade-up">
                    <div className="directory-toolbar">
                        <div className="directory-search-input-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="directory-search-input"
                                placeholder="Search attendee name, email, ticket code, or event title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Showing <strong>{filteredBuyers.length}</strong> attendee{filteredBuyers.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Buyer Accounts List */}
                    {filteredBuyers.map((buyer) => {
                        const isExpanded = !!expandedBuyers[buyer.u_id];
                        const tickets = buyer.tickets || [];

                        return (
                            <div key={buyer.u_id} className="admin-entity-card">
                                <div
                                    className="admin-entity-header"
                                    onClick={() => toggleBuyerExpand(buyer.u_id)}
                                >
                                    <div className="admin-entity-main">
                                        <div className="admin-avatar-box">
                                            {buyer.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="admin-entity-name">
                                                <span>{buyer.username}</span>
                                                <span className="role-badge role-badge-buyer">Attendee</span>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                                    #{buyer.u_id}
                                                </span>
                                            </div>
                                            <div className="admin-entity-sub">
                                                {buyer.email} · Member since {formatDate(buyer.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-entity-stats">
                                        <div className="admin-stat-unit">
                                            <div className="admin-stat-unit-label">Passes Bought</div>
                                            <div className="admin-stat-unit-val">{buyer.tickets_bought}</div>
                                        </div>
                                        <div className="admin-stat-unit">
                                            <div className="admin-stat-unit-label">Total Spent</div>
                                            <div className="admin-stat-unit-val" style={{ color: '#15803d' }}>
                                                ${buyer.total_spent.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className={`admin-expand-icon ${isExpanded ? 'expanded' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Ticket Passes Section */}
                                {isExpanded && (
                                    <div className="admin-entity-body">
                                        <div className="admin-sublist-header">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                                                <rect x="2" y="6" width="20" height="12" rx="3" />
                                                <circle cx="7" cy="12" r="1.5" fill="currentColor" />
                                                <path d="M12 6v12" strokeDasharray="2 2" />
                                                <circle cx="17" cy="12" r="1.5" fill="currentColor" />
                                            </svg>
                                            <span>Purchased Admission Tickets ({tickets.length})</span>
                                        </div>

                                        {tickets.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                                No tickets have been booked by this attendee yet.
                                            </div>
                                        ) : (
                                            <div className="admin-tickets-grid">
                                                {tickets.map((t) => (
                                                    <div key={t.sell_id} className="admin-ticket-pill-card">
                                                        <div className="admin-ticket-top">
                                                            <span className={`dash-type-badge dash-type-${t.event_type}`}>
                                                                {t.event_type}
                                                            </span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span className="admin-ticket-code">{t.ticket_code}</span>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(t.ticket_code); }}
                                                                    title="Copy ticket code"
                                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px', color: 'var(--text-muted)' }}
                                                                >
                                                                    {copiedCode === t.ticket_code ? (
                                                                        <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>Copied!</span>
                                                                    ) : (
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="admin-ticket-title" title={t.event_name}>
                                                            {t.event_name}
                                                        </div>

                                                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                                                            📍 {t.venue}
                                                        </div>

                                                        <div className="admin-ticket-meta" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '6px', marginTop: '2px' }}>
                                                            <span>💺 {t.position_of_seat}</span>
                                                            <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.84rem' }}>
                                                                ${Number(t.selling_price).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                                            <span>Event: {formatDate(t.event_time)}</span>
                                                            <span>Booked: {formatDate(t.purchased_at)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredBuyers.length === 0 && (
                        <div className="dashboard-empty-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No Attendee Accounts Found</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                                No buyer accounts match your current query.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: ORGANIZERS & HOSTED EVENTS                             */}
            {/* ============================================================== */}
            {activeTab === 'organizers' && (
                <div className="fade-up">
                    <div className="directory-toolbar">
                        <div className="directory-search-input-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="directory-search-input"
                                placeholder="Search organizer name, email, event title, or venue..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Showing <strong>{filteredOrganizers.length}</strong> Event Organizer{filteredOrganizers.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Organizer Accounts List */}
                    {filteredOrganizers.map((eo) => {
                        const isExpanded = !expandedOrganizers[eo.u_id];
                        const events = eo.events || [];

                        return (
                            <div key={eo.u_id} className="admin-entity-card">
                                <div
                                    className="admin-entity-header"
                                    onClick={() => toggleOrganizerExpand(eo.u_id)}
                                >
                                    <div className="admin-entity-main">
                                        <div className="admin-avatar-box" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
                                            {eo.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="admin-entity-name">
                                                <span>{eo.username}</span>
                                                <span className="role-badge role-badge-organizer">Event Organizer</span>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                                    #{eo.u_id}
                                                </span>
                                            </div>
                                            <div className="admin-entity-sub">
                                                {eo.email} · Registered {formatDate(eo.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-entity-stats">
                                        <div className="admin-stat-unit">
                                            <div className="admin-stat-unit-label">Events Hosted</div>
                                            <div className="admin-stat-unit-val">{eo.events_hosted}</div>
                                        </div>
                                        <div className="admin-stat-unit">
                                            <div className="admin-stat-unit-label">Tickets Sold</div>
                                            <div className="admin-stat-unit-val">{eo.total_tickets_sold}</div>
                                        </div>
                                        <div className="admin-stat-unit">
                                            <div className="admin-stat-unit-label">Revenue Generated</div>
                                            <div className="admin-stat-unit-val" style={{ color: '#6d28d9' }}>
                                                ${eo.total_revenue.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className={`admin-expand-icon ${isExpanded ? 'expanded' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Events Section */}
                                {isExpanded && (
                                    <div className="admin-entity-body">
                                        <div className="admin-sublist-header">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <span>Hosted Event Roster & Sales Performance ({events.length})</span>
                                        </div>

                                        {events.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                                                This organizer has not hosted any events yet.
                                            </div>
                                        ) : (
                                            <div className="admin-events-grid">
                                                {events.map((ev) => (
                                                    <div key={ev.event_id} className="admin-event-subcard">
                                                        <div className="admin-event-subcard-header">
                                                            <span className={`dash-type-badge dash-type-${ev.event_type}`}>
                                                                {ev.event_type}
                                                            </span>
                                                            <span style={{
                                                                fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 700,
                                                                padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase',
                                                                background: ev.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.06)',
                                                                color: ev.status === 'active' ? '#065f46' : 'var(--text-muted)'
                                                            }}>
                                                                {ev.status}
                                                            </span>
                                                        </div>

                                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                                            {ev.event_name}
                                                        </div>

                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                                            📍 {ev.venue}
                                                        </div>

                                                        {/* Occupancy Track Bar */}
                                                        <div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                                                <span>Occupancy: <strong>{ev.sold_tickets}</strong> / {ev.capacity}</span>
                                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ev.occupancy_pct}%</span>
                                                            </div>
                                                            <div className="admin-occupancy-track">
                                                                <div
                                                                    className="admin-occupancy-fill"
                                                                    style={{ width: `${Math.min(ev.occupancy_pct, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '8px' }}>
                                                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                                                Base: ${ev.price_per_ticket.toFixed(2)}
                                                            </span>
                                                            <span style={{ fontWeight: 700, color: '#6d28d9', fontSize: '0.86rem' }}>
                                                                Revenue: ${Number(ev.event_revenue).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                                                            Date: {formatDateTime(ev.time)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredOrganizers.length === 0 && (
                        <div className="dashboard-empty-card">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>No Event Organizers Found</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                                No organizer accounts match your search parameters.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: SERVER HEALTH & LOAD ANALYSIS                          */}
            {/* ============================================================== */}
            {activeTab === 'health' && (
                <div className="fade-up">
                    {/* Hero Diagnostics Summary */}
                    <div className="glass-panel" style={{ padding: '26px 30px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <span className="kicker">RUNTIME TELEMETRY ENGINE</span>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 6px', color: 'var(--text-primary)' }}>
                                Live System Health & Load Telemetry
                            </h2>
                            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Hardware resource utilization, database latency diagnostics, and active container processes.
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    System Status
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                                    <span className={`status-pulse-dot ${srv.status === 'degraded' ? 'warning' : ''}`} />
                                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: srv.status === 'degraded' ? '#d97706' : '#15803d', textTransform: 'uppercase' }}>
                                        {srv.status === 'degraded' ? 'Degraded' : '100% Operational'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ height: '36px', width: '1px', background: 'rgba(0,0,0,0.08)' }} />
                            <div>
                                <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    Process Uptime
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                                    {srv.uptime || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hardware Telemetry Grid */}
                    <div className="telemetry-grid">
                        {/* 1. CPU Load Card */}
                        <div className="telemetry-card">
                            <div className="telemetry-card-header">
                                <div className="telemetry-card-title">
                                    <div className="telemetry-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                            <rect x="4" y="4" width="16" height="16" rx="2" />
                                            <rect x="9" y="9" width="6" height="6" />
                                            <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
                                            <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
                                            <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
                                            <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
                                        </svg>
                                    </div>
                                    <span>CPU Utilization</span>
                                </div>
                                <span className={`telemetry-status-tag ${(srv.cpu?.percent ?? 0) > 80 ? 'telemetry-status-elevated' : 'telemetry-status-optimal'}`}>
                                    {(srv.cpu?.percent ?? 0) > 80 ? 'Elevated' : 'Nominal'}
                                </span>
                            </div>

                            <div className="telemetry-big-value">
                                {srv.cpu?.percent ?? srv.cpu_percent ?? 0}%
                            </div>

                            <div className="telemetry-bar-track">
                                <div
                                    className="telemetry-bar-fill"
                                    style={{
                                        width: `${Math.min(srv.cpu?.percent ?? srv.cpu_percent ?? 0, 100)}%`,
                                        background: (srv.cpu?.percent ?? 0) > 80 ? '#dc2626' : '#18181b'
                                    }}
                                />
                            </div>

                            <div className="telemetry-details-list">
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Hardware Cores:</span>
                                    <span className="telemetry-detail-value">{srv.cpu?.cores || 4} Threads</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Processor Model:</span>
                                    <span className="telemetry-detail-value" style={{ fontSize: '0.72rem', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={srv.cpu?.model}>
                                        {srv.cpu?.model || 'Host CPU'}
                                    </span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Sampling Mode:</span>
                                    <span className="telemetry-detail-value">Real-Time Poll</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. RAM Memory Card */}
                        <div className="telemetry-card">
                            <div className="telemetry-card-header">
                                <div className="telemetry-card-title">
                                    <div className="telemetry-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                        </svg>
                                    </div>
                                    <span>RAM Memory</span>
                                </div>
                                <span className={`telemetry-status-tag ${(srv.memory?.percent ?? 0) > 85 ? 'telemetry-status-elevated' : 'telemetry-status-optimal'}`}>
                                    {(srv.memory?.percent ?? 0) > 85 ? 'High Usage' : 'Healthy'}
                                </span>
                            </div>

                            <div className="telemetry-big-value">
                                {srv.memory?.percent ?? srv.memory_percent ?? 0}%
                            </div>

                            <div className="telemetry-bar-track">
                                <div
                                    className="telemetry-bar-fill"
                                    style={{
                                        width: `${Math.min(srv.memory?.percent ?? srv.memory_percent ?? 0, 100)}%`,
                                        background: (srv.memory?.percent ?? 0) > 85 ? '#dc2626' : '#18181b'
                                    }}
                                />
                            </div>

                            <div className="telemetry-details-list">
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Memory Allocated:</span>
                                    <span className="telemetry-detail-value">{srv.memory?.used_mb || 0} MB</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Total System RAM:</span>
                                    <span className="telemetry-detail-value">{srv.memory?.total_mb || 0} MB</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Process RSS:</span>
                                    <span className="telemetry-detail-value">{srv.memory?.process_rss_mb || 0} MB</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Disk Storage Card */}
                        <div className="telemetry-card">
                            <div className="telemetry-card-header">
                                <div className="telemetry-card-title">
                                    <div className="telemetry-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                            <line x1="22" y1="12" x2="2" y2="12" />
                                            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                                            <line x1="6" y1="16" x2="6.01" y2="16" />
                                            <line x1="10" y1="16" x2="10.01" y2="16" />
                                        </svg>
                                    </div>
                                    <span>Disk Storage</span>
                                </div>
                                <span className="telemetry-status-tag telemetry-status-optimal">Available</span>
                            </div>

                            <div className="telemetry-big-value">
                                {srv.disk?.percent ?? srv.disk_percent ?? 0}%
                            </div>

                            <div className="telemetry-bar-track">
                                <div
                                    className="telemetry-bar-fill"
                                    style={{ width: `${Math.min(srv.disk?.percent ?? srv.disk_percent ?? 0, 100)}%` }}
                                />
                            </div>

                            <div className="telemetry-details-list">
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Used Volume:</span>
                                    <span className="telemetry-detail-value">{srv.disk?.used_gb || 0} GB</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Free Headroom:</span>
                                    <span className="telemetry-detail-value">{srv.disk?.free_gb || 0} GB</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Total Disk Capacity:</span>
                                    <span className="telemetry-detail-value">{srv.disk?.total_gb || 0} GB</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. SQLite Database Diagnostics */}
                        <div className="telemetry-card">
                            <div className="telemetry-card-header">
                                <div className="telemetry-card-title">
                                    <div className="telemetry-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                        </svg>
                                    </div>
                                    <span>Database Health</span>
                                </div>
                                <span className="telemetry-status-tag telemetry-status-optimal">
                                    {srv.database?.status || 'Active'}
                                </span>
                            </div>

                            <div className="telemetry-big-value" style={{ fontSize: '1.9rem', color: '#15803d' }}>
                                {srv.database?.latency_ms ?? 1.2} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ms</span>
                            </div>

                            <div className="telemetry-bar-track">
                                <div className="telemetry-bar-fill" style={{ width: '10%', background: '#15803d' }} />
                            </div>

                            <div className="telemetry-details-list">
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Database Engine:</span>
                                    <span className="telemetry-detail-value">{srv.database?.engine || 'SQLite 3 (WAL)'}</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">File Size on Disk:</span>
                                    <span className="telemetry-detail-value">{srv.database?.db_size_kb || 0} KB</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Indexed Records:</span>
                                    <span className="telemetry-detail-value">
                                        {srv.database?.counts ? `${srv.database.counts.users}u · ${srv.database.counts.events}e · ${srv.database.counts.sells}s` : 'Aggregated'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 5. Runtime & Host Card */}
                        <div className="telemetry-card">
                            <div className="telemetry-card-header">
                                <div className="telemetry-card-title">
                                    <div className="telemetry-icon-wrap">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                                            <circle cx="12" cy="12" r="10" />
                                            <polygon points="12 6 12 12 14 14" />
                                        </svg>
                                    </div>
                                    <span>Runtime & Host</span>
                                </div>
                                <span className="telemetry-status-tag telemetry-status-optimal">
                                    Python {srv.environment?.python_version || '3.x'}
                                </span>
                            </div>

                            <div className="telemetry-details-list" style={{ borderTop: 'none', paddingTop: 0, marginTop: '8px' }}>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Web Framework:</span>
                                    <span className="telemetry-detail-value">FastAPI + Uvicorn</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Operating System:</span>
                                    <span className="telemetry-detail-value" style={{ fontSize: '0.74rem' }}>
                                        {srv.environment?.os_platform || 'Windows Host'}
                                    </span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Process ID (PID):</span>
                                    <span className="telemetry-detail-value">{srv.environment?.pid || 'OS Active'}</span>
                                </div>
                                <div className="telemetry-detail-row">
                                    <span className="telemetry-detail-label">Environment Mode:</span>
                                    <span className="telemetry-detail-value" style={{ textTransform: 'capitalize' }}>
                                        {srv.environment?.environment || 'development'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
