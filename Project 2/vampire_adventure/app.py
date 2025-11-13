from flask import Flask, render_template, request, jsonify
import json, os, uuid, datetime

app = Flask(__name__)

RAW_LOG_FILE = "logs.json" # all actions
BEST_SCORES_FILE = "game_logs.json"  # aggregated best scores for leaderboard

# JSON Helpers
def load_json(path):
    """Load a JSON file as a list; if missing/corrupt, return []."""
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_json(path, data):
    """Save a Python object to a JSON file."""
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# ROUTES
@app.route("/")
def index():
    # unique id per playthrough
    session_id = str(uuid.uuid4())
    return render_template("index.html", session_id=session_id)

@app.route("/log_action", methods=["POST"])
def log_action():
    """Append a single action entry to logs.json."""
    data = request.get_json(force=True)

    logs = load_json(RAW_LOG_FILE)

    # add server-side timestamp just for reference
    data["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"

    logs.append(data)
    save_json(RAW_LOG_FILE, logs)

    return jsonify({"status": "ok"})

@app.route("/leaderboard")
def leaderboard():
    """
    Aggregate logs by session and return the top 3 surviving runs.
    Also saves those top runs into game_logs.json as the 'best scores'.
    """
    logs = load_json(RAW_LOG_FILE)
    sessions = {}

    # ensure logs are in chronological order
    for entry in logs:
        sid = entry.get("session_id")
        if not sid:
            continue

        state = entry.get("state", {}) or {}
        cmd = entry.get("command", "") or ""
        time_left = entry.get("time_left_seconds", 0) or 0

        if sid not in sessions:
            sessions[sid] = {
                "session_id": sid,
                # totals over time (sum of positive changes)
                "total_coins": 0,
                "total_garlic": 0,
                "total_planks": 0,
                "total_nails": 0,
                "total_candles": 0,
                "total_charms": 0,

                "ready_time_left": None,
                "survived": False,
                "final_outcome": None,

                # for calculations
                "prev_state": {
                    "coins": 0,
                    "garlicHeads": 0,
                    "planks": 0,
                    "nails": 0,
                    "candles": 0,
                    "garlicCharms": 0,
                },
            }

        s = sessions[sid]
        prev = s["prev_state"]

        # current resource state
        coins = state.get("coins", 0)
        garlicHeads = state.get("garlicHeads", 0)
        planks = state.get("planks", 0)
        nails = state.get("nails", 0)
        candles = state.get("candles", 0)
        garlicCharms = state.get("garlicCharms", 0)

        # positive deltas = what was collected/crafted this step
        dc = max(0, coins - prev["coins"])
        dg = max(0, garlicHeads - prev["garlicHeads"])
        dp = max(0, planks - prev["planks"])
        dn = max(0, nails - prev["nails"])
        dca = max(0, candles - prev["candles"])
        dch = max(0, garlicCharms - prev["garlicCharms"])

        s["total_coins"] += dc
        s["total_garlic"] += dg
        s["total_planks"] += dp
        s["total_nails"] += dn
        s["total_candles"] += dca
        s["total_charms"] += dch

        # update prev_state for next step
        s["prev_state"] = {
            "coins": coins,
            "garlicHeads": garlicHeads,
            "planks": planks,
            "nails": nails,
            "candles": candles,
            "garlicCharms": garlicCharms,
        }

        # when they say they're ready at the house
        if cmd == "ready_for_sunset":
            s["ready_time_left"] = time_left

        # survived runs are the ones ending with a "survive_*" command
        if cmd.startswith("survive_"):
            s["survived"] = True
            s["final_outcome"] = cmd
            # if somehow they never pressed ready, treat this as their ready time
            if s["ready_time_left"] is None:
                s["ready_time_left"] = time_left

    # keep only successful runs
    survived_runs = [s for s in sessions.values() if s["survived"]]

    # sort by remaining time when ready (descending)
    def sort_key(run):
        return run["ready_time_left"] or 0

    survived_runs.sort(key=sort_key, reverse=True)

    top3 = survived_runs[:3]

    # save best scores snapshot into game_logs.json
    save_json(BEST_SCORES_FILE, top3)

    return jsonify({"top": top3})


if __name__ == "__main__":
    app.run(debug=True)