import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

os.makedirs("report_assets", exist_ok=True)

# Set global matplotlib styles
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['axes.edgecolor'] = '#CBD5E1'
plt.rcParams['axes.linewidth'] = 1.0

# -------------------------------------------------------------
# 1. High-Level System Architecture Diagram
# -------------------------------------------------------------
def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(12, 7.5), dpi=300)
    ax.set_facecolor('#F8FAFC')
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 96, "AuraPass — End-to-End System Architecture", 
            ha='center', va='center', fontsize=17, fontweight='bold', color='#0F172A')
    ax.text(50, 92.5, "Tiered Micro-Monolith Architecture: Client SPA, FastAPI ASGI Gateway & SQLite Persistence", 
            ha='center', va='center', fontsize=10, color='#64748B')

    # Container 1: Client Tier
    rect_client = patches.FancyBboxPatch((4, 66), 92, 23, boxstyle="round,pad=0.8,rounding_size=1.5",
                                         facecolor='#EEF2FF', edgecolor='#6366F1', linewidth=1.5)
    ax.add_patch(rect_client)
    ax.text(6, 86.5, "CLIENT LAYER (Single Page Application)", fontsize=11, fontweight='bold', color='#3730A3')

    client_boxes = [
        ("React 18 SPA Engine\n• Declarative Virtual DOM\n• High-frequency re-renders", 6, 68.5, 20, 15, '#FFFFFF', '#C7D2FE'),
        ("React Router v6 Navigation\n• Browser History API\n• Protected Role Route Guards", 28.5, 68.5, 21, 15, '#FFFFFF', '#C7D2FE'),
        ("Liquid Glassmorphism UI\n• Backdrop Blur & Specular Bevels\n• Ambient Glow Canvas", 52, 68.5, 21, 15, '#FFFFFF', '#C7D2FE'),
        ("Interactive SVG Seating\n• Theater Raked Auditorium\n• Stadium Multi-Tier Amphitheater", 75.5, 68.5, 19, 15, '#FFFFFF', '#C7D2FE')
    ]
    for text, x, y, w, h, bg, border in client_boxes:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1.0",
                                   facecolor=bg, edgecolor=border, linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8.5, color='#1E1B4B', multialignment='center')

    # Arrow Down from Client to API
    ax.annotate('', xy=(50, 60), xytext=(50, 65.5),
                arrowprops=dict(arrowstyle="simple,head_width=2.5,head_length=3", facecolor='#4338CA', edgecolor='none'))
    ax.text(52, 63, "HTTP/1.1 REST Requests & HTTP-Only JWT Cookie", fontsize=8.5, fontweight='bold', color='#4338CA')

    # Container 2: Application / API Gateway Tier
    rect_api = patches.FancyBboxPatch((4, 25), 92, 34, boxstyle="round,pad=0.8,rounding_size=1.5",
                                      facecolor='#F0FDF4', edgecolor='#10B981', linewidth=1.5)
    ax.add_patch(rect_api)
    ax.text(6, 56.5, "APPLICATION & BUSINESS LOGIC LAYER (FastAPI & Uvicorn ASGI)", fontsize=11, fontweight='bold', color='#065F46')

    # Sub-box Routers
    routers_p = patches.FancyBboxPatch((6, 38), 42, 16, boxstyle="round,pad=0.5,rounding_size=1.0",
                                      facecolor='#FFFFFF', edgecolor='#A7F3D0', linewidth=1.2)
    ax.add_patch(routers_p)
    ax.text(27, 51.5, "Modular REST API Routers", ha='center', fontsize=9.5, fontweight='bold', color='#064E3B')
    router_text = "• /api/auth — Bcrypt Hashing, Session Management\n• /api/events — Dynamic Catalog & Seat Querying\n• /api/tickets — Transactional Booking & Digital Passes\n• /api/organizer — Studio KPIs & Roster Metrics\n• /api/admin — Hardware Telemetry & Audit Logs"
    ax.text(27, 43.5, router_text, ha='center', va='center', fontsize=7.8, color='#064E3B', multialignment='left')

    # Sub-box Core Engines
    engines_p = patches.FancyBboxPatch((52, 38), 42.5, 16, boxstyle="round,pad=0.5,rounding_size=1.0",
                                       facecolor='#FFFFFF', edgecolor='#A7F3D0', linewidth=1.2)
    ax.add_patch(engines_p)
    ax.text(73.2, 51.5, "Core Computational Engines", ha='center', fontsize=9.5, fontweight='bold', color='#064E3B')
    engine_text = "• Algorithmic Dynamic Pricing (Demand + Urgency)\n• Seat Collision & Concurrency Lockout Guard\n• Unique Alphanumeric Serialization (CN/TH/SP)\n• Telemetry Probe (psutil, shutil, DB latency ping)\n• Role-Based Access Control (RBAC) Verifier"
    ax.text(73.2, 43.5, engine_text, ha='center', va='center', fontsize=7.8, color='#064E3B', multialignment='left')

    # Middleware & Pydantic
    mw_p = patches.FancyBboxPatch((6, 27.5), 88.5, 8.5, boxstyle="round,pad=0.5,rounding_size=0.8",
                                  facecolor='#ECFDF5', edgecolor='#6EE7B7', linewidth=1.0)
    ax.add_patch(mw_p)
    ax.text(50, 31.7, "Cross-Cutting Services: Pydantic v2 Schema Sanitization | HTTP-Only Cookie Extraction | Static File Handler", 
            ha='center', va='center', fontsize=8.5, fontweight='semibold', color='#047857')

    # Arrow Down from API to Persistence
    ax.annotate('', xy=(50, 19), xytext=(50, 24.5),
                arrowprops=dict(arrowstyle="simple,head_width=2.5,head_length=3", facecolor='#059669', edgecolor='none'))
    ax.text(52, 22, "Serialized SQLite Write Transactions & WAL Read Pools", fontsize=8.5, fontweight='bold', color='#059669')

    # Container 3: Persistence & Host Layer
    rect_db = patches.FancyBboxPatch((4, 3), 92, 15, boxstyle="round,pad=0.8,rounding_size=1.5",
                                     facecolor='#F8FAFC', edgecolor='#0EA5E9', linewidth=1.5)
    ax.add_patch(rect_db)
    ax.text(6, 15.5, "PERSISTENCE & HOST OPERATING SYSTEM LAYER", fontsize=11, fontweight='bold', color='#0369A1')

    db_items = [
        ("SQLite 3 Engine (WAL Mode)\n• PRAGMA foreign_keys = ON\n• Non-blocking WAL reads\n• Atomic ACID write transactions", 6, 4.5, 33, 9.5, '#FFFFFF', '#BAE6FD'),
        ("Relational Schema Ledger\n• users (Identity & Roles)\n• events (Capacities & Tiers)\n• sells (Immutable Ledger)", 41, 4.5, 29, 9.5, '#FFFFFF', '#BAE6FD'),
        ("Host Telemetry Subsystem\n• psutil Process & Host CPU/RAM\n• shutil Volume Storage Headroom\n• CLI Admin Tool (create_admin.py)", 72, 4.5, 22.5, 9.5, '#FFFFFF', '#BAE6FD')
    ]
    for text, x, y, w, h, bg, border in db_items:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=0.8",
                                   facecolor=bg, edgecolor=border, linewidth=1.1)
        ax.add_patch(p)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=7.8, color='#0C4A6E', multialignment='center')

    plt.tight_layout()
    plt.savefig("report_assets/fig1_system_architecture.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("[+] Generated Figure 1: System Architecture Diagram")

# -------------------------------------------------------------
# 2. Concurrency & Race Condition Resolution Flowchart
# -------------------------------------------------------------
def generate_concurrency_diagram():
    fig, ax = plt.subplots(figsize=(12, 8), dpi=300)
    ax.set_facecolor('#F8FAFC')
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96.5, "AuraPass — Simultaneous Seat Booking Race Condition Resolution", 
            ha='center', va='center', fontsize=16, fontweight='bold', color='#0F172A')
    ax.text(50, 93, "Two Buyers Attempting to Purchase 'Row D · Seat 12' at the Exact Same Millisecond (T0)", 
            ha='center', va='center', fontsize=10, color='#64748B')

    # Swimlanes
    rect_a = patches.FancyBboxPatch((3, 6), 44, 84, boxstyle="round,pad=0.8,rounding_size=1.2",
                                    facecolor='#F0FDF4', edgecolor='#22C55E', linewidth=1.5)
    ax.add_patch(rect_a)
    ax.text(25, 87, "BUYER A (Winner / First Lock)", fontsize=13, fontweight='bold', color='#15803D', ha='center')

    rect_b = patches.FancyBboxPatch((53, 6), 44, 84, boxstyle="round,pad=0.8,rounding_size=1.2",
                                    facecolor='#FEF2F2', edgecolor='#EF4444', linewidth=1.5)
    ax.add_patch(rect_b)
    ax.text(75, 87, "BUYER B (Collision / Rejected)", fontsize=13, fontweight='bold', color='#B91C1C', ha='center')

    # Steps for Buyer A
    steps_a = [
        ("T0: Clicks 'Confirm Purchase'\nSelects seat ['Row D · Seat 12']", 79, '#FFFFFF', '#86EFAC', '#14532D'),
        ("T1: Acquires SQLite Write Lock\nEnters ACID Transaction Boundary", 66, '#DCFCE7', '#4ADE80', '#14532D'),
        ("T2: Collision Check Query\nSELECT position_of_seat FROM sells\nWHERE event_id = 101 AND seat IN ('D-12')\nResult: EMPTY (Seat is available)", 49, '#FFFFFF', '#86EFAC', '#14532D'),
        ("T3: Transaction Commitment\n• Inserts record into sells with serial CN-84920\n• UPDATE events SET sold_tickets = sold_tickets + 1\n• Writes to WAL log & releases write lock", 30, '#DCFCE7', '#4ADE80', '#14532D'),
        ("T4: HTTP 200 OK Response Issued\nDigital pass rendered in 'My Tickets' wallet\nSeat securely locked under Buyer A account", 13, '#22C55E', '#16A34A', '#FFFFFF')
    ]

    for text, y, bg, border, tc in steps_a:
        p = patches.FancyBboxPatch((6, y - 5), 38, 10, boxstyle="round,pad=0.5,rounding_size=0.8",
                                   facecolor=bg, edgecolor=border, linewidth=1.2)
        ax.add_patch(p)
        ax.text(25, y, text, ha='center', va='center', fontsize=8.5, fontweight='semibold' if tc == '#FFFFFF' else 'normal', color=tc)

    for y_arrow in [73, 60, 41, 23]:
        ax.annotate('', xy=(25, y_arrow - 1), xytext=(25, y_arrow + 1.5),
                    arrowprops=dict(arrowstyle="simple,head_width=1.8,head_length=2.2", facecolor='#16A34A', edgecolor='none'))

    # Steps for Buyer B
    steps_b = [
        ("T0: Clicks 'Confirm Purchase'\nSelects exact same seat ['Row D · Seat 12']", 79, '#FFFFFF', '#FCA5A5', '#7F1D1D'),
        ("T1: Queued for Database Write Lock\nWaits briefly for Buyer A's lock to clear", 66, '#FEE2E2', '#F87171', '#7F1D1D'),
        ("T2.5: Collision Check Evaluated\nSELECT position_of_seat FROM sells...\nResult: COLLISION DETECTED! ('D-12' exists)", 49, '#FFFFFF', '#FCA5A5', '#7F1D1D'),
        ("T3: Immediate Transaction Abort\n• conn.rollback() executed automatically\n• Zero rows written; capacity NOT altered\n• Raises HTTPException(status_code=409)", 30, '#FEE2E2', '#F87171', '#7F1D1D'),
        ("T4: HTTP 409 Conflict Dispatched\nUI displays error alert: 'Seat just taken!'\nSeat deselected; map auto-refreshes to RED", 13, '#EF4444', '#DC2626', '#FFFFFF')
    ]

    for text, y, bg, border, tc in steps_b:
        p = patches.FancyBboxPatch((56, y - 5), 38, 10, boxstyle="round,pad=0.5,rounding_size=0.8",
                                   facecolor=bg, edgecolor=border, linewidth=1.2)
        ax.add_patch(p)
        ax.text(75, y, text, ha='center', va='center', fontsize=8.5, fontweight='semibold' if tc == '#FFFFFF' else 'normal', color=tc)

    for y_arrow in [73, 60, 41, 23]:
        ax.annotate('', xy=(75, y_arrow - 1), xytext=(75, y_arrow + 1.5),
                    arrowprops=dict(arrowstyle="simple,head_width=1.8,head_length=2.2", facecolor='#DC2626', edgecolor='none'))

    # Center connector arrow showing collision dependency
    ax.annotate('', xy=(56, 49), xytext=(44, 49),
                arrowprops=dict(arrowstyle="fancy,tail_width=0.6,head_width=2.5,head_length=3", facecolor='#EA580C', edgecolor='none', connectionstyle="arc3,rad=-0.1"))
    ax.text(50, 52.5, "Row D · Seat 12 written to 'sells'", ha='center', va='center', fontsize=8, fontweight='bold', color='#C2410C')

    plt.tight_layout()
    plt.savefig("report_assets/fig2_concurrency_race_condition.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("[+] Generated Figure 2: Concurrency & Race Condition Diagram")

# -------------------------------------------------------------
# 3. Dynamic Pricing Curve Diagram
# -------------------------------------------------------------
def generate_pricing_diagram():
    fig, ax = plt.subplots(figsize=(11, 6.5), dpi=300)
    ax.set_facecolor('#F8FAFC')
    fig.patch.set_facecolor('#FFFFFF')

    capacity_pct = np.linspace(0, 100, 500)
    base_price = 50.0

    price_urgency_low = []
    price_urgency_mid = []
    price_urgency_high = []

    for c in capacity_pct:
        if c >= 90:
            hike_low = 50.0 + (0.0 * 40.0)
            hike_mid = 50.0 + (0.5 * 40.0)
            hike_high = 50.0 + (1.0 * 40.0)
        elif c >= 50:
            hike_low = 20.0 + (0.0 * 15.0)
            hike_mid = 20.0 + (0.5 * 15.0)
            hike_high = 20.0 + (1.0 * 15.0)
        else:
            hike_low = 0.0
            hike_mid = 0.0
            hike_high = 0.0
        
        price_urgency_low.append(base_price * (1 + hike_low / 100))
        price_urgency_mid.append(base_price * (1 + hike_mid / 100))
        price_urgency_high.append(base_price * (1 + hike_high / 100))

    ax.plot(capacity_pct, price_urgency_high, color='#DC2626', linewidth=2.8, label='Peak Surge: High Urgency (Event Imminent, Urgency=1.0)')
    ax.plot(capacity_pct, price_urgency_mid, color='#D97706', linewidth=2.4, linestyle='--', label='Mid Demand: Moderate Urgency (Midway, Urgency=0.5)')
    ax.plot(capacity_pct, price_urgency_low, color='#2563EB', linewidth=2.4, linestyle=':', label='Floor Demand: Low Urgency (Just Posted, Urgency=0.0)')

    ax.axvspan(0, 50, color='#10B981', alpha=0.10, label='Base Tier (<50% Sold: 0% Base Hike)')
    ax.axvspan(50, 90, color='#F59E0B', alpha=0.12, label='Tier 1 Demand (50%-89% Sold: +20% to +35% Hike)')
    ax.axvspan(90, 100, color='#EF4444', alpha=0.15, label='Tier 2 Peak Surge (90%+ Sold: +50% to +90% Hike)')

    ax.axvline(50, color='#D97706', linestyle='-', linewidth=1.2, alpha=0.7)
    ax.axvline(90, color='#DC2626', linestyle='-', linewidth=1.2, alpha=0.7)

    ax.scatter([50, 50, 90, 90], [60.0, 67.5, 75.0, 95.0], color=['#2563EB', '#DC2626', '#2563EB', '#DC2626'], zorder=5, s=50)
    ax.annotate('Milestone 1 (+20% base)\n$60.00 – $67.50', xy=(50, 67.5), xytext=(30, 78),
                arrowprops=dict(arrowstyle="->", color='#B45309', lw=1.2),
                bbox=dict(boxstyle="round,pad=0.4", fc="#FEF3C7", ec="#F59E0B", lw=1), fontsize=8.5, fontweight='bold', color='#92400E')

    ax.annotate('Milestone 2 Peak Surge (+50% base)\n$75.00 – $95.00', xy=(90, 95.0), xytext=(68, 100),
                arrowprops=dict(arrowstyle="->", color='#991B1B', lw=1.2),
                bbox=dict(boxstyle="round,pad=0.4", fc="#FEE2E2", ec="#EF4444", lw=1), fontsize=8.5, fontweight='bold', color='#991B1B')

    group_box = "Group Purchase Incentive:\n5% Discount applied on every\nadditional ticket beyond Qty 2"
    ax.text(12, 88, group_box, bbox=dict(boxstyle="round,pad=0.6", fc="#EFF6FF", ec="#3B82F6", lw=1.2),
            fontsize=8.5, color='#1E40AF', fontweight='semibold', multialignment='center')

    ax.set_title("AuraPass Dynamic Pricing Engine: Dual-Factor Scarcity & Urgency Curve", fontsize=14, fontweight='bold', color='#0F172A', pad=15)
    ax.set_xlabel("Event Capacity Sold Percentage (%)", fontsize=11, fontweight='semibold', color='#334155', labelpad=10)
    ax.set_ylabel("Ticket Price (USD) [Base Price = $50.00]", fontsize=11, fontweight='semibold', color='#334155', labelpad=10)
    ax.set_xlim(0, 100)
    ax.set_ylim(45, 105)
    ax.grid(True, linestyle='--', alpha=0.5, color='#94A3B8')
    ax.legend(loc='lower right', framealpha=0.95, facecolor='#FFFFFF', edgecolor='#CBD5E1', fontsize=8.5)

    plt.tight_layout()
    plt.savefig("report_assets/fig3_dynamic_pricing_curve.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("[+] Generated Figure 3: Dynamic Pricing Curve Diagram")

# -------------------------------------------------------------
# 4. Database Entity-Relationship Diagram
# -------------------------------------------------------------
def generate_er_diagram():
    fig, ax = plt.subplots(figsize=(12, 7), dpi=300)
    ax.set_facecolor('#F8FAFC')
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96, "AuraPass — Relational Database Schema & Entity Relationships", 
            ha='center', va='center', fontsize=16, fontweight='bold', color='#0F172A')
    ax.text(50, 92, "SQLite 3 Normalized Architecture with Enforced Foreign Keys & Cascading Deletes", 
            ha='center', va='center', fontsize=10, color='#64748B')

    rect_users = patches.FancyBboxPatch((4, 42), 27, 44, boxstyle="round,pad=0.6,rounding_size=1.0",
                                        facecolor='#FFFFFF', edgecolor='#3B82F6', linewidth=1.5)
    ax.add_patch(rect_users)
    h_users = patches.Rectangle((4, 79), 27, 7, facecolor='#1D4ED8')
    ax.add_patch(h_users)
    ax.text(17.5, 82.5, "TABLE: users", ha='center', va='center', fontsize=11, fontweight='bold', color='#FFFFFF')

    users_fields = [
        ("u_id", "INTEGER (PK, AUTO)", True),
        ("username", "TEXT (UNIQUE, NOT NULL)", False),
        ("email", "TEXT (UNIQUE, NOT NULL)", False),
        ("password", "TEXT (Bcrypt Hash)", False),
        ("user_type", "TEXT (admin/buyer/org)", False),
        ("created_at", "TEXT (ISO UTC)", False),
    ]
    y_pos = 73
    for name, dtype, is_pk in users_fields:
        prefix = "PK " if is_pk else "   "
        color = "#1E40AF" if is_pk else "#334155"
        weight = "bold" if is_pk else "normal"
        ax.text(6, y_pos, f"{prefix}{name}", fontsize=8.5, fontweight=weight, color=color)
        ax.text(29, y_pos, dtype, fontsize=7.5, color='#64748B', ha='right')
        y_pos -= 5.5

    rect_events = patches.FancyBboxPatch((69, 32), 27, 54, boxstyle="round,pad=0.6,rounding_size=1.0",
                                         facecolor='#FFFFFF', edgecolor='#10B981', linewidth=1.5)
    ax.add_patch(rect_events)
    h_events = patches.Rectangle((69, 79), 27, 7, facecolor='#047857')
    ax.add_patch(h_events)
    ax.text(82.5, 82.5, "TABLE: events", ha='center', va='center', fontsize=11, fontweight='bold', color='#FFFFFF')

    events_fields = [
        ("event_id", "INTEGER (PK, AUTO)", True, False),
        ("user_id", "INTEGER (FK -> users)", False, True),
        ("event_name", "TEXT (NOT NULL)", False, False),
        ("event_type", "TEXT (concert/th/sp)", False, False),
        ("venue", "TEXT (NOT NULL)", False, False),
        ("time", "TEXT (ISO Event Date)", False, False),
        ("capacity", "INTEGER (10-120)", False, False),
        ("sold_tickets", "INTEGER (DEFAULT 0)", False, False),
        ("price_per_ticket", "REAL (Base Price)", False, False),
        ("subtitle", "TEXT (Promo Note)", False, False),
        ("status", "TEXT (active/done)", False, False),
        ("created_at", "TEXT (ISO UTC)", False, False),
    ]
    y_pos = 73
    for name, dtype, is_pk, is_fk in events_fields:
        prefix = "PK " if is_pk else ("FK " if is_fk else "   ")
        color = "#065F46" if (is_pk or is_fk) else "#334155"
        weight = "bold" if (is_pk or is_fk) else "normal"
        ax.text(71, y_pos, f"{prefix}{name}", fontsize=8.2, fontweight=weight, color=color)
        ax.text(94, y_pos, dtype, fontsize=7.2, color='#64748B', ha='right')
        y_pos -= 3.8

    rect_sells = patches.FancyBboxPatch((32, 2), 36, 46, boxstyle="round,pad=0.6,rounding_size=1.0",
                                        facecolor='#FFFFFF', edgecolor='#8B5CF6', linewidth=1.5)
    ax.add_patch(rect_sells)
    h_sells = patches.Rectangle((32, 41), 36, 7, facecolor='#6D28D9')
    ax.add_patch(h_sells)
    ax.text(50, 44.5, "TABLE: sells (Ticket Transactions)", ha='center', va='center', fontsize=11, fontweight='bold', color='#FFFFFF')

    sells_fields = [
        ("sell_id", "INTEGER (PK, AUTO)", True, False),
        ("user_id", "INTEGER (FK -> users)", False, True),
        ("event_id", "INTEGER (FK -> events)", False, True),
        ("selling_price", "REAL (Paid Unit Price)", False, False),
        ("position_of_seat", "TEXT (e.g., 'Row D · Seat 12')", False, False),
        ("ticket_code", "TEXT (UNIQUE, e.g., 'CN-84920')", False, False),
        ("purchased_at", "TEXT (ISO Timestamp)", False, False),
    ]
    y_pos = 36
    for name, dtype, is_pk, is_fk in sells_fields:
        prefix = "PK " if is_pk else ("FK " if is_fk else "   ")
        color = "#4C1D95" if (is_pk or is_fk) else "#334155"
        weight = "bold" if (is_pk or is_fk) else "normal"
        ax.text(34, y_pos, f"{prefix}{name}", fontsize=8.5, fontweight=weight, color=color)
        ax.text(66, y_pos, dtype, fontsize=7.5, color='#64748B', ha='right')
        y_pos -= 4.8

    ax.annotate('', xy=(69, 70), xytext=(31, 70),
                arrowprops=dict(arrowstyle="-|>", color='#1D4ED8', lw=2, mutation_scale=15))
    ax.text(50, 72.5, "1 : N (Hosts Events)", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#1D4ED8')

    ax.annotate('', xy=(32, 28), xytext=(17.5, 42),
                arrowprops=dict(arrowstyle="-|>", color='#6D28D9', lw=2, mutation_scale=15, connectionstyle="arc3,rad=0.2"))
    ax.text(18, 30, "1 : N (Purchases)", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#6D28D9')

    ax.annotate('', xy=(68, 28), xytext=(82.5, 32),
                arrowprops=dict(arrowstyle="-|>", color='#047857', lw=2, mutation_scale=15, connectionstyle="arc3,rad=-0.2"))
    ax.text(82, 26, "1 : N (Issues Passes)", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#047857')

    plt.tight_layout()
    plt.savefig("report_assets/fig4_database_er_diagram.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("[+] Generated Figure 4: Database ER Diagram")

# -------------------------------------------------------------
# 5. Server Health & Telemetry Architecture Diagram
# -------------------------------------------------------------
def generate_telemetry_diagram():
    fig, ax = plt.subplots(figsize=(11, 6.5), dpi=300)
    ax.set_facecolor('#F8FAFC')
    fig.patch.set_facecolor('#FFFFFF')
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.text(50, 96, "AuraPass — Administrative Telemetry & System Health Probe Architecture", 
            ha='center', va='center', fontsize=15, fontweight='bold', color='#0F172A')
    ax.text(50, 92, "Non-Invasive, High-Frequency Telemetry Pipeline via Python Standard Library & psutil", 
            ha='center', va='center', fontsize=9.5, color='#64748B')

    probes = [
        ("Processor & Kernel Probe\n• psutil.cpu_percent()\n• os.cpu_count() logical cores\n• Host architecture & model", 5, 66, 27, 18, '#F0FDF4', '#86EFAC', '#166534'),
        ("Memory Footprint Probe\n• Total RAM vs Used RAM (%)\n• psutil.virtual_memory()\n• Web Process RSS footprint (MB)", 5, 43, 27, 18, '#EFF6FF', '#93C5FD', '#1E40AF'),
        ("Storage & Volume Headroom\n• shutil.disk_usage('.')\n• Total GB, Used GB, Free GB\n• Volume capacity utilization %", 5, 20, 27, 18, '#FEF3C7', '#FCD34D', '#92400E'),
        ("Database Engine Diagnostics\n• time.perf_counter() Ping latency\n• SQLite file byte size (KB/MB)\n• Live row density counters", 5, -3, 27, 18, '#F5F3FF', '#C4B5FD', '#5B21B6')
    ]

    for title, x, y, w, h, bg, border, tc in probes:
        p = patches.FancyBboxPatch((x, y + 5), w, h, boxstyle="round,pad=0.5,rounding_size=0.8",
                                   facecolor=bg, edgecolor=border, linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + w/2, y + 5 + h/2, title, ha='center', va='center', fontsize=8.2, color=tc, multialignment='center')

    p_agg = patches.FancyBboxPatch((40, 26), 22, 54, boxstyle="round,pad=0.8,rounding_size=1.2",
                                   facecolor='#0F172A', edgecolor='#334155', linewidth=1.5)
    ax.add_patch(p_agg)
    ax.text(51, 74, "TELEMETRY ENGINE\nget_server_health_metrics()", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#38BDF8')
    agg_text = "Aggregation Pipeline:\n\n1. Executes SELECT 1 ping\n   (measures roundtrip ms)\n2. Reads virtual memory stats\n3. Computes disk headroom\n4. Formats server uptime\n   (days, hrs, mins, secs)\n5. Evaluates threshold logic:\n   • Latency > 200ms?\n   • CPU > 90%?\n   • Disk > 95%?\n   => 'healthy' vs 'degraded'"
    ax.text(51, 48, agg_text, ha='center', va='center', fontsize=7.8, color='#E2E8F0')

    for y_src in [75, 52, 29, 11]:
        ax.annotate('', xy=(40, 53), xytext=(32, y_src),
                    arrowprops=dict(arrowstyle="->", color='#64748B', lw=1.5, connectionstyle="arc3,rad=0.1"))

    rect_out = patches.FancyBboxPatch((70, 26), 26, 54, boxstyle="round,pad=0.8,rounding_size=1.2",
                                      facecolor='#F8FAFC', edgecolor='#0284C7', linewidth=1.5)
    ax.add_patch(rect_out)
    ax.text(83, 74, "CONSUMER SURFACES", ha='center', va='center', fontsize=10, fontweight='bold', color='#0369A1')
    out_text = "FastAPI Admin Endpoints:\n• GET /api/admin/server-health\n• GET /api/admin/analytics\n\nAdmin UI Visualizations:\n• Live Gauge: CPU Utilization %\n• Radial Meter: RAM Occupancy\n• Bar: Disk Headroom Free/Used\n• Ping Badge: Sub-millisecond\n  database query response\n• Real-time Uptime counter"
    ax.text(83, 49, out_text, ha='center', va='center', fontsize=8.0, color='#0F172A')

    ax.annotate('', xy=(70, 53), xytext=(62, 53),
                arrowprops=dict(arrowstyle="simple,head_width=2.5,head_length=3", facecolor='#0284C7', edgecolor='none'))

    plt.tight_layout()
    plt.savefig("report_assets/fig5_telemetry_architecture.png", dpi=300, bbox_inches='tight')
    plt.close()
    print("[+] Generated Figure 5: Telemetry Architecture Diagram")

if __name__ == "__main__":
    generate_architecture_diagram()
    generate_concurrency_diagram()
    generate_pricing_diagram()
    generate_er_diagram()
    generate_telemetry_diagram()
    print("[*] All 5 diagrams generated successfully!")
