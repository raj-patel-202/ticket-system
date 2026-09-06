const { useState, useEffect, useMemo, useRef } = React;
const { useParams, useNavigate, Link } = ReactRouterDOM;

// 3D Stadium Chair SVG Component
const StadiumChair3D = ({ x, y, angle = 0, isTaken, isSelected, accentColor, onClick, title }) => {
    const chairRotation = Number(angle) + 90;
    const baseColor = isSelected ? accentColor : isTaken ? '#cbd5e1' : '#1e293b';
    const darkEdge = isSelected ? '#0f172a' : isTaken ? '#94a3b8' : '#090d16';
    const lightHighlight = isSelected ? '#ffffff' : isTaken ? '#e2e8f0' : '#475569';

    return (
        <g
            transform={`translate(${x}, ${y}) rotate(${chairRotation})`}
            className={`stadium-seat-3d ${isTaken ? 'is-taken' : ''} ${isSelected ? 'is-selected' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(e);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            style={{ cursor: isTaken ? 'not-allowed' : 'pointer' }}
            pointerEvents="all"
        >
            <title>{title}</title>
            {/* Exact non-overlapping hitbox strictly within chair boundaries */}
            <rect x="-6" y="-8.5" width="12" height="13.5" fill="transparent" pointerEvents="all" />

            {/* Ground shadow */}
            <ellipse cx="0" cy="3" rx="6.5" ry="2.8" fill="rgba(0,0,0,0.22)" />

            {/* Chair Base Frame */}
            <rect x="-4.5" y="-1" width="9" height="5" rx="1.5" fill="rgba(30, 41, 59, 0.55)" />

            {/* Molded Seat Cushion (3D bevel) */}
            <path
                d="M -6.5,0 C -6.5,3.8 6.5,3.8 6.5,0 L 6,3 C 6,5.5 -6,5.5 -6,3 Z"
                fill={darkEdge}
            />
            <path
                d="M -6.5,0 C -6.5,3.2 6.5,3.2 6.5,0 C 6.5,-1.8 -6.5,-1.8 -6.5,0 Z"
                fill={baseColor}
                stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                strokeWidth={isSelected ? '1.2' : '0.5'}
            />

            {/* Backrest (Tilted upright with depth) */}
            <rect
                x="-5.5"
                y="-8.5"
                width="11"
                height="7.5"
                rx="2.5"
                ry="2.5"
                fill={baseColor}
                stroke={isSelected ? '#ffffff' : lightHighlight}
                strokeWidth={isSelected ? '1.4' : '0.6'}
            />

            {/* Ergonomic contour ribs */}
            <line x1="-2.5" y1="-7.5" x2="-2.5" y2="-3" stroke={lightHighlight} strokeWidth="0.8" strokeLinecap="round" opacity={isSelected ? '0.9' : '0.6'} />
            <line x1="2.5" y1="-7.5" x2="2.5" y2="-3" stroke={lightHighlight} strokeWidth="0.8" strokeLinecap="round" opacity={isSelected ? '0.9' : '0.6'} />

            {/* Armrest brackets */}
            <path d="M -7,-5 L -7,1 M 7,-5 L 7,1" stroke={isSelected ? '#ffffff' : 'rgba(15, 23, 42, 0.65)'} strokeWidth="1.2" strokeLinecap="round" />

            {/* Selected Specular Glint */}
            {isSelected && (
                <circle cx="0" cy="-5" r="1.4" fill="#ffffff" />
            )}
        </g>
    );
};

// 3D Plush Theater Armchair Component
const TheaterChair3D = ({ isTaken, isSelected, accentColor, onClick, title, row, seatNum }) => (
    <button
        type="button"
        className={`theater-chair-3d ${isTaken ? 'is-taken' : ''} ${isSelected ? 'is-selected' : ''}`}
        onClick={onClick}
        disabled={isTaken}
        title={title}
        aria-label={`Row ${row} Seat ${seatNum}`}
    >
        <span className="tc-shadow"></span>
        <span className="tc-crest"></span>
        <span className="tc-back">
            <span className="tc-seam-l"></span>
            <span className="tc-seam-r"></span>
        </span>
        <span className="tc-cushion"></span>
        <span className="tc-arm tc-arm-l"></span>
        <span className="tc-arm tc-arm-r"></span>
    </button>
);

window.SeatSelection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = window.useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [concertQty, setConcertQty] = useState(1);
    const [isBuying, setIsBuying] = useState(false);
    const [isBought, setIsBought] = useState(false);
    const [error, setError] = useState('');

    // 3D Map Zoom, Expand, Rotation, and Pan/Drag controls
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const [rotationAngle, setRotationAngle] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
    const hasDraggedRef = useRef(false);

    // Fetch active event details when ID changes
    useEffect(() => {
        if (!id) return;
        fetchEventDetails(id);
        setSelectedSeats([]);
        setConcertQty(1);
        setIsBought(false);
        setError('');
        setZoomLevel(1);
        setIsExpanded(false);
        setRotationAngle(0);
        setPan({ x: 0, y: 0 });
        setIsDragging(false);
    }, [id]);

    // Dynamic Theater / Cinema Raked Layout Generator (Matches EXACT event capacity)
    const theaterLayout = useMemo(() => {
        if (!event || event.event_type !== 'theater') return [];
        const capacity = event.capacity || 10;
        const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

        // Determine appropriate row count
        let numRows = 1;
        if (capacity <= 6) numRows = 1;
        else if (capacity <= 16) numRows = 2;
        else if (capacity <= 32) numRows = 3;
        else if (capacity <= 60) numRows = 4;
        else if (capacity <= 100) numRows = 6;
        else if (capacity <= 150) numRows = 7;
        else numRows = 8;

        const baseSeatsPerRow = Math.floor(capacity / numRows);
        const extraSeats = capacity % numRows;

        const rows = [];
        for (let r = 0; r < numRows; r++) {
            const count = baseSeatsPerRow + (r >= (numRows - extraSeats) ? 1 : 0);
            if (count > 0) {
                rows.push({
                    row: allRows[r] || `R${r + 1}`,
                    count: count
                });
            }
        }
        return rows;
    }, [event?.event_type, event?.capacity]);

    // Dynamic Stadium Concentric Bowl Layout Generator (Matches EXACT event capacity)
    const stadiumLayout = useMemo(() => {
        if (!event || event.event_type !== 'sport') return null;
        const capacity = event.capacity || 100;

        const W = 760, H = 520;
        const cx = W / 2, cy = H / 2 + 10;
        const fieldRx = 165, fieldRy = 85;
        const ringGap = 26; // Generous row-to-row spacing (eliminates vertical overlap)
        const innerR = 212;

        const sectionCount = capacity <= 30 ? 3 : capacity <= 60 ? 4 : 6;
        const rowsPerSection = capacity <= 50 ? 3 : 4;

        const totalArc = 280;
        const startAngle = -90 - totalArc / 2;
        const sectionArc = totalArc / sectionCount;
        const sectionGapDeg = 8; // Prominent aisle gap between stands

        const sections = [];
        for (let s = 0; s < sectionCount; s++) {
            const secStart = startAngle + s * sectionArc + sectionGapDeg / 2;
            const secEnd = startAngle + (s + 1) * sectionArc - sectionGapDeg / 2;
            const sectionLetter = String.fromCharCode(65 + s);

            const labelR = innerR + rowsPerSection * ringGap + 18;
            const midAngle = (secStart + secEnd) / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const lx = cx + labelR * Math.cos(midRad);
            const ly = cy + labelR * 0.72 * Math.sin(midRad);

            sections.push({
                letter: sectionLetter,
                labelX: lx.toFixed(1),
                labelY: ly.toFixed(1),
                secStart,
                secEnd,
                secSpan: secEnd - secStart,
                midAngle
            });
        }

        const seats = [];
        let created = 0;
        for (let r = 0; r < rowsPerSection && created < capacity; r++) {
            const radius = innerR + r * ringGap;
            const rowsRemaining = rowsPerSection - r;
            const seatsInThisRing = Math.min(capacity - created, Math.ceil((capacity - created) / rowsRemaining));
            const perSection = Math.max(1, Math.floor(seatsInThisRing / sectionCount));

            for (let s = 0; s < sectionCount && created < capacity; s++) {
                const sec = sections[s];
                const countForSec = (s === sectionCount - 1)
                    ? (seatsInThisRing - (sectionCount - 1) * perSection)
                    : perSection;

                // Center seats in each section with comfortable ~7.2deg spacing between adjacent seats
                const angleStep = Math.min(7.2, sec.secSpan / Math.max(1, countForSec));
                const totalSecSpan = (countForSec - 1) * angleStep;
                const startA = sec.midAngle - totalSecSpan / 2;

                for (let i = 0; i < countForSec && created < capacity; i++) {
                    const angle = countForSec === 1 ? sec.midAngle : startA + i * angleStep;
                    const rad = (angle * Math.PI) / 180;
                    const x = cx + radius * Math.cos(rad);
                    const y = cy + radius * 0.72 * Math.sin(rad);
                    const seatId = `${sec.letter}-${r + 1}-${i + 1}`;

                    seats.push({
                        seatId,
                        section: sec.letter,
                        row: r + 1,
                        seatNum: i + 1,
                        x: x.toFixed(1),
                        y: y.toFixed(1),
                        angle: angle.toFixed(1)
                    });
                    created++;
                }
            }
        }

        return { W, H, cx, cy, fieldRx, fieldRy, sections, seats };
    }, [event?.event_type, event?.capacity]);

    // Stadium Seats & Sections in Full Arena View
    const displayedStadiumSeats = useMemo(() => {
        if (!stadiumLayout) return [];
        return stadiumLayout.seats;
    }, [stadiumLayout]);

    const displayedStadiumSections = useMemo(() => {
        if (!stadiumLayout) return [];
        return stadiumLayout.sections;
    }, [stadiumLayout]);

    // Map taken seats consistently: total seats rendered equals capacity,
    // and taken seats count equals sold_tickets
    const effectiveTakenSeats = useMemo(() => {
        if (!event) return new Set();
        const validSeatIds = new Set();
        if (event.event_type === 'theater') {
            theaterLayout.forEach(({ row, count }) => {
                for (let i = 1; i <= count; i++) validSeatIds.add(`${row}${i}`);
            });
        } else if (event.event_type === 'sport' && stadiumLayout) {
            stadiumLayout.seats.forEach(s => validSeatIds.add(s.seatId));
        }

        const taken = new Set();
        const validList = Array.from(validSeatIds);
        let unmappedCount = 0;

        (event.taken_seats || []).forEach(seatId => {
            if (validSeatIds.has(seatId)) {
                taken.add(seatId);
            } else {
                unmappedCount++;
            }
        });

        // If seats were booked under a previous layout version, map them to first available slots
        if (unmappedCount > 0) {
            for (let i = 0; i < validList.length && unmappedCount > 0; i++) {
                if (!taken.has(validList[i])) {
                    taken.add(validList[i]);
                    unmappedCount--;
                }
            }
        }

        return taken;
    }, [event?.taken_seats, event?.sold_tickets, theaterLayout, stadiumLayout]);

    const fetchEventDetails = async (eventId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/events/${eventId}/seats`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
            } else {
                navigate('/');
            }
        } catch (_) {
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // Toggle seat for Theater & Stadium
    const toggleSeat = (seatId) => {
        if (!event || effectiveTakenSeats.has(seatId)) return;

        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(s => s !== seatId);
            }
            if (prev.length >= 6) {
                setError('Maximum 6 seats can be selected per booking.');
                return prev;
            }
            setError('');
            return [...prev, seatId];
        });
    };

    // Safe seat click: only toggle if user was NOT dragging the map
    const handleSeatClick = (seatId) => {
        if (hasDraggedRef.current) return;
        toggleSeat(seatId);
    };

    // Map Drag & Pan Handlers
    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        // Never start map dragging when clicking directly on a seat
        if (e.target && e.target.closest && (e.target.closest('.stadium-seat-3d') || e.target.closest('.theater-chair-3d'))) {
            return;
        }
        setIsDragging(true);
        hasDraggedRef.current = false;
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            panX: pan.x,
            panY: pan.y
        };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        // 8px deadzone: prevent micro-jitters from triggering unnecessary re-renders during clicks
        if (Math.hypot(dx, dy) < 8) return;
        hasDraggedRef.current = true;
        setPan({
            x: dragStartRef.current.panX + dx,
            y: dragStartRef.current.panY + dy
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        if (e.target && e.target.closest && (e.target.closest('.stadium-seat-3d') || e.target.closest('.theater-chair-3d'))) {
            return;
        }
        setIsDragging(true);
        hasDraggedRef.current = false;
        const touch = e.touches[0];
        dragStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            panX: pan.x,
            panY: pan.y
        };
    };

    const handleTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;
        if (Math.hypot(dx, dy) < 8) return;
        hasDraggedRef.current = true;
        setPan({
            x: dragStartRef.current.panX + dx,
            y: dragStartRef.current.panY + dy
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleResetView = () => {
        setPan({ x: 0, y: 0 });
        setZoomLevel(1);
        setRotationAngle(0);
    };

    const changeConcertQty = (delta) => {
        if (!event) return;
        const max = Math.min(8, event.available_seats || 8);
        setConcertQty(prev => Math.max(1, Math.min(max, prev + delta)));
    };

    // Booking Checkout
    const handleBuy = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.user_type === 'organizer') {
            setError('Organizers cannot buy tickets. Please sign in with a Buyer account.');
            return;
        }

        const seatPositions = event.event_type === 'concert'
            ? Array.from({ length: concertQty }, (_, i) => `GA · Floor ${i + 1}`)
            : selectedSeats;

        if (seatPositions.length === 0) {
            setError('Please select at least one seat before confirming.');
            return;
        }

        setIsBuying(true);
        setError('');

        try {
            const res = await fetch('/api/tickets/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_id: event.event_id,
                    seat_positions: seatPositions
                })
            });

            const resData = await res.json();

            if (res.ok) {
                setIsBought(true);
                setTimeout(() => {
                    navigate('/my-tickets');
                }, 1300);
            } else {
                const errMsg = Array.isArray(resData.detail)
                    ? resData.detail.map(d => d.msg).join(', ')
                    : (resData.detail || 'Purchase failed. Seats may have already been reserved.');
                setError(errMsg);
                setIsBuying(false);
                fetchEventDetails(event.event_id);
                setSelectedSeats([]);
            }
        } catch (err) {
            setError(err.message || 'Checkout connection failed.');
            setIsBuying(false);
        }
    };

    if (loading || !event) {
        return (
            <div className="container fade-up" style={{ textAlign: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
                <div className="morph-icon-box" style={{ margin: '0 auto 16px', width: '44px', height: '44px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Loading interactive venue map...
                </div>
            </div>
        );
    }

    const qty = event.event_type === 'concert' ? concertQty : selectedSeats.length;
    const unitPrice = Number(event.current_price) || 0;

    // 5% discount on every extra ticket bought after 2 qty
    let totalCost = 0;
    let discountAmount = 0;
    let extraQty = 0;

    if (qty > 0) {
        if (qty <= 2) {
            totalCost = qty * unitPrice;
        } else {
            extraQty = qty - 2;
            discountAmount = extraQty * (unitPrice * 0.05);
            totalCost = 2 * unitPrice + extraQty * (unitPrice * 0.95);
        }
    }

    const getEventAccent = (type) => {
        switch (type) {
            case 'theater': return '#7a1230';
            case 'concert': return '#7b2ff7';
            case 'sport': return '#146c43';
            default: return '#7b2ff7';
        }
    };
    const accentColor = getEventAccent(event.event_type);

    // Helper to get array of individual seat display strings for capsule rendering
    const getSelectedSeatList = () => {
        if (event.event_type === 'concert') {
            return [`${concertQty} × GA Floor Pass${concertQty > 1 ? 'es' : ''}`];
        }
        if (selectedSeats.length === 0) {
            return [];
        }
        if (event.event_type === 'theater') {
            return selectedSeats.map(s => {
                const match = s.match(/^([A-Za-z]+)(\d+)$/);
                return match ? `Row ${match[1]} · Seat ${match[2]}` : s;
            });
        }
        if (event.event_type === 'sport') {
            return selectedSeats.map(s => {
                const [sec, r, num] = s.split('-');
                return `Sec ${sec} · R${r} · S${num}`;
            });
        }
        return selectedSeats;
    };

    return (
        <div className="container fade-up" style={{ paddingBottom: '80px' }}>
            {/* Top Navigation Strip (Switch event option removed) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                <button onClick={() => navigate(-1)} className="btn btn-glass btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Schedule
                </button>
            </div>

            {/* Main Selection Layout */}
            <div className={`seat-selection-grid ${isExpanded ? 'is-map-expanded' : ''}`}>
                {/* Left Panel: The Interactive Venue Map */}
                <div className="glass-panel" style={{ padding: '24px 22px', position: 'relative', overflow: 'hidden' }}>
                    {/* Top Color Accent Line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#18181b' }}></div>

                    {/* Venue Header */}
                    <div style={{ marginBottom: '18px' }}>
                        <span className="kicker">
                            {event.event_type === 'concert' ? 'STAGE & FLOOR ACCESS' : event.event_type === 'theater' ? '3D AUDITORIUM AUDIENCE MAP' : '3D STADIUM BOWL SEATING'}
                        </span>
                        <h2 className="section-title" style={{ fontSize: '1.65rem', margin: '4px 0 6px', textAlign: 'left' }}>
                            {event.event_name}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
                                <circle cx="12" cy="9.5" r="2.3" />
                            </svg>
                            {event.venue} · {event.time ? event.time.replace('T', ' · ') : 'Live Schedule'}
                        </p>
                    </div>

                    {/* Interactive 3D Map Control Bar */}
                    <div className="map-toolbar-container">
                        {/* Zoom & Rotation Controls */}
                        <div className="map-action-controls" style={{ width: '100%', justifyContent: 'space-between' }}>
                            {event.event_type === 'sport' && (
                                <div className="rotate-control-group">
                                    <button
                                        type="button"
                                        className="ctrl-btn"
                                        title="Rotate stadium 45° counter-clockwise"
                                        onClick={() => setRotationAngle(prev => prev - 45)}
                                    >
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                            <path d="M3 3v5h5" />
                                        </svg>
                                        <span>Rotate Left</span>
                                    </button>
                                    <span className="ctrl-degree-badge">{((rotationAngle % 360) + 360) % 360}°</span>
                                    <button
                                        type="button"
                                        className="ctrl-btn"
                                        title="Rotate stadium 45° clockwise"
                                        onClick={() => setRotationAngle(prev => prev + 45)}
                                    >
                                        <span>Rotate Right</span>
                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                            <path d="M21 3v5h-5" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <div className="zoom-control-group">
                                    <button
                                        type="button"
                                        className="ctrl-btn ctrl-btn--icon"
                                        title="Zoom Out"
                                        disabled={zoomLevel <= 0.75}
                                        onClick={() => setZoomLevel(prev => Math.max(0.75, Number((prev - 0.2).toFixed(2))))}
                                    >
                                        −
                                    </button>
                                    <span className="ctrl-zoom-badge">{Math.round(zoomLevel * 100)}%</span>
                                    <button
                                        type="button"
                                        className="ctrl-btn ctrl-btn--icon"
                                        title="Zoom In"
                                        disabled={zoomLevel >= 2.0}
                                        onClick={() => setZoomLevel(prev => Math.min(2.0, Number((prev + 0.2).toFixed(2))))}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="ctrl-btn"
                                    title="Reset pan position, zoom, and rotation"
                                    onClick={handleResetView}
                                >
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                    </svg>
                                    <span>Reset View</span>
                                </button>

                                <button
                                    type="button"
                                    className={`ctrl-btn ctrl-btn--expand ${isExpanded ? 'active' : ''}`}
                                    title={isExpanded ? "Collapse map" : "Expand map on screen"}
                                    onClick={() => setIsExpanded(prev => !prev)}
                                >
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        {isExpanded ? (
                                            <>
                                                <polyline points="4 14 10 14 10 20" />
                                                <polyline points="20 10 14 10 14 4" />
                                                <line x1="14" y1="10" x2="21" y2="3" />
                                                <line x1="3" y1="21" x2="10" y2="14" />
                                            </>
                                        ) : (
                                            <>
                                                <polyline points="15 3 21 3 21 9" />
                                                <polyline points="9 21 3 21 3 15" />
                                                <line x1="21" y1="3" x2="14" y2="10" />
                                                <line x1="3" y1="21" x2="10" y2="14" />
                                            </>
                                        )}
                                    </svg>
                                    <span>{isExpanded ? 'Collapse' : 'Expand Map'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* MODE 1: Concert / General Admission (Themed in Concert Color) */}
                    {event.event_type === 'concert' && (
                        <div className="concert-booking-panel" style={{ '--accent': accentColor }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.12rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                                        General Admission Passes
                                    </div>
                                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                        Unreserved standing floor admission with prime view of main stage
                                    </div>
                                </div>
                                <span className="ticket__type" style={{ background: accentColor, color: '#fff', fontSize: '0.74rem', padding: '5px 14px', borderRadius: '999px', fontWeight: 700, boxShadow: `0 4px 14px -3px color-mix(in srgb, ${accentColor} 60%, transparent)` }}>
                                    GA FLOOR
                                </span>
                            </div>

                            {/* Concert Stage & Floor Visualizer */}
                            <div className="concert-stage-visual">
                                <div className="concert-stage__glow"></div>
                                <div className="concert-stage__arc"></div>
                                <div className="concert-stage__label">LIVE PERFORMANCE STAGE</div>

                                <div className="concert-crowd-grid">
                                    {[...Array(8)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`crowd-dot ${i < concertQty ? 'active' : ''}`}
                                            title={`Pass #${i + 1}`}
                                        />
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                                    {concertQty} of 8 maximum floor passes selected
                                </div>
                            </div>

                            {/* Quantity Stepper */}
                            <div className="qty-stepper" style={{ '--accent': accentColor, margin: '0 0 14px' }}>
                                <span className="qty-stepper__label">Number of Passes</span>
                                <button className="qty-btn" onClick={() => changeConcertQty(-1)} disabled={concertQty <= 1}>−</button>
                                <span className="qty-value">{concertQty}</span>
                                <button className="qty-btn" onClick={() => changeConcertQty(1)} disabled={concertQty >= Math.min(8, event.available_seats)}>+</button>
                            </div>

                            {/* Quick Select Pass Chips */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quick Select:</span>
                                <div className="quick-pass-chips">
                                    {[1, 2, 4, 6].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            className={`quick-pass-chip ${concertQty === num ? 'active' : ''}`}
                                            onClick={() => setConcertQty(Math.min(num, event.available_seats || num))}
                                            disabled={event.available_seats < num}
                                        >
                                            {num} {num === 1 ? 'Pass' : 'Passes'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Capacity Availability */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(24, 24, 27, 0.04)', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid rgba(24, 24, 27, 0.08)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Live Capacity</span>
                                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                    {event.available_seats} / {event.capacity} passes remaining
                                </strong>
                            </div>
                        </div>
                    )}

                    {/* MODE 2: Cinema / Theater Raked Auditorium in 3D */}
                    {event.event_type === 'theater' && (
                        <div className="theater-auditorium-3d">
                            <div className="screen">
                                <div className="screen__arc" style={{ '--accent': accentColor }}></div>
                                <div className="screen__label">PROSCENIUM STAGE</div>
                            </div>

                            <div 
                                className="cinema-map" 
                                style={{ 
                                    '--accent': accentColor,
                                    width: 'max-content',
                                    minWidth: '100%',
                                    margin: '0 auto',
                                    padding: '14px 24px',
                                    boxSizing: 'border-box',
                                    transform: `rotateX(12deg) scale(${zoomLevel})`,
                                    transformOrigin: 'center top',
                                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                            >
                                {theaterLayout.map(({ row, count }) => {
                                    const mid = Math.floor(count / 2);
                                    return (
                                        <div key={row} className="theater-tier-row">
                                            <span className="cinema-row__label">{row}</span>
                                            <div className="cinema-row__seats">
                                                {[...Array(count)].map((_, i) => {
                                                    const seatNum = i + 1;
                                                    const seatId = `${row}${seatNum}`;
                                                    const isTaken = effectiveTakenSeats.has(seatId);
                                                    const isSelected = selectedSeats.includes(seatId);
                                                    const isAisleGap = seatNum === mid + 1 && count > 10;

                                                    return (
                                                        <React.Fragment key={seatId}>
                                                            {isAisleGap && <span className="cinema-row__gap"></span>}
                                                            <TheaterChair3D
                                                                isTaken={isTaken}
                                                                isSelected={isSelected}
                                                                accentColor={accentColor}
                                                                onClick={() => handleSeatClick(seatId)}
                                                                title={isTaken ? `Row ${row} Seat ${seatNum} (Reserved)` : `Row ${row} Seat ${seatNum}`}
                                                                row={row}
                                                                seatNum={seatNum}
                                                            />
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 3D Legend */}
                            <div className="legend" style={{ '--accent': accentColor }}>
                                <div className="legend__item">
                                    <span className="legend__swatch legend__swatch--avail"></span>
                                    <span>Available Chair</span>
                                </div>
                                <div className="legend__item">
                                    <span className="legend__swatch legend__swatch--selected"></span>
                                    <span>Your Selection</span>
                                </div>
                                <div className="legend__item">
                                    <span className="legend__swatch legend__swatch--taken"></span>
                                    <span>Reserved</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODE 3: Sporting / Stadium Concentric 3D Bowl */}
                    {event.event_type === 'sport' && stadiumLayout && (
                        <div>
                            <div 
                                className={`stadium-map-wrapper ${isDragging ? 'is-dragging' : ''}`}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div 
                                    className="stadium-rotating-arena"
                                    style={{
                                        transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                                        transformOrigin: '50% 50%'
                                    }}
                                >
                                    <div className="stadium-arena-3d" style={{ '--accent': accentColor }}>
                                        <svg viewBox={`0 0 ${stadiumLayout.W} ${stadiumLayout.H}`}>
                                            <defs>
                                                <linearGradient id="pitchGrassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#15803d" />
                                                    <stop offset="25%" stopColor="#16a34a" />
                                                    <stop offset="50%" stopColor="#15803d" />
                                                    <stop offset="75%" stopColor="#16a34a" />
                                                    <stop offset="100%" stopColor="#15803d" />
                                                </linearGradient>
                                                <radialGradient id="arenaFloodlightGlow" cx="50%" cy="50%" r="50%">
                                                    <stop offset="0%" stopColor="rgba(52, 211, 153, 0.35)" />
                                                    <stop offset="70%" stopColor="rgba(16, 185, 129, 0.08)" />
                                                    <stop offset="100%" stopColor="transparent" />
                                                </radialGradient>
                                            </defs>

                                            {/* Central 3D Playing Field */}
                                            <g className="pitch-3d-group">
                                                <ellipse cx={stadiumLayout.cx} cy={stadiumLayout.cy + 3} rx={stadiumLayout.fieldRx + 18} ry={stadiumLayout.fieldRy + 12} fill="url(#arenaFloodlightGlow)" opacity="0.6" />
                                                <ellipse cx={stadiumLayout.cx} cy={stadiumLayout.cy + 5} rx={stadiumLayout.fieldRx + 3} ry={stadiumLayout.fieldRy + 2} fill="#0f172a" opacity="0.25" />
                                                <ellipse className="field-turf" cx={stadiumLayout.cx} cy={stadiumLayout.cy} rx={stadiumLayout.fieldRx} ry={stadiumLayout.fieldRy} fill="url(#pitchGrassGrad)" stroke="#ffffff" strokeWidth="1.8" strokeOpacity="0.85" />
                                                <line x1={stadiumLayout.cx} y1={stadiumLayout.cy - stadiumLayout.fieldRy + 2} x2={stadiumLayout.cx} y2={stadiumLayout.cy + stadiumLayout.fieldRy - 2} stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.75" />
                                                <ellipse cx={stadiumLayout.cx} cy={stadiumLayout.cy} rx="28" ry="15" fill="none" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.75" />
                                                <circle cx={stadiumLayout.cx} cy={stadiumLayout.cy} r="2.2" fill="#ffffff" />
                                                <path d={`M ${stadiumLayout.cx - stadiumLayout.fieldRx + 2} ${stadiumLayout.cy - 22} L ${stadiumLayout.cx - stadiumLayout.fieldRx + 22} ${stadiumLayout.cy - 19} L ${stadiumLayout.cx - stadiumLayout.fieldRx + 22} ${stadiumLayout.cy + 19} L ${stadiumLayout.cx - stadiumLayout.fieldRx + 2} ${stadiumLayout.cy + 22}`} fill="none" stroke="#ffffff" strokeWidth="1.3" strokeOpacity="0.7" />
                                                <path d={`M ${stadiumLayout.cx + stadiumLayout.fieldRx - 2} ${stadiumLayout.cy - 22} L ${stadiumLayout.cx + stadiumLayout.fieldRx - 22} ${stadiumLayout.cy - 19} L ${stadiumLayout.cx + stadiumLayout.fieldRx - 22} ${stadiumLayout.cy + 19} L ${stadiumLayout.cx + stadiumLayout.fieldRx - 2} ${stadiumLayout.cy + 22}`} fill="none" stroke="#ffffff" strokeWidth="1.3" strokeOpacity="0.7" />
                                                <text className="field-label-3d" x={stadiumLayout.cx} y={stadiumLayout.cy + 24} textAnchor="middle">
                                                    CHAMPIONSHIP ARENA
                                                </text>
                                            </g>

                                            {/* Section Arc Labels */}
                                            {displayedStadiumSections.map(sec => (
                                                <text
                                                    key={sec.letter}
                                                    className="section-label"
                                                    x={sec.labelX}
                                                    y={sec.labelY}
                                                    textAnchor="middle"
                                                >
                                                    SEC {sec.letter}
                                                </text>
                                            ))}

                                            {/* 3D Angled Stadium Bucket Chairs */}
                                            {displayedStadiumSeats.map(s => {
                                                const isTaken = effectiveTakenSeats.has(s.seatId);
                                                const isSelected = selectedSeats.includes(s.seatId);

                                                return (
                                                    <StadiumChair3D
                                                        key={s.seatId}
                                                        x={s.x}
                                                        y={s.y}
                                                        angle={s.angle}
                                                        isTaken={isTaken}
                                                        isSelected={isSelected}
                                                        accentColor={accentColor}
                                                        onClick={() => !isTaken && handleSeatClick(s.seatId)}
                                                        title={`Section ${s.section} · Row ${s.row} · Seat ${s.seatNum}${isTaken ? ' (Reserved)' : isSelected ? ' (Selected)' : ''}`}
                                                    />
                                                );
                                            })}
                                        </svg>
                                    </div>
                                </div>

                                {/* Drag to Pan Helper Badge */}
                                <div className="map-drag-hint">
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="5 9 2 12 5 15" />
                                        <polyline points="9 5 12 2 15 5" />
                                        <polyline points="15 19 12 22 9 19" />
                                        <polyline points="19 9 22 12 19 15" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <line x1="12" y1="2" x2="12" y2="22" />
                                    </svg>
                                    <span>Drag to pan arena</span>
                                </div>
                            </div>

                            {/* 3D Legend */}
                            <div className="legend" style={{ '--accent': accentColor }}>
                                <div className="legend__item">
                                    <span className="legend__swatch legend__swatch--avail"></span>
                                    <span>Available Seat</span>
                                </div>
                                <div className="legend__item">
                                    <span className="legend__swatch legend__swatch--selected"></span>
                                    <span>Your Selection</span>
                                </div>
                                <div className="legend__item">
                                    <span className="legend__swatch legend__swatch--taken"></span>
                                    <span>Reserved</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Sticky Interactive Glass Booking Ticket */}
                <div 
                    className={`booking-ticket booking-ticket--${event.event_type} ${isBought ? 'is-sold' : ''}`} 
                    style={{ 
                        '--accent': accentColor,
                        ...(isExpanded ? { position: 'relative', top: 'auto', maxWidth: '540px', width: '100%', margin: '28px auto 0', zIndex: 10 } : {})
                    }}
                >
                    <div className="booking-ticket__main">
                        {/* Ticket Top */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', paddingLeft: '8px' }}>
                            <span className="ticket__type" style={{ background: accentColor, color: '#fff', fontSize: '0.72rem', padding: '4px 13px', borderRadius: '999px', textTransform: 'capitalize', fontWeight: 700, boxShadow: `0 2px 8px -2px color-mix(in srgb, ${accentColor} 50%, transparent)` }}>
                                {event.event_type}
                            </span>
                            <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                #EV-{event.event_id}
                            </span>
                        </div>

                        {/* Title & Subtitle */}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)', paddingLeft: '8px' }}>
                            {event.event_name}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px', paddingLeft: '8px' }}>
                            {event.subtitle || event.venue}
                        </p>

                        {/* Seat Summary Box - Glassy Capsule Styling */}
                        <div 
                            style={{ 
                                padding: '14px 16px', 
                                background: 'rgba(24, 24, 27, 0.03)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                borderRadius: '18px', 
                                border: '1px solid rgba(24, 24, 27, 0.08)', 
                                boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                marginBottom: '14px' 
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 700 }}>
                                    Selection
                                </span>
                                <span 
                                    className="badge" 
                                    style={{ 
                                        fontSize: '0.68rem', 
                                        padding: '3px 10px', 
                                        borderRadius: '999px',
                                        background: 'rgba(24, 24, 27, 0.07)', 
                                        color: 'var(--text-primary)', 
                                        border: '1px solid rgba(24, 24, 27, 0.12)',
                                        fontWeight: 700
                                    }}
                                >
                                    {qty} {qty === 1 ? 'Seat' : 'Seats'}
                                </span>
                            </div>
                            
                            {/* Capsule-shaped Seat Denotations */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '28px', alignItems: 'center' }}>
                                {getSelectedSeatList().length === 0 ? (
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Select seats on map to book
                                    </span>
                                ) : (
                                    getSelectedSeatList().map((seatText, idx) => (
                                        <span 
                                            key={idx}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '5px 12px',
                                                borderRadius: '999px',
                                                background: 'rgba(24, 24, 27, 0.06)',
                                                backdropFilter: 'blur(12px)',
                                                WebkitBackdropFilter: 'blur(12px)',
                                                border: '1px solid rgba(24, 24, 27, 0.12)',
                                                color: 'var(--text-primary)',
                                                fontSize: '0.81rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.01em',
                                                boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                                            }}
                                        >
                                            <span 
                                                style={{ 
                                                    width: '6px', 
                                                    height: '6px', 
                                                    borderRadius: '50%', 
                                                    background: accentColor,
                                                    boxShadow: `0 0 6px ${accentColor}`
                                                }} 
                                            />
                                            <span>{seatText}</span>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Price per ticket</span>
                                <span className="mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    ${unitPrice.toFixed(2)}
                                </span>
                            </div>
                            {extraQty > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <span>5% off extra {extraQty} {extraQty === 1 ? 'ticket' : 'tickets'}</span>
                                    <span className="mono">-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="alert-box alert-danger" style={{ marginTop: '12px', fontSize: '0.8rem', padding: '8px 12px' }}>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Perforation Line */}
                    <div className="booking-ticket__perforation">
                        <span className="notch notch--left"></span>
                        <span className="notch notch--right"></span>
                    </div>

                    {/* Ticket Buy Bottom */}
                    <div className="booking-ticket__buy">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span className="meta-label" style={{ fontSize: '0.7rem' }}>Total Due</span>
                            <span className="price" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                ${totalCost.toFixed(2)}
                            </span>
                        </div>

                        {!user ? (
                            <Link 
                                to="/login" 
                                className="buy-btn"
                                style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.85rem' }}
                            >
                                Sign in to Book →
                            </Link>
                        ) : user.user_type === 'organizer' ? (
                            <button className="buy-btn" disabled style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)', fontSize: '0.78rem', boxShadow: 'none' }}>
                                Organizers Cannot Buy
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={`buy-btn ${isBuying ? 'is-buying' : ''} ${isBought ? 'is-bought' : ''}`}
                                onClick={handleBuy}
                                disabled={qty === 0 || isBuying || isBought}
                            >
                                <span className="buy-btn__fill"></span>
                                <span className="buy-btn__label">
                                    <span className="buy-btn__text">
                                        {isBuying ? 'Confirming...' : 'Confirm & Book'}
                                    </span>
                                    <svg className="buy-btn__check" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="4 10.5 8 14.5 16 5.5" />
                                    </svg>
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
