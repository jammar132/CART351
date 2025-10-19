"""
Project 1 - Jae Ammar 
CART 351-2252-A (Fall 2025)
Professor Sabine Rosenberg
18 October 2025

Description: To practice concepts covered in class; Further explore, extract data from, combine,
    co-relate, make inferences with, misuse, mis-represent The World Air Quality index API; And, 
    implementing an Interactive User Interface in the terminal to explore and experiment with 
    the possibilities for creating visually hurourful, stimulating, absurd and/or beautiful 
    *output* in the terminal.

Terminal explorer for World Air Quaility Index data.
    Additions
        - Search by city keyword; list stations with AQI and coordinates
        - Inspect a station by UID (live feed)
        - “AQI Theater” visualization + misrepresentation toggles
        - Silly mini-game: Battle the FOG MONSTER whose strength scales with AQI
        - Color, emojis, ASCII banners; error handling
    Credits / Referances (also listed at end of file)
        - World Air Quality Index API (https://aqicn.org/api/)
        - colorama, art, pyfiglet library docs
        - ANSI escape codes for terminal styling

"""
import os        # for environment variables and system operations (e.g., getting the API token)
import sys       # for exiting the program 
import time      # for delays and simple animations
import math      # for numeric operations like rounding or square roots
import random    # for randomness in the mini-game and visual effects
import textwrap  # for formatting long text neatly in the terminal
import shutil    # for getting terminal size (helps with responsive banners)
from typing import Any, Dict, List, Optional  # for type hints (improves code clarity)

import requests  # for making live HTTP requests to the World Air Quality Index API

TOKEN = os.getenv("WAQI_TOKEN", "0b289faf9b3f11e526ad6a022dc301371f6faa49").strip()
SEARCH_URL = "https://api.waqi.info/search/"
FEED_URL_TMPL = "https://api.waqi.info/feed/@{uid}/"

# Cosmetics:
try: # colorama = adds colors to terminal text
    from colorama import init as colorama_init, Fore, Style
    colorama_init(autoreset=True)
except Exception:
    class Dummy: pass # If not installed, create dummy replacements so the program still runs.
    Fore = Style = Dummy()
    Fore.RED = Fore.YELLOW = Fore.GREEN = Fore.CYAN = Fore.MAGENTA = Fore.BLUE = Fore.WHITE = ""
    Style.BRIGHT = Style.DIM = Style.NORMAL = ""

try: # art / pyfiglet = generate large ASCII banners
    from art import text2art
except Exception:
    text2art = None
try:
    import pyfiglet
except Exception:
    pyfiglet = None

EMOJI = { # Assign emojis to variables
    "good": "🌿", 
    "mod": "🙂",
    "usg": "😷",
    "unhealthy": "🤢",
    "very": "☠️",
    "haz": "💀",
    "unknown": "❓"
}

# UTILITIES
def banner(txt: str) -> None:
    width = shutil.get_terminal_size((80, 20)).columns
    if pyfiglet:
        try:
            print(pyfiglet.figlet_format(txt, width=width))
            return
        except Exception:
            pass
    if text2art:
        try:
            print(text2art(txt))
            return
        except Exception:
            pass
    print(f"\n{txt}\n" + ("=" * min(width, max(10, len(txt)+2))))

def safe_get(url: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]: # Helper to safely call an API endpoint and return JSON data.
    try:
        r = requests.get(url, params=params, timeout=12) # Makes a GET request with given parameters. Times out after 12 sec.
        r.raise_for_status()
        data = r.json()
        if not isinstance(data, dict): # Converts response to dict if possible.
            print(Fore.YELLOW + "Unexpected response format.")
            return None
        return data
    except requests.exceptions.RequestException as e: #looks out for network / HTTP errors.
        print(Fore.RED + f"Network error: {e}")
        return None
    
def aqi_category(aqi: Optional[int]) -> (str, str): #Assign categories to colors
    """Return (label, color) for AQI."""
    if aqi is None:
        return ("Unknown", Fore.WHITE)
    try:
        aqi = int(aqi)
    except Exception:
        return ("Unknown", Fore.WHITE)
    if aqi <= 50:
        return ("Good", Fore.GREEN)
    if aqi <= 100:
        return ("Moderate", Fore.YELLOW)
    if aqi <= 150:
        return ("Unhealthy for Sensitive Groups", Fore.MAGENTA)
    if aqi <= 200:
        return ("Unhealthy", Fore.RED)
    if aqi <= 300:
        return ("Very Unhealthy", Fore.RED + Style.BRIGHT)
    return ("Hazardous", Fore.RED + Style.BRIGHT)

