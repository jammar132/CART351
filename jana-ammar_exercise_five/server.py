from flask import Flask, render_template
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os
import random
import certifi

# -------------------- helper arrays --------------------
days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
weather = ['stormy','raining','sunny','cloudy','clear','snowing','grey','fog']
moods = ['happy','sad','angry','neutral','calm','anxious','serene','moody','well','hurt']

event_names = [
    'walking in a forest','swimming in the ocean','dining with sibling',
    'taking a nap with a cat','watching rain fall though the window',
    'reading a comic','baking a chocolate cake','rollerskating',
    'planting roses','chomping on carrots','whistling in the wind',
    'walking through a dark tunnel','sunbathing in the desert',
    'visitng a parent for an afternoon',
    'learning a new programming language','running up stairs'
]

positive_moods = ['happy','neutral','calm','serene','well']
negative_moods = ['sad','angry','neutral','calm','anxious','moody','hurt']

# -------------------- app + db setup --------------------
load_dotenv()

app = Flask(__name__)

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise RuntimeError("MONGO_URI not found in .env")

app.config["MONGO_URI"] = mongo_uri
mongo = PyMongo(app, tlsCAFile=certifi.where())

# -------------------- routes --------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/insertPage")
def insertPage():
    return render_template("insertPage.html")

@app.route("/insertData")
def insertData():
    data = []
    for i in range(1000):
        entry = {
            "dataId": i + 1,
            "day": random.choice(days),
            "weather": random.choice(weather),
            "start_mood": random.choice(moods),
            "after_mood": random.choice(moods),
            "after_mood_strength": random.randrange(1, 11),
            "event_affect_strength": random.randrange(1, 11),
            "event_name": random.choice(event_names)
        }
        data.append(entry)

    try:
        mongo.db.dataStuff.insert_many(data)
        return {"inserted": "success"}
    except Exception as e:
        return {"inserted": "fail", "error": str(e)}, 500

@app.route("/debugView")
def debugView():
    return render_template("debugView.html")

@app.route("/niceView")
def niceView():
    return render_template("niceView.html")

# -------------------- base queries --------------------
@app.route("/one")
def one():
    results = mongo.db.dataStuff.find().sort("after_mood", 1)
    return {"results": results, "moods": moods}

@app.route("/two")
def two():
    results = mongo.db.dataStuff.find().sort("weather", 1)
    return {"results": results, "events": event_names}

# -------------------- REQUIRED EXERCISE QUERIES --------------------
@app.route("/three")
def three():
    results = mongo.db.dataStuff.find(
        {"after_mood": {"$in": positive_moods}}
    )
    return {"results": results, "positive_moods": positive_moods}

@app.route("/four")
def four():
    results = mongo.db.dataStuff.find().sort("event_name", 1)
    return {"results": results, "events": event_names}

@app.route("/five")
def five():
    results = mongo.db.dataStuff.find(
        {"day": {"$in": ["Monday", "Tuesday"]}}
    ).sort("event_affect_strength", 1)
    return {"results": results, "days": ["Monday", "Tuesday"]}

@app.route("/six")
def six():
    results = mongo.db.dataStuff.find(
        {
            "start_mood": {"$in": negative_moods},
            "after_mood": {"$in": negative_moods}
        }
    ).sort("weather", 1)
    return {"results": results, "weather": weather}

# -------------------- run --------------------
if __name__ == "__main__":
    app.run(debug=True)