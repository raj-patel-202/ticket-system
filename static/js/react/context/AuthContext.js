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

    if (loading) return <div>Loading...</div>;

    return (
        <window.AuthContext.Provider value={{ user, login, logout, checkAuth }}>
            {children}
        </window.AuthContext.Provider>
    );
};

window.useAuth = () => useContext(window.AuthContext);
