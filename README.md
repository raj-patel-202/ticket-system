# AuraPass Ticketing Platform

A full-stack event ticketing platform featuring interactive seat maps, dynamic milestone pricing, role-based workflows for attendees and organizers, and an administrative control center with server telemetry.

---

## System Overview

### Architecture
- **Backend**: FastAPI (Python 3.10+), SQLite 3 with WAL journal mode, Uvicorn ASGI server.
- **Authentication**: JWT access tokens stored in HTTP-only cookies, salted password hashing via Bcrypt.
- **Frontend**: Single Page Application (SPA) using React 18, React Router 6, and Vanilla CSS with a glassmorphism design system.
- **Pricing Engine**: Dynamic pricing curve that adjusts ticket costs in real-time based on capacity milestones, demand velocity, and time to event.

### User Roles and Permissions
1. **Attendee (buyer)**:
   - Browse upcoming events and filter by genre (concert, theater, sport).
   - View dynamic pricing and seat availability.
   - Select seats via an interactive seating layout.
   - Purchase tickets and view digital passes with admission details.
2. **Event Organizer (organizer)**:
   - Host new events with custom capacities, venue details, and base ticket prices.
   - Track live ticket sales, capacity occupancy percentages, and event revenue.
   - Review recent transaction logs.
3. **Administrator (admin)**:
   - Account provisioning restricted to the CLI tool (`create_admin.py`).
   - Platform-wide overview of gross revenue, tickets sold, and active events.
   - User account directory with role-based filtering and search.
   - Attendee purchase history with individual ticket records (codes, seats, price, timestamp).
   - Event organizer registry with hosted event capacity meters and sales performance.
   - Real-time server telemetry: CPU usage percentage, RAM utilization, disk headroom, database query latency ping, and runtime host specifications.

---

## Project Structure

```text
ticketing_platform/
├── create_admin.py         # Administrator account provisioning CLI tool
├── main.py                 # FastAPI application entry point and lifespan handler
├── requirements.txt        # Python package dependencies
├── run_server.bat          # Windows batch script to launch the development server
├── .env.example            # Environment configuration template
├── .gitignore              # Git ignore rules
├── database/
│   └── core.py             # SQLite schema definition and initial data seeding
├── models/
│   └── schemas.py          # Pydantic data validation schemas
├── routes/
│   ├── api_admin.py        # Administrative endpoints and telemetry handlers
│   ├── api_auth.py         # Authentication and session management
│   ├── api_events.py       # Event catalog, seat availability, and pricing
│   ├── api_organizer.py    # Organizer dashboard data
│   └── api_tickets.py      # Ticket purchasing and user ticket passes
├── static/
│   ├── index.html          # SPA HTML entry point
│   ├── css/
│   │   ├── admin.css       # Admin console and dashboard styling
│   │   ├── seat_map.css    # Interactive seating map styles
│   │   ├── theme.css       # Core typography, glass panels, and button styles
│   │   └── tickets.css     # Digital ticket pass layout
│   └── js/
│       ├── app.js          # Client configuration helpers
│       ├── seat_map.js     # Seating layout interaction logic
│       └── react/
│           ├── App.js      # React Router configuration and layout
│           ├── components/ # Shared UI components (Navbar, etc.)
│           ├── context/    # Authentication context provider
│           └── pages/      # Route pages (Home, Login, Register, Admin, etc.)
└── utils/
    ├── auth.py             # JWT token helpers and role requirement dependencies
    ├── config.py           # Application settings loaded from environment
    └── pricing.py          # Dynamic pricing calculation algorithm
```

---

## Getting Started

### Prerequisites
- Python 3.10 or higher
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ticketing_platform
```

### 2. Create and Activate a Virtual Environment

On Windows (PowerShell / Command Prompt):
```bash
python -m venv .venv
.venv\Scripts\activate
```

On macOS / Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy the template configuration file:

On Windows:
```cmd
copy .env.example .env
```

On macOS / Linux:
```bash
cp .env.example .env
```

Review the values in `.env`:
```ini
SECRET_KEY=replace_with_a_secure_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DB_PATH=ticketing.db
ENVIRONMENT=development
HOST=127.0.0.1
PORT=8000
```

---

## Running the Server

Start the application with Uvicorn:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Alternatively, run directly with Python:
```bash
python main.py
```

On Windows, you can also run:
```cmd
run_server.bat
```

Once started, open your browser and navigate to:
```text
http://127.0.0.1:8000
```

On first startup, SQLite database tables and default sample events are seeded automatically.

---

## Default Demo Accounts

The database seeds with the following test credentials:

| Role | Username | Password |
| :--- | :--- | :--- |
| Administrator | admin | admin123 |
| Event Organizer | organizer1 | secret123 |
| Event Organizer | stadium_ops | secret123 |
| Attendee | buyer1 | secret123 |
| Attendee | elena_k | secret123 |

---

## Administrator Account Management

To enforce security, administrator accounts cannot be registered through public web forms. They are created or promoted exclusively via the command-line interface.

### Interactive Creation
Run without arguments to be prompted for username, email, and masked password:
```bash
python create_admin.py
```

### Command-Line Flag Creation
```bash
python create_admin.py --username admin_user --email admin@example.com --password YourSecurePassword
```

### Listing Existing Administrators
```bash
python create_admin.py --list
```

If an account with the specified username or email already exists, the utility promotes the existing user to the administrator role and updates the password.

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new attendee or organizer account.
- `POST /api/auth/login` - Sign in and receive a secure session cookie.
- `POST /api/auth/logout` - Clear the session cookie.
- `GET /api/auth/me` - Retrieve current user profile.

### Events (`/api/events`)
- `GET /api/events` - List active events with dynamic pricing.
- `GET /api/events/{id}` - Retrieve details for a specific event.
- `POST /api/events` - Create a new event (Organizer role required).
- `GET /api/events/{id}/seats` - Get seat availability and reservation status.
- `GET /api/events/{id}/pricing` - Get pricing tier breakdown and current price.

### Tickets (`/api/tickets`)
- `POST /api/tickets/buy` - Purchase tickets for selected seat positions.
- `GET /api/tickets/my-tickets` - List purchased tickets for the logged-in attendee.

### Organizer (`/api/organizer`)
- `GET /api/organizer/dashboard` - Retrieve organizer event roster and sales revenue metrics.

### Administration (`/api/admin`)
- `GET /api/admin/analytics` - Platform overview metrics and category breakdown.
- `GET /api/admin/users` - Directory of all user accounts and activity summaries.
- `GET /api/admin/buyers` - Attendee accounts with detailed ticket purchase logs.
- `GET /api/admin/buyers/{id}/tickets` - Ticket logs for a specific attendee.
- `GET /api/admin/organizers` - Organizer accounts with hosted events and revenue.
- `GET /api/admin/organizers/{id}/events` - Hosted events for a specific organizer.
- `GET /api/admin/server-health` - Real-time system load, CPU, RAM, disk, and database ping metrics.

---

## License

This project is licensed under the MIT License.