def cat_emoji(label: str) -> str: # Assign emojis to categories 
    key = {
        "Good": "good",
        "Moderate": "mod",
        "Unhealthy for Sensitive Groups": "usg",
        "Unhealthy": "unhealthy",
        "Very Unhealthy": "very",
        "Hazardous": "haz",
        "Unknown": "unknown"
    }.get(label, "unknown")
    return EMOJI.get(key, "❓")

def bar_gauge(aqi: Optional[int], width: int = 40) -> str:
    if aqi is None:
        return "[unknown]"
    try:
        val = max(0, min(500, int(aqi)))  # clamp to 0..500
    except Exception:
        return "[unknown]"
    filled = math.ceil((val / 500) * width)
    empty = width - filled
    return "[" + ("#" * filled) + ("-" * empty) + f"] {val}"

def pretty_wrap(txt: str, indent: int = 2) -> str:
    width = shutil.get_terminal_size((80, 20)).columns
    return textwrap.fill(txt, width=width, subsequent_indent=" " * indent)

# WAQI API HELPERS 
def search_city(keyword: str) -> List[Dict[str, Any]]: # search to find all stations for a city keyword.
    payload = {"token": TOKEN, "keyword": keyword}
    data = safe_get(SEARCH_URL, payload)
    if not data:
        return []
    if data.get("status") != "ok": # Return a list (name, UID, AQI)
        print(Fore.YELLOW + f"API returned status: {data.get('status')}")
        return []
    return data.get("data", []) or []

def fetch_station(uid: int) -> Optional[Dict[str, Any]]: #fetch detailed, live data for station.
    url = FEED_URL_TMPL.format(uid=uid)
    data = safe_get(url, {"token": TOKEN})
    if not data:
        return None
    if data.get("status") != "ok": # Returns 
        print(Fore.YELLOW + f"API returned status: {data.get('status')}")
        return None
    return data.get("data")

# MAIN MENU
def main():
    banner("AQI ARENA")
    print(Style.DIM + "• Welcome to the playful WAQI explorer •\n• Terminal-only • Colors + ASCII • Live API •")

    if not TOKEN:
        print(Fore.RED + "No WAQI token found. Set WAQI_TOKEN env var or edit TOKEN in code.")
        sys.exit(1)

    while True:
        print(Style.BRIGHT + "\nMain Menu")
        print("1) Quick City Search")
        print("2) Station Details by UID")
        print("3) AQI Theater")
        print("4) FOG MONSTER mini-game")
        print("5) Exit")
        choice = input(Fore.CYAN + "Pick an option [1-5]: ").strip()
        if choice == "1":
            view_city_search()
        elif choice == "2":
            view_station_details()
        elif choice == "3":
            view_aqi_theater()
        elif choice == "4":
            fog_monster_game()
        elif choice == "5":
            print(Fore.CYAN + "Goodbye! Stay breezy. 🌬️")
            break
        else:
            print(Fore.YELLOW + "Invalid choice. Try 1–5.")

# VIEWS
def view_city_search():
    query = input(Style.BRIGHT + Fore.CYAN + "\nEnter city keyword (e.g., montreal): ").strip()
    if not query:
        print(Fore.YELLOW + "Empty query. Try again.")
        return
    print(Fore.CYAN + "Searching WAQI…")
    results = search_city(query)
    if not results:
        print(Fore.YELLOW + "No stations found.")
        return

    print(Style.BRIGHT + f"\nFound {len(results)} station(s):\n" + "-"*50)
    for item in results:
        st = item.get("station", {})
        name = st.get("name", "N/A")
        geo = st.get("geo", [None, None])
        aqi = item.get("aqi")
        uid = item.get("uid")
        label, color = aqi_category(aqi)
        print(color + f"{name}  {cat_emoji(label)}")
        print(f"  UID: {uid} | lat: {geo[0]} | long: {geo[1]}")
        print(" ", bar_gauge(aqi))
        print("-"*50)

