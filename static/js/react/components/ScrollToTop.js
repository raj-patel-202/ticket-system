// Liquid Glass Scroll to Top Floating Button
// Appears smoothly when scrolling down and provides silky smooth scroll back to the top of the window.

const { useState, useEffect } = React;

window.ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 180) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            type="button"
            className={`scroll-to-top-btn ${isVisible ? 'is-visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Move to top"
            title="Move to top"
        >
            <div className="scroll-to-top-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                </svg>
            </div>
            <span className="scroll-to-top-text">Top</span>
        </button>
    );
};
