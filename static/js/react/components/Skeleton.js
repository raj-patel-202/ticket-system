// AuraPass — Premium Liquid VisionOS Skeleton Components
// Provides authentic shimmering glass placeholders matching exact page architectures

window.SkeletonBlock = ({ width = '100%', height = '16px', borderRadius = '8px', className = '', style = {} }) => {
    return (
        <span
            className={`skeleton-box ${className}`}
            style={{
                width: width,
                height: height,
                borderRadius: borderRadius,
                ...style
            }}
            aria-hidden="true"
        />
    );
};
const SkeletonBlock = window.SkeletonBlock;

// 1. Home Page Premium Skeleton
window.HomeSkeleton = () => {
    return (
        <div className="container skeleton-page-container">
            {/* Hero Header Skeleton */}
            <div className="hero-skeleton">
                <window.SkeletonBlock width="180px" height="26px" borderRadius="999px" />
                <window.SkeletonBlock width="320px" height="42px" borderRadius="12px" style={{ maxWidth: '90%' }} />
                <window.SkeletonBlock width="460px" height="18px" borderRadius="6px" style={{ maxWidth: '85%' }} />
                <window.SkeletonBlock width="380px" height="34px" borderRadius="999px" style={{ maxWidth: '92%', marginTop: '8px' }} />
            </div>

            {/* Filter Tabs Skeleton */}
            <div className="tabs-skeleton">
                <window.SkeletonBlock width="70px" height="40px" borderRadius="999px" />
                <window.SkeletonBlock width="110px" height="40px" borderRadius="999px" />
                <window.SkeletonBlock width="100px" height="40px" borderRadius="999px" />
                <window.SkeletonBlock width="110px" height="40px" borderRadius="999px" />
            </div>

            {/* Ticket Cards Grid Skeleton (3 authentic cards) */}
            <div className="event-grid">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="ticket-skeleton">
                        <div className="ticket-skeleton__main">
                            {/* Top row: category badge & ID */}
                            <div className="ticket-skeleton__top">
                                <window.SkeletonBlock width="72px" height="24px" borderRadius="999px" />
                                <window.SkeletonBlock width="52px" height="14px" borderRadius="4px" />
                            </div>

                            {/* Title & subtitle */}
                            <window.SkeletonBlock width="80%" height="24px" borderRadius="6px" style={{ marginBottom: '8px' }} />
                            <window.SkeletonBlock width="55%" height="14px" borderRadius="4px" style={{ marginBottom: '18px' }} />

                            <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 0 16px' }} />

                            {/* 3 Meta columns */}
                            <div className="ticket-skeleton__meta">
                                <div>
                                    <window.SkeletonBlock width="36px" height="10px" borderRadius="3px" style={{ marginBottom: '6px' }} />
                                    <window.SkeletonBlock width="75%" height="13px" borderRadius="4px" />
                                </div>
                                <div>
                                    <window.SkeletonBlock width="36px" height="10px" borderRadius="3px" style={{ marginBottom: '6px' }} />
                                    <window.SkeletonBlock width="75%" height="13px" borderRadius="4px" />
                                </div>
                                <div>
                                    <window.SkeletonBlock width="36px" height="10px" borderRadius="3px" style={{ marginBottom: '6px' }} />
                                    <window.SkeletonBlock width="65%" height="13px" borderRadius="4px" />
                                </div>
                            </div>

                            {/* Sold progress bar & price */}
                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px' }}>
                                <div style={{ width: '55%' }}>
                                    <window.SkeletonBlock width="90px" height="11px" borderRadius="3px" style={{ marginBottom: '6px' }} />
                                    <window.SkeletonBlock width="100%" height="6px" borderRadius="3px" />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <window.SkeletonBlock width="32px" height="10px" borderRadius="3px" style={{ marginBottom: '4px' }} />
                                    <window.SkeletonBlock width="65px" height="24px" borderRadius="6px" />
                                </div>
                            </div>
                        </div>

                        {/* Perforation line */}
                        <div className="ticket-skeleton__perforation">
                            <span className="notch notch--left" />
                            <span className="notch notch--right" />
                        </div>

                        {/* Bottom stub & button */}
                        <div className="ticket-skeleton__buy">
                            <div>
                                <window.SkeletonBlock width="50px" height="16px" borderRadius="4px" style={{ marginBottom: '4px' }} />
                                <window.SkeletonBlock width="75px" height="11px" borderRadius="3px" />
                            </div>
                            <window.SkeletonBlock width="125px" height="42px" borderRadius="999px" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 2. Seat Selection Page Premium Skeleton
window.SeatSelectionSkeleton = () => {
    return (
        <div className="container skeleton-page-container" style={{ paddingBottom: '80px' }}>
            {/* Top Back Nav Button */}
            <div style={{ marginBottom: '18px' }}>
                <window.SkeletonBlock width="150px" height="34px" borderRadius="999px" />
            </div>

            {/* Split Grid: Left Map + Right Booking Card */}
            <div className="seat-selection-grid">
                {/* Left Panel */}
                <div className="glass-panel" style={{ padding: '24px 22px', position: 'relative' }}>
                    <div style={{ marginBottom: '18px' }}>
                        <window.SkeletonBlock width="130px" height="12px" borderRadius="4px" style={{ marginBottom: '8px' }} />
                        <window.SkeletonBlock width="65%" height="32px" borderRadius="8px" style={{ marginBottom: '10px' }} />
                        <window.SkeletonBlock width="45%" height="15px" borderRadius="5px" />
                    </div>

                    {/* Toolbar controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <window.SkeletonBlock width="110px" height="36px" borderRadius="10px" />
                            <window.SkeletonBlock width="110px" height="36px" borderRadius="10px" />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <window.SkeletonBlock width="95px" height="36px" borderRadius="10px" />
                            <window.SkeletonBlock width="105px" height="36px" borderRadius="10px" />
                        </div>
                    </div>

                    {/* Stadium Bowl Oval Arena */}
                    <div className="stadium-skeleton-box">
                        <div className="stadium-skeleton-inner" />
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                        <window.SkeletonBlock width="95px" height="18px" borderRadius="999px" />
                        <window.SkeletonBlock width="95px" height="18px" borderRadius="999px" />
                        <window.SkeletonBlock width="95px" height="18px" borderRadius="999px" />
                    </div>
                </div>

                {/* Right Panel: Sticky Booking Ticket Card */}
                <div className="booking-ticket" style={{ minHeight: '440px', padding: '24px 22px' }}>
                    <window.SkeletonBlock width="80px" height="22px" borderRadius="999px" style={{ marginBottom: '12px' }} />
                    <window.SkeletonBlock width="90%" height="26px" borderRadius="8px" style={{ marginBottom: '8px' }} />
                    <window.SkeletonBlock width="60%" height="14px" borderRadius="4px" style={{ marginBottom: '24px' }} />

                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', marginBottom: '20px' }}>
                        <window.SkeletonBlock width="100%" height="14px" borderRadius="4px" style={{ marginBottom: '10px' }} />
                        <window.SkeletonBlock width="85%" height="14px" borderRadius="4px" />
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <window.SkeletonBlock width="70px" height="16px" borderRadius="4px" />
                            <window.SkeletonBlock width="80px" height="28px" borderRadius="6px" />
                        </div>
                        <window.SkeletonBlock width="100%" height="48px" borderRadius="12px" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. Organizer Dashboard Premium Skeleton
window.DashboardSkeleton = () => {
    return (
        <div className="container skeleton-page-container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                    <window.SkeletonBlock width="120px" height="12px" borderRadius="4px" style={{ marginBottom: '8px' }} />
                    <window.SkeletonBlock width="260px" height="32px" borderRadius="8px" style={{ marginBottom: '6px' }} />
                    <window.SkeletonBlock width="340px" height="16px" borderRadius="4px" />
                </div>
                <window.SkeletonBlock width="140px" height="42px" borderRadius="12px" />
            </div>

            {/* 4 Telemetry Metric Cards */}
            <div className="stats-skeleton-grid">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="stat-skeleton-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <window.SkeletonBlock width="85px" height="12px" borderRadius="4px" />
                            <window.SkeletonBlock width="28px" height="28px" borderRadius="8px" />
                        </div>
                        <window.SkeletonBlock width="110px" height="32px" borderRadius="8px" />
                        <window.SkeletonBlock width="65%" height="12px" borderRadius="4px" />
                    </div>
                ))}
            </div>

            {/* Table Management Panel */}
            <div className="table-skeleton-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <window.SkeletonBlock width="180px" height="22px" borderRadius="6px" />
                    <window.SkeletonBlock width="120px" height="32px" borderRadius="999px" />
                </div>
                {[1, 2, 3, 4, 5].map(row => (
                    <div key={row} className="table-skeleton-row">
                        <div style={{ width: '35%' }}>
                            <window.SkeletonBlock width="80%" height="16px" borderRadius="4px" style={{ marginBottom: '4px' }} />
                            <window.SkeletonBlock width="50%" height="11px" borderRadius="3px" />
                        </div>
                        <window.SkeletonBlock width="70px" height="20px" borderRadius="999px" />
                        <window.SkeletonBlock width="90px" height="14px" borderRadius="4px" />
                        <window.SkeletonBlock width="60px" height="16px" borderRadius="4px" />
                        <window.SkeletonBlock width="80px" height="30px" borderRadius="8px" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. My Tickets Page Premium Skeleton
window.MyTicketsSkeleton = () => {
    return (
        <div className="container skeleton-page-container">
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <window.SkeletonBlock width="110px" height="12px" borderRadius="4px" style={{ marginBottom: '8px' }} />
                <window.SkeletonBlock width="220px" height="34px" borderRadius="8px" style={{ marginBottom: '8px' }} />
                <window.SkeletonBlock width="320px" height="16px" borderRadius="4px" />
            </div>

            <div className="event-grid">
                {[1, 2].map(i => (
                    <div key={i} className="ticket-skeleton" style={{ minHeight: '340px' }}>
                        <div className="ticket-skeleton__main">
                            <div className="ticket-skeleton__top">
                                <window.SkeletonBlock width="85px" height="22px" borderRadius="999px" />
                                <window.SkeletonBlock width="60px" height="14px" borderRadius="4px" />
                            </div>
                            <window.SkeletonBlock width="75%" height="22px" borderRadius="6px" style={{ marginBottom: '8px' }} />
                            <window.SkeletonBlock width="50%" height="13px" borderRadius="4px" style={{ marginBottom: '16px' }} />
                            <div className="ticket-skeleton__meta">
                                <div>
                                    <window.SkeletonBlock width="35px" height="10px" borderRadius="3px" style={{ marginBottom: '4px' }} />
                                    <window.SkeletonBlock width="70%" height="12px" borderRadius="4px" />
                                </div>
                                <div>
                                    <window.SkeletonBlock width="35px" height="10px" borderRadius="3px" style={{ marginBottom: '4px' }} />
                                    <window.SkeletonBlock width="70%" height="12px" borderRadius="4px" />
                                </div>
                            </div>
                        </div>
                        <div className="ticket-skeleton__perforation">
                            <span className="notch notch--left" />
                            <span className="notch notch--right" />
                        </div>
                        <div className="ticket-skeleton__buy">
                            <window.SkeletonBlock width="110px" height="16px" borderRadius="4px" />
                            <window.SkeletonBlock width="100px" height="38px" borderRadius="999px" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Admin Panel Premium Skeleton
window.AdminSkeleton = () => {
    return (
        <div className="container skeleton-page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <window.SkeletonBlock width="140px" height="12px" borderRadius="4px" style={{ marginBottom: '8px' }} />
                    <window.SkeletonBlock width="280px" height="32px" borderRadius="8px" />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <window.SkeletonBlock width="90px" height="34px" borderRadius="999px" />
                    <window.SkeletonBlock width="100px" height="34px" borderRadius="999px" />
                </div>
            </div>

            <div className="stats-skeleton-grid">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="stat-skeleton-card">
                        <window.SkeletonBlock width="75px" height="12px" borderRadius="4px" />
                        <window.SkeletonBlock width="95px" height="30px" borderRadius="6px" />
                        <window.SkeletonBlock width="60%" height="11px" borderRadius="3px" />
                    </div>
                ))}
            </div>

            <div className="table-skeleton-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <window.SkeletonBlock width="150px" height="20px" borderRadius="6px" />
                    <window.SkeletonBlock width="110px" height="30px" borderRadius="999px" />
                </div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="table-skeleton-row">
                        <window.SkeletonBlock width="40px" height="14px" borderRadius="4px" />
                        <window.SkeletonBlock width="120px" height="16px" borderRadius="4px" />
                        <window.SkeletonBlock width="70px" height="18px" borderRadius="999px" />
                        <window.SkeletonBlock width="90px" height="14px" borderRadius="4px" />
                        <window.SkeletonBlock width="80px" height="28px" borderRadius="6px" />
                    </div>
                ))}
            </div>
        </div>
    );
};
