const { createContext, useState, useEffect, useContext } = React;

window.AuthContext = createContext();

window.AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
            const data = await res.json();
            await checkAuth();
            return data;
        }
        return null;
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
    };

    if (loading) {
        return (
            <div className="skeleton-page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <nav className="navbar">
                    <div className="container nav-container">
                        <div className="nav-brand">
                            <span className="brand-dot" />
                            <span className="brand-name">AuraPass</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {window.SkeletonBlock && <window.SkeletonBlock width="80px" height="34px" borderRadius="999px" />}
                            {window.SkeletonBlock && <window.SkeletonBlock width="95px" height="34px" borderRadius="999px" />}
                        </div>
                    </div>
                </nav>
                <main style={{ flex: 1 }}>
                    {window.HomeSkeleton ? <window.HomeSkeleton /> : null}
                </main>
            </div>
        );
    }

    return (
        <window.AuthContext.Provider value={{ user, login, logout, checkAuth, authLoading: loading }}>
            {children}
        </window.AuthContext.Provider>
    );
};

window.useAuth = () => useContext(window.AuthContext);
