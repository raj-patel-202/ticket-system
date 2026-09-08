// Global Background Arts Component for AuraPass
// Features vector doodles & ambient lighting for the 3 event categories: Concerts, Theater, and Sports.
// Semi-visible through the liquid glossy glass panels on every page.

window.BackgroundArts = () => {
    return (
        <div className="aura-background-canvas" aria-hidden="true">
            {/* Ambient Lighting Orbs (Warm Golden Amber matching user reference, Stage Violet, Stadium Cyan) */}
            <div className="ambient-orb ambient-orb--warm-amber"></div>
            <div className="ambient-orb ambient-orb--violet-stage"></div>
            <div className="ambient-orb ambient-orb--cyan-stadium"></div>
            <div className="ambient-orb ambient-orb--soft-rose"></div>

            {/* Floating Event Vector Doodles Layer */}
            <div className="event-doodles-container">
                
                {/* ================= CATEGORY 1: CONCERTS & LIVE MUSIC ================= */}
                {/* 1. Electric Guitar */}
                <div className="doodle-item doodle-concert doodle--guitar float-anim-1">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M68 18 L82 32 M72 22 L86 8 L92 14 L78 28" />
                        <line x1="75" y1="25" x2="38" y2="62" strokeWidth="3" />
                        <circle cx="82" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="85" cy="15" r="1.5" fill="currentColor" />
                        <circle cx="88" cy="18" r="1.5" fill="currentColor" />
                        {/* Guitar Body */}
                        <path d="M38 62 C34 58 26 56 19 63 C11 71 13 84 22 91 C30 97 43 95 49 87 C54 80 52 72 47 68 C45 66 42 66 38 62 Z" />
                        <circle cx="33" cy="76" r="6" strokeWidth="1.8" />
                        <line x1="26" y1="88" x2="40" y2="88" strokeWidth="2" />
                    </svg>
                    <span className="doodle-caption">LIVE CONCERT</span>
                </div>

                {/* 2. Headphones & Sound Waves */}
                <div className="doodle-item doodle-concert doodle--headphones float-anim-2">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 52 C20 30 34 18 50 18 C66 18 80 30 80 52" />
                        {/* Left Earcup */}
                        <rect x="14" y="50" width="12" height="24" rx="6" />
                        <path d="M26 55 C29 55 31 59 31 62 C31 65 29 69 26 69" />
                        {/* Right Earcup */}
                        <rect x="74" y="50" width="12" height="24" rx="6" />
                        <path d="M74 55 C71 55 69 59 69 62 C69 65 71 69 74 69" />
                        {/* Floating waves */}
                        <path d="M42 42 Q50 36 58 42" strokeWidth="1.5" strokeDasharray="2 3" />
                    </svg>
                </div>

                {/* 3. Vinyl Record */}
                <div className="doodle-item doodle-concert doodle--vinyl float-anim-3">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="50" cy="50" r="42" strokeWidth="2.4" />
                        <circle cx="50" cy="50" r="32" strokeDasharray="6 4" opacity="0.8" />
                        <circle cx="50" cy="50" r="22" strokeDasharray="4 3" opacity="0.6" />
                        <circle cx="50" cy="50" r="12" fill="currentColor" fillOpacity="0.15" strokeWidth="1.8" />
                        <circle cx="50" cy="50" r="3.5" fill="currentColor" />
                    </svg>
                </div>

                {/* 4. Musical Notes Cascade (♪ ♫ 𝄞) */}
                <div className="doodle-item doodle-concert doodle--notes float-anim-1">
                    <svg viewBox="0 0 90 90" fill="currentColor" stroke="none">
                        {/* Beamed Eighth Notes */}
                        <g>
                            <circle cx="24" cy="56" r="9" />
                            <circle cx="64" cy="46" r="9" />
                            <rect x="30" y="20" width="4" height="36" />
                            <rect x="70" y="10" width="4" height="36" />
                            <polygon points="30,20 74,10 74,17 30,27" />
                        </g>
                        {/* Floating Small Note */}
                        <g transform="translate(10, -5) scale(0.6)">
                            <circle cx="65" cy="40" r="7" />
                            <rect x="70" y="16" width="3" height="24" />
                            <path d="M73 16 C80 18 85 24 85 30" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                        </g>
                    </svg>
                </div>

                {/* 5. Vintage Stage Microphone */}
                <div className="doodle-item doodle-concert doodle--mic float-anim-4">
                    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="32" y="14" width="16" height="28" rx="8" />
                        <line x1="32" y1="22" x2="48" y2="22" />
                        <line x1="32" y1="28" x2="48" y2="28" />
                        <line x1="32" y1="34" x2="48" y2="34" />
                        <path d="M26 30 C26 43 33 48 40 48 C47 48 54 43 54 30" />
                        <line x1="40" y1="48" x2="40" y2="64" strokeWidth="2.5" />
                        <path d="M28 64 L52 64" strokeWidth="2.5" />
                    </svg>
                </div>

                {/* ================= CATEGORY 2: THEATER & PERFORMING ARTS ================= */}
                {/* 6. Iconic Comedy & Tragedy Drama Masks */}
                <div className="doodle-item doodle-theater doodle--masks float-anim-2">
                    <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Comedy Mask (Smiling) */}
                        <g transform="translate(10, 8)">
                            <path d="M12 28 C12 8 46 8 46 28 C46 54 34 66 29 66 C24 66 12 54 12 28 Z" fill="currentColor" fillOpacity="0.08" />
                            <circle cx="23" cy="28" r="2.8" fill="currentColor" />
                            <circle cx="35" cy="28" r="2.8" fill="currentColor" />
                            {/* Big Smile */}
                            <path d="M21 44 Q29 55 37 44" strokeWidth="2.5" />
                            <path d="M19 44 L21 44 M37 44 L39 44" />
                        </g>
                        {/* Tragedy Mask (Weeping) */}
                        <g transform="translate(54, 20)">
                            <path d="M12 28 C12 8 46 8 46 28 C46 54 34 66 29 66 C24 66 12 54 12 28 Z" fill="currentColor" fillOpacity="0.08" />
                            <circle cx="23" cy="28" r="2.8" fill="currentColor" />
                            <circle cx="35" cy="28" r="2.8" fill="currentColor" />
                            {/* Frown */}
                            <path d="M22 48 Q29 38 36 48" strokeWidth="2.5" />
                            {/* Tear */}
                            <path d="M37 34 Q39 37 37 40 Q35 37 37 34 Z" fill="currentColor" stroke="none" />
                        </g>
                    </svg>
                    <span className="doodle-caption">{"THEATER & ARTS"}</span>
                </div>

                {/* 7. Theatrical Spotlight Beam */}
                <div className="doodle-item doodle-theater doodle--spotlight float-anim-3">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        {/* Lamp Head */}
                        <path d="M18 18 L32 10 L42 26 L28 34 Z" fill="currentColor" fillOpacity="0.15" />
                        <line x1="20" y1="12" x2="14" y2="6" strokeWidth="2.5" />
                        {/* Spotlight Cone */}
                        <polygon points="34,22 88,72 68,92 24,32" fill="currentColor" fillOpacity="0.06" stroke="none" />
                        <line x1="34" y1="22" x2="88" y2="72" strokeDasharray="3 3" opacity="0.7" />
                        <line x1="24" y1="32" x2="68" y2="92" strokeDasharray="3 3" opacity="0.7" />
                        {/* Ellipse target */}
                        <ellipse cx="78" cy="82" rx="14" ry="7" transform="rotate(-30 78 82)" strokeDasharray="4 3" />
                    </svg>
                </div>

                {/* 8. Stage Velvet Curtains */}
                <div className="doodle-item doodle-theater doodle--curtains float-anim-1">
                    <svg viewBox="0 0 110 80" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        {/* Top Pelmet / Valance */}
                        <path d="M6 14 Q20 22 34 14 Q48 22 62 14 Q76 22 90 14 Q100 20 104 14" strokeWidth="2.5" />
                        {/* Left Swag */}
                        <path d="M12 16 Q28 38 10 74" strokeWidth="2" />
                        <path d="M22 18 Q38 42 20 74" opacity="0.65" />
                        {/* Right Swag */}
                        <path d="M98 16 Q82 38 100 74" strokeWidth="2" />
                        <path d="M88 18 Q72 42 90 74" opacity="0.65" />
                        {/* Curtain Tie Rope */}
                        <path d="M12 46 Q24 48 22 56" strokeDasharray="2 2" />
                        <path d="M98 46 Q86 48 88 56" strokeDasharray="2 2" />
                    </svg>
                </div>

                {/* 9. Vintage Admit One Ticket Stub */}
                <div className="doodle-item doodle-theater doodle--ticket-stub float-anim-4">
                    <svg viewBox="0 0 90 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 14 C6 14 10 14 12 14 C12 22 20 22 20 14 L76 14 C76 20 84 20 84 14 L84 46 C84 46 78 46 76 46 C76 38 68 38 68 46 L12 46 C12 38 6 38 6 46 Z" fill="currentColor" fillOpacity="0.08" />
                        <line x1="32" y1="16" x2="32" y2="44" strokeDasharray="2 3" />
                        {/* Star symbol inside */}
                        <polygon points="56,22 58,28 64,28 59,32 61,38 56,34 51,38 53,32 48,28 54,28" fill="currentColor" stroke="none" />
                    </svg>
                </div>

                {/* ================= CATEGORY 3: SPORTS & STADIUM ================= */}
                {/* 10. Championship Trophy Cup */}
                <div className="doodle-item doodle-sport doodle--trophy float-anim-2">
                    <svg viewBox="0 0 90 90" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Cup Bowl */}
                        <path d="M26 16 L64 16 C64 36 56 48 45 48 C34 48 26 36 26 16 Z" fill="currentColor" fillOpacity="0.1" />
                        {/* Left Handle */}
                        <path d="M26 22 C14 22 14 36 26 38" strokeWidth="2" />
                        {/* Right Handle */}
                        <path d="M64 22 C76 22 76 36 64 38" strokeWidth="2" />
                        {/* Stem & Base */}
                        <line x1="45" y1="48" x2="45" y2="64" strokeWidth="3" />
                        <path d="M34 64 L56 64 L60 76 L30 76 Z" fill="currentColor" fillOpacity="0.15" />
                        {/* Star on Cup */}
                        <polygon points="45,24 47,29 52,29 48,32 50,37 45,34 40,37 42,32 38,29 43,29" fill="currentColor" stroke="none" />
                    </svg>
                    <span className="doodle-caption">{"SPORTS & ARENA"}</span>
                </div>

                {/* 11. Seamed Basketball */}
                <div className="doodle-item doodle-sport doodle--basketball float-anim-3">
                    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="40" cy="40" r="32" fill="currentColor" fillOpacity="0.08" strokeWidth="2.4" />
                        <line x1="8" y1="40" x2="72" y2="40" />
                        <line x1="40" y1="8" x2="40" y2="72" />
                        <path d="M16 18 C26 28 26 52 16 62" strokeWidth="1.8" />
                        <path d="M64 18 C54 28 54 52 64 62" strokeWidth="1.8" />
                    </svg>
                </div>

                {/* 12. Classic Soccer Ball with Pentagons */}
                <div className="doodle-item doodle-sport doodle--soccer float-anim-1">
                    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="40" cy="40" r="32" strokeWidth="2.4" />
                        {/* Center Pentagon */}
                        <polygon points="40,28 49,35 46,46 34,46 31,35" fill="currentColor" fillOpacity="0.2" />
                        {/* Spokes */}
                        <line x1="40" y1="28" x2="40" y2="14" />
                        <line x1="49" y1="35" x2="62" y2="30" />
                        <line x1="46" y1="46" x2="56" y2="58" />
                        <line x1="34" y1="46" x2="24" y2="58" />
                        <line x1="31" y1="35" x2="18" y2="30" />
                    </svg>
                </div>

                {/* 13. Referee Whistle on String */}
                <div className="doodle-item doodle-sport doodle--whistle float-anim-4">
                    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Whistle Barrel */}
                        <path d="M22 42 L46 42 C54 42 62 48 62 56 C62 64 54 70 46 70 C38 70 30 64 30 56 L30 46 L18 46 C14 46 12 42 12 38 L22 38 Z" fill="currentColor" fillOpacity="0.1" />
                        <circle cx="46" cy="56" r="6" strokeWidth="1.8" />
                        {/* Lanyard Ring */}
                        <circle cx="14" cy="38" r="4" strokeWidth="1.8" />
                        <path d="M10 38 Q6 20 28 14" strokeDasharray="3 3" opacity="0.75" />
                    </svg>
                </div>

                {/* 14. Stadium Running Track Arcs */}
                <div className="doodle-item doodle-sport doodle--tracks float-anim-2">
                    <svg viewBox="0 0 100 70" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M10 60 C10 24 40 10 70 10 L90 10" opacity="0.8" />
                        <path d="M18 60 C18 30 44 18 70 18 L90 18" opacity="0.65" />
                        <path d="M26 60 C26 36 48 26 70 26 L90 26" opacity="0.5" />
                        <line x1="70" y1="8" x2="70" y2="28" strokeWidth="2.2" />
                        <circle cx="82" cy="18" r="2" fill="currentColor" />
                    </svg>
                </div>

                {/* ================= AESTHETIC ACCENTS: SPARKLES & GLASS RINGS ================= */}
                {/* Sparkle Glint 1 */}
                <div className="doodle-item doodle-accent doodle--glint-1 float-anim-1">
                    <svg viewBox="0 0 40 40" fill="currentColor">
                        <path d="M20 0 C20 11 29 20 40 20 C29 20 20 29 20 40 C20 29 11 20 0 20 C11 20 20 11 20 0 Z" />
                    </svg>
                </div>

                {/* Sparkle Glint 2 */}
                <div className="doodle-item doodle-accent doodle--glint-2 float-anim-3">
                    <svg viewBox="0 0 40 40" fill="currentColor">
                        <path d="M20 4 C20 12 28 20 36 20 C28 20 20 28 20 36 C20 28 12 20 4 20 C12 20 20 12 20 4 Z" />
                    </svg>
                </div>

                {/* Sparkle Glint 3 */}
                <div className="doodle-item doodle-accent doodle--glint-3 float-anim-2">
                    <svg viewBox="0 0 30 30" fill="currentColor">
                        <polygon points="15,0 17,11 28,7 20,15 28,23 17,19 15,30 13,19 2,23 10,15 2,7 13,11" />
                    </svg>
                </div>

                {/* Floating Glass Halo Rings */}
                <div className="doodle-item doodle-accent doodle--ring-1 float-anim-4">
                    <div className="glass-halo-ring"></div>
                </div>
                <div className="doodle-item doodle-accent doodle--ring-2 float-anim-1">
                    <div className="glass-halo-ring glass-halo-ring--small"></div>
                </div>

            </div>
        </div>
    );
};
