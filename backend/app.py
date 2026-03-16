import json
import os
import uuid
from datetime import datetime, date

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from database import get_connection, init_db

# Serve React build from ../dist
DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="")
CORS(app)


# ── Helpers ──────────────────────────────────────────────────────────────────

def row_to_dict(row):
    """Convert a sqlite3.Row to a plain dict."""
    return dict(row) if row else None


def rows_to_list(rows):
    """Convert a list of sqlite3.Row to a list of dicts."""
    return [dict(r) for r in rows]


def habit_row_to_json(row):
    """Convert a habit DB row to the JSON shape the frontend expects."""
    d = row_to_dict(row)
    if d is None:
        return None
    return {
        "id": d["id"],
        "name": d["name"],
        "emoji": d["emoji"],
        "description": d["description"],
        "color": d["color"],
        "frequency": d["frequency"],
        "createdAt": d["created_at"],
        "archivedAt": d["archived_at"],
    }


def plant_row_to_json(row):
    d = row_to_dict(row)
    if d is None:
        return None
    return {
        "habitId": d["habit_id"],
        "stage": d["stage"],
        "growthPoints": d["growth_points"],
        "currentStreak": d["current_streak"],
        "longestStreak": d["longest_streak"],
        "lastCompletedDate": d["last_completed_date"],
    }


def completion_row_to_json(row):
    d = row_to_dict(row)
    if d is None:
        return None
    return {
        "habitId": d["habit_id"],
        "date": d["date"],
        "completedAt": d["completed_at"],
    }


# ── Growth logic (mirrors frontend utils) ───────────────────────────────────

STAGE_THRESHOLDS = {0: 0, 1: 5, 2: 15, 3: 35, 4: 70, 5: 120, 6: 200}


def calculate_growth_stage(points):
    stage = 0
    for s in range(6, -1, -1):
        if points >= STAGE_THRESHOLDS[s]:
            stage = s
            break
    return stage


def get_streak_multiplier(streak):
    if streak >= 60:
        return 4
    if streak >= 30:
        return 3
    if streak >= 14:
        return 2.5
    if streak >= 7:
        return 2
    if streak >= 3:
        return 1.5
    return 1


def calculate_streak(completions_dates, frequency, custom_days=None):
    """Calculate current and longest streak from a sorted list of date strings."""
    if not completions_dates:
        return {"current": 0, "longest": 0}

    date_set = set(completions_dates)
    today = date.today()

    def should_track(d):
        weekday = d.weekday()  # Mon=0 ... Sun=6
        # Convert to JS-style: Sun=0 ... Sat=6
        js_day = (weekday + 1) % 7
        if frequency == "daily":
            return True
        if frequency == "weekdays":
            return js_day >= 1 and js_day <= 5
        if frequency == "weekends":
            return js_day == 0 or js_day == 6
        if frequency == "custom" and custom_days is not None:
            return js_day in custom_days
        return True

    # Current streak: walk back from today
    current = 0
    d = today
    from datetime import timedelta
    while True:
        d_str = d.isoformat()
        if should_track(d):
            if d_str in date_set:
                current += 1
            else:
                break
        d -= timedelta(days=1)
        if d < today - timedelta(days=365):
            break

    # Longest streak: scan all dates
    sorted_dates = sorted(date_set)
    longest = 0
    run = 0
    if sorted_dates:
        all_days = []
        start = date.fromisoformat(sorted_dates[0])
        end = date.fromisoformat(sorted_dates[-1])
        d = start
        while d <= end:
            d_str = d.isoformat()
            if should_track(d):
                if d_str in date_set:
                    run += 1
                    longest = max(longest, run)
                else:
                    run = 0
            d += timedelta(days=1)

    longest = max(longest, current)
    return {"current": current, "longest": longest}


# ── HABITS ───────────────────────────────────────────────────────────────────

@app.route("/api/habits", methods=["GET"])
def get_habits():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at"
    ).fetchall()
    conn.close()
    return jsonify([habit_row_to_json(r) for r in rows])