def view_station_details():
    print(Fore.GREEN + "\nEnter station Unique Identifier.\n" + Style.DIM + "UID: 65 is for Fresh Kills West, New York. \n     1898 is for Oinomori, Tendo, Yamagata, Japan\n" + "-"*60)
    raw = input(Style.BRIGHT + Fore.CYAN + "\nEnter Station UID: ").strip()
    if not raw.isdigit():
        print(Fore.YELLOW + "Please enter a numeric UID.")
        return
    uid = int(raw)
    print(Fore.CYAN + f"Fetching live feed for UID {uid}…")
    data = fetch_station(uid)
    if not data:
        print(Fore.YELLOW + "No data found for this UID.")
        return

    city = data.get("city", {}).get("name", "Unknown")
    aqi = data.get("aqi")
    dom = (data.get("dominentpol") or data.get("dominentPol") or "n/a")
    time_str = (data.get("time") or {}).get("s", "n/a")
    label, color = aqi_category(aqi)

    banner("Station Feed")
    print(Style.BRIGHT + f"City: {city}")
    print(f"Time: {time_str}")
    print(color + f"AQI: {aqi} — {label} {cat_emoji(label)}")
    print("Gauge:", bar_gauge(aqi))
    print(f"Dominant pollutant: {dom}")

    iaqi = data.get("iaqi") or {}
    if iaqi:
        print("\nComponents (iaqi):")
        for k, v in iaqi.items():
            val = v.get("v", "n/a")
            print(f"  - {k}: {val}")
    print("-"*50)

def view_aqi_theater():
    raw = input(Style.BRIGHT + Fore.CYAN + "\nEnter city keyword for “AQI Theater”: ").strip()
    if not raw:
        print(Fore.YELLOW + "Empty input.")
        return
    rows = search_city(raw)
    if not rows:
        print(Fore.YELLOW + "No results to stage.")
        return

    banner("AQI THEATER")
    print(pretty_wrap(
        "Welcome to AQI Theater. Left bar is always RAW (0–500). Right bar = representation: "
        "1) Linear, 2) Contrast-boosted, 3) Misrepresented with heavy distortion + jitter."
    ))

    print("\n1) Raw (rep=linear)  2) Normalized (contrast-boost)  3) Misrepresented (heavy distortion)")
    mode = input(Fore.CYAN + "Choose mode [1/2/3]: ").strip()
    if mode not in {"1", "2", "3"}:
        mode = "1"

    # mapping functions for the REP (0–100) bar 
    def rep_linear(aqi: int) -> int:
        # Simple linear map to 0–100
        return int(round(max(0, min(500, aqi)) / 5.0))

    def rep_normalized(aqi: int) -> int:
        # Contrast-boosted mapping (gamma < 1 inflates small values)
        x = max(0, min(500, aqi))
        val = int(round(((x / 500.0) ** 0.75) * 100))
        # Add a small floor for very clean air so you still "see" it
        return max(0, val)

    def rep_misrepresented(aqi: int) -> int:
        # Aggressive distortion: sqrt curve + larger scale + random jitter 
        x = max(0, min(500, aqi))
        val = int(round(min(100, (math.sqrt(x) * 9) + random.randint(-8, 12))))
        return max(0, val)

    def rep_value(aqi_int: int) -> int:
        if mode == "2":
            return rep_normalized(aqi_int)
        elif mode == "3":
            return rep_misrepresented(aqi_int)
        else:
            return rep_linear(aqi_int)

    print(Style.DIM + f"\n{'Station':40s} | {'RAW 0-500':<48} | {'REP 0-100':<48} | Cat") # Header

    for item in rows[:12]:  # cap to keep output readable
        st = item.get("station", {})
        name = st.get("name", "N/A")[:40]
        aqi_val = item.get("aqi")

        # Parse AQI; skip unknowns
        try:
            aqi_int = int(aqi_val)
            aqi_int = max(0, min(500, aqi_int))
        except Exception:
            aqi_int = None

        if aqi_int is None:
            label, color = ("Unknown", Fore.WHITE)
            raw_bar = "[unknown]"
            rep_bar = "[unknown]"
        else:
            label, color = aqi_category(aqi_int)
            # Left = raw bar in 0–500
            raw_bar = bar_gauge(aqi_int, width=40)
            # Right = representation bar in 0–100 (mode-dependent)
            rep = rep_value(aqi_int)
            rep_filled = int((rep / 100) * 40)
            rep_bar = "[" + "#" * rep_filled + "-" * (40 - rep_filled) + f"] {rep}/100"

        print(color + f"{name:40s} | {raw_bar:<48} | {rep_bar:<48} | {label} {cat_emoji(label)}")
        time.sleep(0.03)

    print(Fore.MAGENTA + "Left bar stays raw for reference; right bar shows how design choices change perception.")

    # legend for what the modes are doing
    if mode == "1":
        note = "Mode 1 → RAW (Linear).\n  Displays actual AQI value on its natural 0-500 scale.\n  The Right 'REP' bar is simply AQI / 5 → 0–100 range.\n  This keeps true proportion - no distortion"
    elif mode == "2":
        note = "Mode 2 → REP = contrast-boosted (gamma 0.75) to inflate small values.\n  This is called a power-law or gamma correction curve.\n  If you take a number between 0 and 1 and raise it to a power less than 1, the curve bends upward\n  — small inputs become relatively larger outputs."
    else:
        note = "Mode 3 → REP = misrepresented (sqrt curve + jitter).\n  Greatly exaggerates differances and adds randomness to mimic how poor design choices\n  or bias can mislead the viewer. Demonstates how 'representation' can easily become\n  'misinformation'."

    print(Style.DIM + "\n" + note)

