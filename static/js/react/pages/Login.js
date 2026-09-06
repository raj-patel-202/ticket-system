const { useState } = React;
const { Link, useNavigate, Navigate } = ReactRouterDOM;

window.Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, user } = window.useAuth();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to="/" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await login(username, password);
            if (res) {
                const target = res.redirect_url || (res.user?.user_type === 'admin' ? '/admin' : res.user?.user_type === 'organizer' ? '/dashboard' : '/');
                navigate(target);
            } else {
                setError('Invalid username or password. Please verify and try again.');
            }
        } catch (err) {
            setError('An error occurred during sign in. Please try again.');
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
                        <h2 className="auth-info-title">Welcome Back</h2>
                        <p className="auth-info-desc">
                            Sign in to access your admission passes, view live 3D seat allocations, and manage your live event reservations.
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
                                    <div className="auth-feature-sub">Dynamic multi-section stadium & theater seat maps.</div>
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
                                    <div className="auth-feature-sub">Instant cryptographic QR gate entry codes.</div>
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
                                    <div className="auth-feature-title">Transparent Milestone Pricing</div>
                                    <div className="auth-feature-sub">Real-time surge tracking with zero surprise fees.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Compact Sign In Form */}
                <div className="auth-form-panel">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Welcome Back</h2>
                        <p className="auth-form-subtitle">Enter credentials to access your pass wallet</p>
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
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={submitting}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

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
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={submitting}
                                    autoComplete="current-password"
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
                            {submitting ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
