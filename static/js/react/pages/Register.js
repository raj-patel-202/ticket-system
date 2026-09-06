const { useState, useEffect, useRef } = React;
const { Link, useNavigate, Navigate } = ReactRouterDOM;

window.Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        user_type: 'buyer'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user, checkAuth } = window.useAuth();
    const navigate = useNavigate();

    // Sliding capsule indicator for account role toggle
    const toggleRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

    const updateIndicator = (role) => {
        if (!toggleRef.current) return;
        const activeBtn = toggleRef.current.querySelector(`[data-role="${role}"]`);
        if (activeBtn) {
            setIndicatorStyle({
                left: activeBtn.offsetLeft,
                width: activeBtn.offsetWidth,
                opacity: 1
            });
        }
    };

    useEffect(() => {
        updateIndicator(formData.user_type);
    }, [formData.user_type]);

    useEffect(() => {
        const timer = setTimeout(() => updateIndicator(formData.user_type), 60);
        const handleResize = () => updateIndicator(formData.user_type);
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (user) {
        return <Navigate to="/" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await checkAuth();
                navigate('/');
            } else {
                const data = await res.json();
                const detailMsg = Array.isArray(data.detail)
                    ? data.detail.map(d => d.msg).join(', ')
                    : (data.detail || 'Registration failed');
                setError(detailMsg);
            }
        } catch (err) {
            setError('An error occurred during registration. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page-container fade-up">
            <div className="auth-split-card">
                {/* Left Side: Spacious Value Showcase */}
                <div className="auth-info-panel">
                    <div>
                        <h2 className="auth-info-title">Join AuraPass</h2>
                        <p className="auth-info-desc">
                            Select seats with real-time 3D interactive maps, enjoy transparent milestone pricing, and secure verified admission passes.
                        </p>

                        <div className="auth-feature-list">
                            <div className="auth-feature-item">
                                <div className="morph-icon-box">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="auth-feature-title">Interactive 3D Seating</div>
                                    <div className="auth-feature-sub">Full-view venue maps with instant live seat locks.</div>
                                </div>
                            </div>

                            <div className="auth-feature-item">
                                <div className="morph-icon-box">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="6" width="20" height="12" rx="3" />
                                        <circle cx="7" cy="12" r="1.5" fill="currentColor" />
                                        <path d="M12 6v12" strokeDasharray="2 2" />
                                        <circle cx="17" cy="12" r="1.5" fill="currentColor" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="auth-feature-title">Verified Digital Passes</div>
                                    <div className="auth-feature-sub">Anti-scalp cryptographic QR verification codes.</div>
                                </div>
                            </div>

                            <div className="auth-feature-item">
                                <div className="morph-icon-box">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                        <polyline points="17 6 23 6 23 12" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="auth-feature-title">Dynamic Milestone Pricing</div>
                                    <div className="auth-feature-sub">Transparent early bird curve with zero surprise fees.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Create Account</h2>
                        <p className="auth-form-subtitle">Choose account type and enter credentials</p>
                    </div>

                    {error && (
                        <div className="alert-box alert-danger" style={{ padding: '8px 12px', marginBottom: '10px', fontSize: '0.82rem' }}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Account Type Sleek Horizontal Segmented Toggle with Capsule Slider */}
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Account Type</label>
                            <div className="account-type-toggle" ref={toggleRef}>
                                <div
                                    className="account-capsule-slider"
                                    style={{
                                        transform: `translateX(${indicatorStyle.left}px)`,
                                        width: `${indicatorStyle.width}px`,
                                        opacity: indicatorStyle.opacity
                                    }}
                                />
                                <button
                                    type="button"
                                    data-role="buyer"
                                    className={`account-toggle-btn ${formData.user_type === 'buyer' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, user_type: 'buyer' })}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="6" width="20" height="12" rx="3" />
                                        <circle cx="7" cy="12" r="1.5" fill="currentColor" />
                                        <path d="M12 6v12" strokeDasharray="2 2" />
                                        <circle cx="17" cy="12" r="1.5" fill="currentColor" />
                                    </svg>
                                    <span>Attendee</span>
                                </button>
                                <button
                                    type="button"
                                    data-role="organizer"
                                    className={`account-toggle-btn ${formData.user_type === 'organizer' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, user_type: 'organizer' })}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    <span>Organizer</span>
                                </button>
                            </div>
                        </div>

                        {/* Username Field with Icon */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Username</label>
                            <div className="input-with-icon">
                                <div className="input-icon-wrap">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    disabled={submitting}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Email Field with Icon */}
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Email Address</label>
                            <div className="input-with-icon">
                                <div className="input-icon-wrap">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    className="form-control"
                                    required
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={submitting}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field with Icon */}
                        <div className="form-group" style={{ marginBottom: '14px' }}>
                            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Password</label>
                            <div className="input-with-icon">
                                <div className="input-icon-wrap">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    required
                                    minLength="6"
                                    placeholder="At least 6 characters"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={submitting}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                            <line x1="2" x2="22" y1="2" y2="22" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', height: '40px', fontSize: '0.9rem' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating Account...' : 'Create Account →'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