def fog_monster_game():
    banner("FOG MONSTER")
    city = input(Fore.CYAN + "Summon a monster by city keyword (e.g., new york): ").strip()
    if not city:
        print(Fore.YELLOW + "No city, no monster. 💤")
        return
    rows = search_city(city)
    if not rows:
        print(Fore.YELLOW + "No stations — the monster refuses to spawn.")
        return

    # Choose the worst AQI station to set monster strength
    worst = None
    worst_aqi = -1
    for item in rows:
        try:
            a = int(item.get("aqi"))
            if a > worst_aqi:
                worst_aqi = a
                worst = item
        except Exception:
            continue

    if worst is None:
        print(Fore.YELLOW + "Could not determine AQI. Monster lost in the fog.")
        return

    label, color = aqi_category(worst_aqi)
    stname = worst.get("station", {}).get("name", "N/A")

    monster_hp = max(30, min(200, int(worst_aqi / 2) + 20)) # stats
    player_hp = 60
    attack_base = 10

    print(color + f"\nThe FOG MONSTER arises near '{stname}'! AQI {worst_aqi} — {label} {cat_emoji(label)}")
    monster_art = r"""
Norns by Shanaka Dias
        _____
    .-,;='';_),-.
     \_\(),()/_/
       (,___,)
      ,-/`~`\-,___
     / /).:.('--._)
    {_[ (_,_)
        | Y |
snd    /  |  \
       """ """
    """
    print(monster_art)

    def hit(dmg: int) -> str:
        n = min(40, max(1, dmg // 2))
        return "[" + "✖" * n + "-" * (40 - n) + f"] -{dmg} HP"

    while player_hp > 0 and monster_hp > 0:
        print(Style.BRIGHT + f"\nYour HP: {player_hp}   Monster HP: {monster_hp}")
        print("Choose: (A)ttack  (H)eal  (R)un")
        choice = input("> ").strip().lower()[:1] #remove spaces, lowercase, take only first character 
        if choice == "a":
            dmg = random.randint(attack_base - 3, attack_base + 5)
            # pollution amplifies monster defense
            if worst_aqi > 150 and random.random() < 0.25:
                print(Fore.YELLOW + "The FOG thickens — your attack glances off!")
                dmg = max(1, dmg - 6)
            monster_hp -= dmg
            print(Fore.GREEN + "You strike! " + hit(dmg))
        elif choice == "h":
            heal = random.randint(6, 14)
            player_hp = min(60, player_hp + heal)
            print(Fore.CYAN + f"You inhale 🌿 ‘fresh air’ (kinda). +{heal} HP")
        elif choice == "r":
            if random.random() < 0.5:
                print(Fore.CYAN + "You escape into clearer skies. Game over.")
                return
            else:
                print(Fore.YELLOW + "You stumble in the haze — can’t escape!")
        else:
            print(Fore.YELLOW + "Confused turn!")

        if monster_hp > 0: 
            # Monster attack scales with AQI
            mdmg = random.randint(6, 12) + int(worst_aqi / 50)
            player_hp -= mdmg
            print(Fore.RED + f"The FOG MONSTER exhales particulate doom! -{mdmg} HP")

        time.sleep(0.4)

    if player_hp <= 0 and monster_hp <= 0: #win conditions
        print(Style.BRIGHT + "You both collapse. Draw! 🤝")
    elif monster_hp <= 0:
        print(Style.BRIGHT + Fore.GREEN + "You cleared the air! Victory! 🌬️✨")
    else:
        print(Style.BRIGHT + Fore.RED + "Overwhelmed by haze… Defeat. 😵‍💫")

# Run main() only if file is executed directly.
if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n" + Fore.CYAN + "Bye!")