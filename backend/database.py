import sqlite3
import os

# Use /tmp on Render (or local dir for development)
DB_PATH = os.environ.get(
    "DATABASE_PATH",
    os.path.join(os.path.dirname(__file__), "seed_succeed.db"),
)


def get_connection():
    """Get a database connection with row_factory set to sqlite3.Row."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create all tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            emoji TEXT NOT NULL DEFAULT '🧘',
            description TEXT,
            color TEXT NOT NULL DEFAULT 'green',
            frequency TEXT NOT NULL DEFAULT 'daily',
            created_at TEXT NOT NULL,
            archived_at TEXT
        );

        CREATE TABLE IF NOT EXISTS completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id TEXT NOT NULL,
            date TEXT NOT NULL,
            completed_at TEXT NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
            UNIQUE(habit_id, date)
        );

        CREATE TABLE IF NOT EXISTS plant_states (
            habit_id TEXT PRIMARY KEY,
            stage INTEGER NOT NULL DEFAULT 0,
            growth_points REAL NOT NULL DEFAULT 0,
            current_streak INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            last_completed_date TEXT,
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS custom_frequencies (
            habit_id TEXT PRIMARY KEY,
            days TEXT NOT NULL,
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'system');
    """)

    conn.commit()
    conn.close()
