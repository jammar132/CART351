from flask import Flask, render_template, request, jsonify
import os, json
from datetime import datetime

app = Flask(__name__)

# ---- file upload config ----
UPLOAD_FOLDER = 'static/uploads'  # Or os.path.join(app.instance_path, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

#*************************************************
#Task: CAPTURE & POST & FETCH & SAVE

@app.route("/")
def index():
    entries = []
    path = os.path.join(app.root_path, "files", "data.txt")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                item = {}
                for part in line.split("\t"):
                    if "=" in part:
                        k, v = part.split("=", 1)
                        item[k] = v
                if item:
                    entries.append(item)
    # newest first
    entries = entries[-20:][::-1]
    return render_template("index.html", entries=entries)

@app.route("/t2")
def t2():
    return render_template("t2.html")

@app.route("/postDataFetch", methods=['POST'])
def postDataFetch():
    payload = request.get_json(silent=True) or request.form.to_dict()
    files_dir = os.path.join(app.root_path, "files")
    os.makedirs(files_dir, exist_ok=True)
    out_path = os.path.join(files_dir, "data.txt")

    # add timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    line = (
        f"time={timestamp}\t"
        f"quadrant={payload.get('quadrant','')}\t"
        f"emotion={payload.get('emotion','')}\t"
        f"user={payload.get('username','')}\t"
        f"journal={payload.get('journal','')}\n"
    )

    with open(out_path, "a", encoding="utf-8") as f:
        f.write(line)

    return jsonify({"ok": True, "message": f"Saved at {timestamp}"}), 200

# *************************************************

# run
if __name__ == "__main__":
    app.run(debug=True)