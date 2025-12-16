from flask import Flask, render_template, request, jsonify, make_response
from dotenv import load_dotenv
from pymongo import MongoClient, DESCENDING
from bson.objectid import ObjectId
from datetime import datetime, timezone
import os
import certifi
import secrets

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET", "dev")

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("Missing MONGO_URI in .env")

# Use certifi CA bundle to avoid SSL CERTIFICATE_VERIFY_FAILED on macOS
client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client.get_database()  # picks DB from URI 
posts_col = db["posts"]

EMOTIONS = [
    "happy", "sad", "angry", "love", "excited", "anxious",
    "grief", "nostalgic", "lonely", "relief", "confused", "other"
]

# same-ish palette grid vibe (you can change)
PALETTE = [
    "#000000", "#4b4b4b", "#8a8a8a", "#ffffff",
    "#f2a23a", "#f0ef6a", "#e7e0c8", "#9a6a3a",
    "#b7c5c7", "#6f8f95", "#b6d4ef", "#48d3ff",
    "#6b2bd1", "#9a6bff", "#8e8ea8", "#d7d7e8",
    "#6a0000", "#ff1b1b", "#ff8a2a", "#ffb39b",
    "#4e5a43", "#0b5c00", "#37d629", "#b7ffb8",
    "#0032ff", "#083b7a", "#5a2b39", "#2c1234",
    "#f4d7df", "#ff78d6", "#ff3db8", "#f7cfa3",
]

TEXT_COLORS = {"black", "white"}

def _get_or_set_delete_token():
    """
    One token per browser session (stored in cookie).
    Posts created from this browser get this token saved.
    Only same-token can delete.
    """
    token = request.cookies.get("remains_token")
    if not token:
        token = secrets.token_urlsafe(24)
    return token


@app.route("/", methods=["GET"])
def index():
    token = _get_or_set_delete_token()

    resp = make_response(render_template(
        "index.html",
        emotions=EMOTIONS,
        palette=PALETTE
    ))
    # refresh cookie every load 
    resp.set_cookie("remains_token", token, max_age=60*60*24*365, samesite="Lax")
    return resp


@app.route("/api/posts", methods=["GET"])
def api_posts():
    q = (request.args.get("q") or "").strip()
    emotion = (request.args.get("emotion") or "").strip()
    limit = min(int(request.args.get("limit", 200)), 500)

    query = {}
    if emotion and emotion.lower() != "all":
        query["emotion"] = emotion.lower()

    if q:
        # search in "to" + "message"
        query["$or"] = [
            {"to": {"$regex": q, "$options": "i"}},
            {"message": {"$regex": q, "$options": "i"}},
        ]

    cursor = posts_col.find(query).sort("created_at", DESCENDING).limit(limit)

    token = request.cookies.get("remains_token") or ""
    out = []
    for p in cursor:
        out.append({
            "id": str(p["_id"]),
            "to": p.get("to", ""),
            "message": p.get("message", ""),
            "emotion": p.get("emotion", "other"),
            "color": p.get("color", "#ffffff"),
            "text_color": p.get("text_color", "black"),
            "can_delete": (p.get("delete_token") == token)
        })
    return jsonify(out)


@app.route("/api/posts", methods=["POST"])
def api_create_post():
    data = request.get_json(force=True) or {}

    to = (data.get("to") or "").strip()
    message = (data.get("message") or "").strip()
    emotion = (data.get("emotion") or "other").strip().lower()
    color = (data.get("color") or "#ffffff").strip()
    text_color = (data.get("text_color") or "black").strip().lower()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    if emotion not in EMOTIONS:
        emotion = "other"

    if color not in PALETTE:
        color = "#ffffff"

    # force rules for black/white cards
    if color == "#000000":
        text_color = "white"
    elif color == "#ffffff":
        text_color = "black"
    else:
        if text_color not in TEXT_COLORS:
            text_color = "black"

    token = _get_or_set_delete_token()

    doc = {
        "to": to if to else " ",
        "message": message,
        "emotion": emotion,
        "color": color,
        "text_color": text_color,
        "created_at": datetime.now(timezone.utc),
        "delete_token": token,
    }
    res = posts_col.insert_one(doc)

    resp = jsonify({"ok": True, "id": str(res.inserted_id)})
    resp.set_cookie("remains_token", token, max_age=60*60*24*365, samesite="Lax")
    return resp


@app.route("/api/posts/<post_id>", methods=["DELETE"])
def api_delete_post(post_id):
    token = request.cookies.get("remains_token") or ""
    if not token:
        return jsonify({"error": "Not allowed"}), 403

    try:
        oid = ObjectId(post_id)
    except Exception:
        return jsonify({"error": "Bad id"}), 400

    deleted = posts_col.delete_one({"_id": oid, "delete_token": token})
    if deleted.deleted_count == 0:
        return jsonify({"error": "Not allowed"}), 403

    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True)