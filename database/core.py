import sqlite3
from datetime import datetime, timezone, timedelta
import bcrypt
from utils.config import settings

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def get_db_connection():
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
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
        subtitle TEXT DEFAULT '',
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (u_id) ON DELETE CASCADE
    );
    """)

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
    if cursor.fetchone()["count"] > 0:
        conn.close()
        return  # Already seeded

    now = datetime.now(timezone.utc)
    one_week_ago = (now - timedelta(days=7)).isoformat()
    three_days_ago = (now - timedelta(days=3)).isoformat()
    event_time_1 = (now + timedelta(days=42, hours=5)).isoformat()
    event_time_2 = (now + timedelta(days=6, hours=2)).isoformat()
    event_time_3 = (now + timedelta(days=21, hours=3)).isoformat()
    event_time_4 = (now + timedelta(days=75, hours=4)).isoformat()

    # Default passwords
    admin_pw = hash_password("admin123")
    user_pw = hash_password("secret123")

    # 1. Seed Users
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

    # 2. Seed Events
    events_data = [
        (
            2, # organizer1
            "Neon Skyline",
            "concert",
            "Riverside Arena, Austin TX",
            event_time_1,
            800,
            416, # 52% sold -> Milestone 1 Active
            89.00,
            "Wavelength World Tour · Special guest Halo Static",
            "active",
            one_week_ago
        ),
        (
            2, # organizer1
            "Last Light Over Kestrel Bay",
            "theater",
            "Kestrel Cinemas, Hall 4",
            event_time_2,
            210,
            80, # 38% sold -> Standard Base Price
            14.50,
            "7:45 PM screening · Hall 4, Dolby Atmos",
            "active",
            three_days_ago
        ),
        (
            3, # stadium_ops
            "Ironclad FC vs Meridian United",
            "sport",
            "Union Stadium, Chicago IL",
            event_time_3,
            900,
            576, # 64% sold -> Milestone 1 Active
            62.00,
            "League Championship · Matchday 14",
            "active",
            one_week_ago
        ),
        (
            2, # organizer1
            "The Gilded Hour",
            "theater",
            "Lyric Playhouse, New York NY",
            event_time_4,
            180,
            166, # 92% sold -> Tier 2 Milestone Surge
            145.00,
            "A new play in two acts · Lyric Playhouse Company",
            "active",
            one_week_ago
        )
    ]
    cursor.executemany("""
        INSERT INTO events (
            user_id, event_name, event_type, venue, time, capacity, sold_tickets,
            price_per_ticket, subtitle, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, events_data)

    # 3. Seed Initial Purchases for buyer1
    sells_data = [
        (4, 1, 89.00, "GA · Tier Floor", "CN-88213", three_days_ago),
        (4, 4, 145.00, "Orchestra Row F · Seat 12", "TH-40217", three_days_ago),
        (4, 3, 62.00, "Sec C · Row 2 · Seat 8", "SP-70951", three_days_ago),
        (5, 1, 89.00, "GA · Tier Floor", "CN-88214", three_days_ago),
        (5, 2, 14.50, "Hall 4 · Row D · Seat 7", "CM-51032", three_days_ago)
    ]
    cursor.executemany("""
        INSERT INTO sells (
            user_id, event_id, selling_price, position_of_seat, ticket_code, purchased_at
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, sells_data)

    conn.commit()
    conn.close()
