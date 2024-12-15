from sqlite3 import connect
import random
from datetime import datetime, timedelta
import numpy as np

con = connect("model/admins.sqlite")
cur = con.cursor()

# Insert commented data into the database
locations = [
    (38.28689, 21.787373, "Διαστάρωση Πανεπιστημίου Πατρών"),
    (38.286372, 21.774256, "Τόφαλος 1"),
    (38.282599, 21.771536, "Τόφαλος 2"),
    (38.302055, 21.780824, "Ζαίμη"),
    (38.289022, 21.768183, "Σικίνου"),
]

traffic_lights = [
    (38.286996, 21.787494, "Φανάρι 1"),
    (38.286981, 21.787217, "Φανάρι 2"),
    (38.286845, 21.787206, "Φανάρι 3"),
    (38.286805, 21.787362, "Φανάρι 4"),
    (38.286471, 21.774371, "Φανάρι 1"),
    (38.286327, 21.774394, "Φανάρι 2"),
    (38.286299, 21.774248, "Φανάρι 3"),
    (38.286403, 21.774191, "Φανάρι 4"),
    (38.282501, 21.771518, "Φανάρι 1"),
    (38.282539, 21.771629, "Φανάρι 2"),
    (38.282639, 21.771593, "Φανάρι 3"),
    (38.282608, 21.771444, "Φανάρι 4"),
    (38.302139, 21.780937, "Φανάρι 1"),
    (38.301965, 21.780922, "Φανάρι 2"),
    (38.301972, 21.780745, "Φανάρι 3"),
    (38.302097, 21.780763, "Φανάρι 4"),
    (38.289115, 21.768258, "Φανάρι 1"),
    (38.288937, 21.768398, "Φανάρι 2"),
    (38.289063, 21.768091, "Φανάρι 3"),
    (38.288906, 21.768098, "Φανάρι 4"),
]

# Insert junctions and get their IDs
junction_ids = []
for lat, lng, title in locations:
    cur.execute(
        "INSERT INTO junction (latitute, longitude) VALUES (?, ?,?)", (lat, lng, title)
    )
    junction_ids.append(cur.lastrowid)

# Generate random data for traffic lights with Gaussian distribution
mean_waiting_cars = 25
stddev_waiting_cars = 10
mean_violations = 5
stddev_violations = 2

end_time = datetime.now()
start_time = end_time - timedelta(weeks=1)
current_time = start_time

while current_time <= end_time:
    for idx, (lat, lng, title) in enumerate(traffic_lights):
        waiting_cars = max(
            0, int(np.random.normal(mean_waiting_cars, stddev_waiting_cars))
        )
        violations = max(0, int(np.random.normal(mean_violations, stddev_violations)))
        id_traffic_light = int(title.split()[-1])  # Extract the number from the title
        cur.execute(
            "INSERT INTO traffic_light (id_traffic_light, id_diastaurosis, latitute, longitude, date, time, waiting_cars, violations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                id_traffic_light,
                junction_ids[
                    idx % len(junction_ids)
                ],  # Assign junction ID in a round-robin fashion
                lat,
                lng,
                current_time.date().isoformat(),
                current_time.time().isoformat(),
                waiting_cars,
                violations,
            ),
        )
    current_time += timedelta(seconds=3)

con.commit()
con.close()
