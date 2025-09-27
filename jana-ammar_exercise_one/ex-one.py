import requests
token = "0b289faf9b3f11e526ad6a022dc301371f6faa49" # my api key
url = "https://api.waqi.info/search/" # url
response = requests.get(url, params={"token": token, "keyword": "montreal"}) # make the request to access results with api key and city
results = response.json() # get the response as json
#print(results) #prints results 

# 5a.Code to get the type of results variable
print(type(results))
    #Result: <class 'dict'>

# 5b.Code to get the keys of results variable
print(results.keys())
    # Result: dict_keys(['status', 'data'])

# 5c.Code to access the content associated with the data field
responseData = results['data']; # Save results from the expression variable called responseData
    # a.Find out the type of responseData
print(type(responseData))
    # Result: <class 'list'>   

# 5d.Print data from responseData item
for item in responseData:
    print(item)
# What does each item represent?
    # udi - number which is the unique ID for the city monitoring station (5922)
    # aqi - number which is the real-time air quality inoformation (24)
    # time - object of measurement for time information ({'tz': '-04:00', 'stime': '2025-09-22 14:00:00', 'vtime': 1758564000})
        # tz - string of station timezone (-04:00)
    # station - object & number for location ({'name': 'Montreal', 'geo': [45.5086699, -73.5539925], 'url': 'montreal'}})
        # city - object for information about the monitoring station (Montreal)
        # geo - number for latitude/longitude of the monitoring system (45.5086699, -73.5539925)
        # url - string for the attribution link for specific destination (montreal)
# a.Code to determine the type of item variable
print(type(item))
    # Result: <class 'dict'>
# b.Code to derermine the keys associated with the item variable
print(item.keys())
    # Result: dict_keys(['uid', 'aqi', 'time', 'station'])

# 5e. Modify code to print out the name of each station from responseData
for item in responseData:
    station_info = item["station"] # Get the station dictionary
    station_name = station_info["name"] # Get the station name
    print("Station:", station_name)
    # Result: Output the list of station names available in the Montreal area. 
    # First 5 results:
        # Échangeur Décarie, Montreal, Canada
        # Caserne 17, Montreal, Canada
        # Roberval, York, Montreal, Canada
        # Jardin Botanique, Montreal, Canada
        # Ontario, Montreal, Canada

# 5f. Modify the code to print out the geolocations of each station from the responseData
for item in responseData:
    # Get geolocation
    station_info = item["station"]
    station_name = station_info["name"]
    print("Station:", station_name)
    
    geo = station_info["geo"]
    latitude = geo[0]
    longitude = geo[1]
    print("lat:",latitude)
    print("long:", longitude)
    # Result: Ouputs station names, followed by their geolocations.
    # First 3 results:
        # Échangeur Décarie, Montreal, Canada
            # lat:  45.502648
            # long:  -73.663913
        # Caserne 17, Montreal, Canada
            # lat:  45.593325
            # long:  -73.637328
        # Roberval, York, Montreal, Canada
            # lat:  45.464611
            # long:  -73.582583

# 5g. Print out the air quality index for each item AND the uid for each item.
for item in responseData:
    station_info = item["station"]  
    station_name = station_info["name"]
    geo = station_info["geo"]
    latitude = geo[0]
    longitude = geo[1]

    aqi = item["aqi"]                # air quality index
    uid = item["uid"]                # unique station id

    # Neatly labelled output
    print("Station:", station_name)
    print("lat:", latitude)
    print("long:", longitude)
    print("UID:", uid)
    print("AQI:", aqi)
    print("-" * 40)  # separator for readability


# 6a. Request the feed for a specific station UID
url_feed = "https://api.waqi.info/feed/@5468"
response_feed = requests.get(url_feed, params={"token": token})
results_feed = response_feed.json()
print(results_feed)  

# 6b. Access the 'data' field of the feed response
# Save the content under the 'data' field 
# This holds the station's payload: 'aqi', 'dominentpol', 'city', 'iaqi', 'time', etc.
response_data_feed = results_feed["data"]
# What is the type?
print(type(response_data_feed))  # Result: <class 'dict'>

# 6c. Confirms which fields are simple and which are nested
for key, value in response_data_feed.items():
    if isinstance(value, (int, float, str)) or value is None:
        print(key, "=>", value)
    else:
        print(key, "=>", type(value)) # summarize complex types (e.g., <class 'dict'>)
        
# 6d. Extract 'aqi' and 'dominentpol'
aqi_value = response_data_feed.get("aqi")
dominant_pol = response_data_feed.get("dominentpol")

print("AQI:", aqi_value)
print("Dominant pollutant code:", dominant_pol)

# 6e. Inspect 'iaqi'
iaqi = response_data_feed.get("iaqi", {})
print(type(iaqi))  # Result: <class 'dict'>

# Each pollutant key maps to a dict like {"v": <value>}
for pollutant, payload in iaqi.items():
    value = None
    if isinstance(payload, dict):
        value = payload.get("v")
    print(pollutant, "=>", value)


# 6f. Use 'dominentpol' to fetch the actual value from 'iaqi'
# ex: if dominant_pol == 'so2', then the value is iaqi['so2']['v']
dominant_value = None
if isinstance(iaqi, dict) and dominant_pol in iaqi and isinstance(iaqi[dominant_pol], dict):
    dominant_value = iaqi[dominant_pol].get("v")

print("Dominant pollutant:", dominant_pol)
print("Dominant pollutant value:", dominant_value)

# 7.
# - Identify each place: city name (/feed/{city}), coords (/feed/geo:lat;lon), or station UID (/feed/@uid).
# - For each place, call the feed with token. 
# - Work with data = response["data"].
# - Read:
#     dp = data.get("dominentpol")      # pollutant code driving AQI now (e.g., "pm25", "o3")
#     iaqi = data.get("iaqi", {})       # per-pollutant dicts like {"pm25": {"v": 12}}
# - The dominant pollutant’s value is: iaqi.get(dp, {}).get("v").
# - Save a small row: place id (name/coords/uid), data.get("city", {}).get("name"),
#   data.get("time"), data.get("aqi"), dp, and the dominant value.