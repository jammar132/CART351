#conda activate ex2env
#python exercise-two.py
from flask import Flask,render_template,request
import os
app = Flask(__name__)

# the default route
@app.route("/")
def index():
      return render_template("index.html")

#*************************************************

# Task 2: Variables and JinJa Templates
@app.route("/t1")
def t1():
    the_topic = "donuts"
    number_of_donuts = 28
    donut_data = {
        "flavours": ["Regular", "Chocolate", "Blueberry", "Devil's Food"],
        "toppings": [
            "None", "Glazed", "Sugar", "Powdered Sugar",
            "Chocolate with Sprinkles", "Chocolate", "Maple"
        ]
    }
    icecream_flavors = ["Vanilla", "Raspberry", "Cherry", "Lemon"]
    
    img_files = [
      {"file": "donut_a.png", "caption": "Classic Choco Donut"},
      {"file": "donut_b.png", "caption": "Stuffed Chocolate Donut"},
      {"file": "donut_c.png", "caption": "Classic Orange Donut"},
      {"file": "donut_d.png", "caption": "Stuffed Orange Sprinkles"},
      {"file": "donut_e.png", "caption": "Classic Blueberry Sprinkles"},
      {"file": "donut_f.png", "caption": "Stuffed Blueberry Sprinkles"},
      {"file": "donut_pink.png", "caption": "Classic Sprinkles"},
      {"file": "donut_sprinkles.png", "caption": "Classic Chocolate Sprinkles"}
    ]

    return render_template(
        "t1.html",
        the_topic=the_topic,
        number_of_donuts=number_of_donuts,
        donut_data=donut_data,
        icecream_flavors=icecream_flavors,
        img_files=img_files
    )

#*************************************************

#Task 3: HTML Form get & Data 
@app.route("/t2")
def t2():
    return render_template("t2.html")

@app.route("/thank_you_t2")
def thank_you_t2():
    # Get fields from the query string (GET params)
    first  = request.args.get("first", "", type=str)
    second = request.args.get("second", "", type=str)
    notes  = request.args.get("notes", "", type=str)

    # Combine into one string
    combined = f"{first} {second} {notes}".strip()

    # Replaces every vowel (a, e, i, o, u; upper/lowercase) with an asterisk
    vowels = "aeiouAEIOU"
    masked = "".join("*" if ch in vowels else ch for ch in combined)

    # Pass both original and masked to template
    return render_template("thank_you_t2.html", masked=masked, raw=combined)

#*************************************************

#run
app.run(debug=True)

if __name__ == "__main__":
    app.run(debug=True)  # defaults to 127.0.0.1:500
