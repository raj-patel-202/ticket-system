const { useState, useEffect } = React;
const { Link, Navigate } = ReactRouterDOM;

window.MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = window.useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.user_type !== 'buyer') {
        return <Navigate to="/" />;
    }

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const fetchMyTickets = async () => {
        try {
            const res = await fetch('/api/tickets/my-tickets');
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const parseSeatInfo = (t) => {
        const pos = t.position_of_seat || '';
        if (t.event_type === 'concert' || pos.toUpperCase().includes('GA')) {
            return { section: 'GA', row: '—', seat: 'FLOOR' };
        }
        if (pos.includes('·')) {
            const parts = pos.split('·').map(p => p.trim());
            let section = parts[0] || 'GEN';
            let row = '—';
            let seat = '—';
            parts.forEach(part => {
                if (part.toLowerCase().includes('row')) row = part.replace(/row/i, '').trim();
                if (part.toLowerCase().includes('seat')) seat = part.replace(/seat/i, '').trim();
            });
            return { section, row, seat };
        }
        if (pos.includes('-')) {
            const [sec, row, seat] = pos.split('-');
            return { section: `SEC ${sec}`, row: row || '—', seat: seat || '—' };
        }
        const match = pos.match(/^([A-Za-z]+)(\d+)$/);
        if (match) {
            return { section: 'HALL', row: match[1].toUpperCase(), seat: match[2] };
        }
        return { section: pos || 'GA', row: '—', seat: '—' };
    };

    const formatEventDate = (timeStr) => {
        try {
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return timeStr;
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        } catch (_) {
            return timeStr;
        }
    };

    const formatEventTime = (timeStr, eventType) => {
        try {
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return { label: 'Time', time: 'TBA' };
            const timeFormatted = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const label = eventType === 'concert' ? 'Doors' : eventType === 'theater' ? 'Curtain' : 'Kickoff';
            return { label, time: timeFormatted };
        } catch (_) {
            return { label: 'Time', time: timeStr };
        }
    };

    if (loading) {
        return (
            <div className="container fade-up" style={{ textAlign: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
                <div className="morph-icon-box" style={{ margin: '0 auto 16px', width: '44px', height: '44px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Loading your passes...
                </div>
            </div>
        );
    }

    return (
        <div className="container fade-up" style={{ paddingBottom: '80px' }}>
            <header className="section-head" style={{ marginBottom: '36px', textAlign: 'center' }}>
                <h1 className="section-title">Your Passes</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '4px auto 0', maxWidth: '520px' }}>
                    Authenticated digital admission passes with real-time seat allocations and verification barcodes.
                </p>
            </header>

            {tickets.length === 0 ? (
                <div className="empty-tickets-glass" style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
                    <div className="morph-icon-box" style={{ margin: '0 auto 18px', width: '50px', height: '50px', color: 'var(--accent-primary)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                        No Passes Reserved Yet
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '26px' }}>
                        Browse our live events schedule to select seats and reserve your tickets with dynamic milestone pricing.
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ padding: '10px 24px', textDecoration: 'none' }}>
                        Explore Live Events →
                    </Link>
                </div>
            ) : (
                <div className="tickets-layout">
                    {tickets.map((t, idx) => {
                        const seatInfo = parseSeatInfo(t);
                        const timeInfo = formatEventTime(t.time, t.event_type);
                        const ticketCode = t.ticket_code || `TK-${t.sell_id}`;
                        const rotationDeg = (idx % 2 === 0 ? -0.7 : 0.7);

                        return (
                            <div 
                                key={t.sell_id} 
                                className={`glass-ticket glass-ticket--${t.event_type} fade-up`}
                                style={{ 
                                    animationDelay: `${(idx % 4) * 0.08}s`,
                                    transform: `rotate(${rotationDeg}deg)`
                                }}
                            >
                                {/* Main Body */}
                                <div className="glass-ticket__main">
                                    <div className="glass-ticket__top">
                                        <span className="glass-ticket__type">
                                            {t.event_type === 'sport' ? 'Sporting Event' : t.event_type}
                                        </span>
                                        <span className="glass-ticket__id">
                                            {ticketCode}
                                        </span>
                                    </div>

                                    <h2 className="glass-ticket__title">
                                        {t.event_name}
                                    </h2>

                                    {t.subtitle && (
                                        <p className="glass-ticket__subtitle">
                                            {t.subtitle}
                                        </p>
                                    )}

                                    <div className="glass-ticket__divider"></div>

                                    <div className="glass-ticket__meta">
                                        {/* Venue */}
                                        <div className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
                                                <circle cx="12" cy="9.5" r="2.3" />
                                            </svg>
                                            <div className="stack">
                                                <span className="meta-label">Venue</span>
                                                <span className="meta-value">{t.venue}</span>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            <div className="stack">
                                                <span className="meta-label">Date</span>
                                                <span className="meta-value">{formatEventDate(t.time)}</span>
                                            </div>
                                        </div>

                                        {/* Doors / Curtain / Kickoff */}
                                        <div className="meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="9" />
                                                <polyline points="12 6 12 12 15 14" />
                                            </svg>
                                            <div className="stack">
                                                <span className="meta-label">{timeInfo.label}</span>
                                                <span className="meta-value">{timeInfo.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-ticket__bottom">
                                        <div className="seat-block">
                                            <div className="stack">
                                                <span className="meta-label">Section</span>
                                                <span className="meta-value mono">{seatInfo.section}</span>
                                            </div>
                                            <div className="stack">
                                                <span className="meta-label">Row</span>
                                                <span className="meta-value mono">{seatInfo.row}</span>
                                            </div>
                                            <div className="stack">
                                                <span className="meta-label">Seat</span>
                                                <span className="meta-value mono">{seatInfo.seat}</span>
                                            </div>
                                        </div>
                                        <div className="price-block">
                                            <span className="meta-label">TOTAL</span>
                                            <span className="price">${Number(t.selling_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Perforation Line with Notches */}
                                <div className="glass-ticket__perforation">
                                    <span className="notch notch--top"></span>
                                    <span className="notch notch--bottom"></span>
                                </div>

                                {/* Ticket Stub */}
                                <div className="glass-ticket__stub">
                                    <span className="stub__admit">
                                        ADMIT ONE
                                    </span>
                                    <div className="stub__info">
                                        <span className="meta-label">{t.event_type === 'theater' ? 'DOOR' : 'GATE'}</span>
                                        <span className="meta-value mono" style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>
                                            {(t.gate || 'C').replace(/^(Gate|Door)\s*/i, '')}
                                        </span>
                                    </div>
                                    <div className="stub__barcode" title={`Barcode: ${ticketCode}`}></div>
                                    <span className="stub__id mono" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                        {ticketCode}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
