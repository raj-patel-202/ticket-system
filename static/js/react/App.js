const { BrowserRouter, Routes, Route, Outlet } = ReactRouterDOM;

window.AppLayout = () => {
    return (
        <React.Fragment>
            <window.Navbar />
            <main>
                <Outlet />
            </main>
        </React.Fragment>
    );
};

window.App = () => {
    return (
        <window.AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<window.AppLayout />}>
                        <Route index element={<window.Home />} />
                        <Route path="login" element={<window.Login />} />
                        <Route path="register" element={<window.Register />} />
                        <Route path="events/:id/select-seat" element={<window.SeatSelection />} />
                        <Route path="my-tickets" element={<window.MyTickets />} />
                        <Route path="dashboard" element={<window.Dashboard />} />
                        <Route path="host-event" element={<window.HostEvent />} />
                        <Route path="admin" element={<window.Admin />} />
                        {/* Fallback route */}
                        <Route path="*" element={<window.Home />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </window.AuthProvider>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<window.App />);
