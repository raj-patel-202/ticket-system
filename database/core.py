import sqlite3
from datetime import datetime, timezone, timedelta
import bcrypt
from pathlib import Path
from utils.config import settings

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def get_db_connection():
    db_file = Path(settings.DB_PATH)
    db_file.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_file), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        u_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL CHECK(user_type IN ('admin', 'buyer', 'organizer')),
        created_at TEXT NOT NULL
    );
    """)

    # Events Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_name TEXT NOT NULL,
        event_type TEXT NOT NULL CHECK(event_type IN ('concert', 'theater', 'sport')),
        venue TEXT NOT NULL,
        time TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        sold_tickets INTEGER NOT NULL DEFAULT 0,
        price_per_ticket REAL NOT NULL,
        offer_percent REAL DEFAULT 0.0,
        subtitle TEXT DEFAULT '',
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (u_id) ON DELETE CASCADE
    );
    """)

    # Migration check: add offer_percent column if table already exists without it
    cursor.execute("PRAGMA table_info(events);")
    columns = [col[1] for col in cursor.fetchall()]
    if "offer_percent" not in columns:
        cursor.execute("ALTER TABLE events ADD COLUMN offer_percent REAL DEFAULT 0.0;")

    # Sells Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sells (
        sell_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        selling_price REAL NOT NULL,
        position_of_seat TEXT NOT NULL,
        ticket_code TEXT UNIQUE NOT NULL,
        purchased_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (u_id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()

def seed_default_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] == 0:
        now = datetime.now(timezone.utc)
        one_week_ago = (now - timedelta(days=7)).isoformat()
        three_days_ago = (now - timedelta(days=3)).isoformat()

        # Default passwords
        admin_pw = hash_password("admin123")
        user_pw = hash_password("secret123")

        # Seed Default User Accounts
        users_data = [
            ("admin", "admin@ticketing.local", admin_pw, "admin", one_week_ago),
            ("organizer1", "eo@soundwave.io", user_pw, "organizer", one_week_ago),
            ("stadium_ops", "events@chicago-stadium.com", user_pw, "organizer", one_week_ago),
            ("buyer1", "alex.morgan@gmail.com", user_pw, "buyer", three_days_ago),
            ("elena_k", "elena.k@domain.org", user_pw, "buyer", three_days_ago),
        ]
        cursor.executemany(
            "INSERT INTO users (username, email, password, user_type, created_at) VALUES (?, ?, ?, ?, ?)",
            users_data
        )

    # Seed Sample Events if empty
    cursor.execute("SELECT COUNT(*) as count FROM events")
    if cursor.fetchone()["count"] == 0:
        organizer_row = cursor.execute("SELECT u_id FROM users WHERE user_type = 'organizer' LIMIT 1").fetchone()
        if organizer_row:
            org_id = organizer_row["u_id"]
            now = datetime.now(timezone.utc)
            in_5_days = (now + timedelta(days=5)).replace(hour=20, minute=0, second=0).isoformat()
            in_12_days = (now + timedelta(days=12)).replace(hour=19, minute=30, second=0).isoformat()
            in_20_days = (now + timedelta(days=20)).replace(hour=18, minute=0, second=0).isoformat()
            posted_time = (now - timedelta(days=2)).isoformat()

            sample_events = [
                (org_id, "Cyberpunk Symphony: Neon Horizons", "concert", "Apex Arena, Austin TX", in_5_days, 80, 24, 65.0, 10.0, "Synthesizer Orchestra in Quadraphonic Surround Sound", "active", posted_time),
                (org_id, "The Phantom's Masquerade", "theater", "Grand Opera House, London", in_12_days, 48, 18, 85.0, 0.0, "Orchestral Drama & Live Stage Performance", "active", posted_time),
                (org_id, "National Championship: Titans vs Predators", "sport", "Metropolis Stadium, Bowl Arena", in_20_days, 96, 42, 110.0, 15.0, "Quarterfinal Playoff Championship Derby", "active", posted_time)
            ]
            cursor.executemany("""
                INSERT INTO events (
                    user_id, event_name, event_type, venue, time, capacity, sold_tickets,
                    price_per_ticket, offer_percent, subtitle, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, sample_events)

    conn.commit()
    conn.close()