@app.route("/api/habits", methods=["POST"])
def create_habit():
    data = request.json
    habit_id = str(uuid.uuid4())
    now = datetime.now().isoformat()

    conn = get_connection()
    conn.execute(
        """INSERT INTO habits (id, name, emoji, description, color, frequency, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (habit_id, data["name"], data["emoji"], data.get("description"),
         data["color"], data["frequency"], now),
    )
    conn.execute(
        """INSERT INTO plant_states (habit_id, stage, growth_points, current_streak, longest_streak)
           VALUES (?, 0, 0, 0, 0)""",
        (habit_id,),
    )
    if data["frequency"] == "custom" and data.get("customDays"):
        conn.execute(
            "INSERT INTO custom_frequencies (habit_id, days) VALUES (?, ?)",
            (habit_id, json.dumps(data["customDays"])),
        )
    conn.commit()

    habit = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
    conn.close()
    return jsonify(habit_row_to_json(habit)), 201


@app.route("/api/habits/<habit_id>", methods=["PUT"])
def update_habit(habit_id):
    data = request.json
    conn = get_connection()

    sets = []
    params = []
    for field in ["name", "emoji", "description", "color", "frequency"]:
        if field in data:
            sets.append(f"{field} = ?")
            params.append(data[field])
    if sets:
        params.append(habit_id)
        conn.execute(f"UPDATE habits SET {', '.join(sets)} WHERE id = ?", params)
        conn.commit()

    habit = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
    conn.close()
    return jsonify(habit_row_to_json(habit))


@app.route("/api/habits/<habit_id>/archive", methods=["POST"])
def archive_habit(habit_id):
    now = datetime.now().isoformat()
    conn = get_connection()
    conn.execute("UPDATE habits SET archived_at = ? WHERE id = ?", (now, habit_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True})


# ── COMPLETIONS ──────────────────────────────────────────────────────────────

@app.route("/api/completions", methods=["GET"])
def get_completions():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM completions ORDER BY date DESC").fetchall()
    conn.close()
    return jsonify([completion_row_to_json(r) for r in rows])


@app.route("/api/completions/toggle", methods=["POST"])
def toggle_completion():
    """Toggle a completion for a habit on a given date. Returns growth info."""
    data = request.json
    habit_id = data["habitId"]
    target_date = data.get("date", date.today().isoformat())

    conn = get_connection()

    # Check if already completed
    existing = conn.execute(
        "SELECT id FROM completions WHERE habit_id = ? AND date = ?",
        (habit_id, target_date),
    ).fetchone()

    habit = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
    custom_freq_row = conn.execute(
        "SELECT days FROM custom_frequencies WHERE habit_id = ?", (habit_id,)
    ).fetchone()
    custom_days = json.loads(custom_freq_row["days"]) if custom_freq_row else None

    if existing:
        # Remove completion
        conn.execute("DELETE FROM completions WHERE id = ?", (existing["id"],))
        conn.commit()

        # Recalculate
        comp_rows = conn.execute(
            "SELECT date FROM completions WHERE habit_id = ?", (habit_id,)
        ).fetchall()
        comp_dates = [r["date"] for r in comp_rows]
        streak_info = calculate_streak(comp_dates, habit["frequency"], custom_days)

        plant = conn.execute(
            "SELECT * FROM plant_states WHERE habit_id = ?", (habit_id,)
        ).fetchone()
        new_points = max(0, plant["growth_points"] - 1)
        new_stage = calculate_growth_stage(new_points)
        last_date = comp_dates[0] if comp_dates else None
        # Get most recent date
        if comp_dates:
            last_date = max(comp_dates)

        conn.execute(
            """UPDATE plant_states
               SET growth_points = ?, stage = ?, current_streak = ?,
                   longest_streak = ?, last_completed_date = ?
               WHERE habit_id = ?""",
            (new_points, new_stage, streak_info["current"],
             streak_info["longest"], last_date, habit_id),
        )
        conn.commit()
        conn.close()
        return jsonify({"removed": True})

    # Add completion
    now = datetime.now().isoformat()
    conn.execute(
        "INSERT INTO completions (habit_id, date, completed_at) VALUES (?, ?, ?)",
        (habit_id, target_date, now),
    )
    conn.commit()

    # Recalculate streak and growth
    comp_rows = conn.execute(
        "SELECT date FROM completions WHERE habit_id = ?", (habit_id,)
    ).fetchall()
    comp_dates = [r["date"] for r in comp_rows]
    streak_info = calculate_streak(comp_dates, habit["frequency"], custom_days)

    multiplier = get_streak_multiplier(streak_info["current"])
    points_earned = round(1 * multiplier * 10) / 10

    plant = conn.execute(
        "SELECT * FROM plant_states WHERE habit_id = ?", (habit_id,)
    ).fetchone()
    old_stage = plant["stage"]
    new_points = plant["growth_points"] + points_earned
    new_stage = calculate_growth_stage(new_points)
    stage_changed = new_stage > old_stage

    conn.execute(
        """UPDATE plant_states
           SET growth_points = ?, stage = ?, current_streak = ?,
               longest_streak = ?, last_completed_date = ?
           WHERE habit_id = ?""",
        (new_points, new_stage, streak_info["current"],
         streak_info["longest"], target_date, habit_id),
    )
    conn.commit()
    conn.close()

    return jsonify({
        "removed": False,
        "pointsEarned": points_earned,
        "newStage": stage_changed,
        "multiplier": multiplier,
    })


# ── PLANT STATES ─────────────────────────────────────────────────────────────

@app.route("/api/plant-states", methods=["GET"])
def get_plant_states():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM plant_states").fetchall()
    conn.close()
    return jsonify([plant_row_to_json(r) for r in rows])


@app.route("/api/plant-states/<habit_id>", methods=["GET"])
def get_plant_state(habit_id):
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM plant_states WHERE habit_id = ?", (habit_id,)
    ).fetchone()
    conn.close()
    if row:
        return jsonify(plant_row_to_json(row))
    return jsonify({
        "habitId": habit_id, "stage": 0, "growthPoints": 0,
        "currentStreak": 0, "longestStreak": 0, "lastCompletedDate": None,
    })


# ── SETTINGS ─────────────────────────────────────────────────────────────────

@app.route("/api/settings", methods=["GET"])
def get_settings():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM settings").fetchall()
    conn.close()
    return jsonify({r["key"]: r["value"] for r in rows})


@app.route("/api/settings", methods=["PUT"])
def update_settings():
    data = request.json
    conn = get_connection()
    for key, value in data.items():
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, value),
        )
    conn.commit()
    conn.close()
    return jsonify({"success": True})


# ── FULL STATE (for export/import/reset) ─────────────────────────────────────

@app.route("/api/state", methods=["GET"])
def get_full_state():
    """Get the full app state (for export or initial load)."""
    conn = get_connection()
    habits = conn.execute("SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at").fetchall()
    completions = conn.execute("SELECT * FROM completions ORDER BY date DESC").fetchall()
    plant_states = conn.execute("SELECT * FROM plant_states").fetchall()
    custom_freqs = conn.execute("SELECT * FROM custom_frequencies").fetchall()
    settings = conn.execute("SELECT * FROM settings").fetchall()
    conn.close()

    return jsonify({
        "habits": [habit_row_to_json(r) for r in habits],
        "completions": [completion_row_to_json(r) for r in completions],
        "plantStates": [plant_row_to_json(r) for r in plant_states],
        "customFrequencies": [
            {"habitId": r["habit_id"], "days": json.loads(r["days"])}
            for r in custom_freqs
        ],
        "settings": {r["key"]: r["value"] for r in settings},
    })


@app.route("/api/state/reset", methods=["POST"])
def reset_state():
    """Delete all data and reinitialize."""
    conn = get_connection()
    conn.executescript("""
        DELETE FROM completions;
        DELETE FROM plant_states;
        DELETE FROM custom_frequencies;
        DELETE FROM habits;
        DELETE FROM settings;
        INSERT INTO settings (key, value) VALUES ('theme', 'system');
    """)
    conn.commit()
    conn.close()
    return jsonify({"success": True})


# ── Serve React frontend ─────────────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve React build files. API routes are matched first by Flask."""
    file_path = os.path.join(DIST_DIR, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


# ── Initialize DB on import (for production) ────────────────────────────────

init_db()

# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"Server starting on http://localhost:{port}")
    app.run(debug=True, host="0.0.0.0", port=port)
