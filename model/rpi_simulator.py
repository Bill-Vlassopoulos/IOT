import random
from datetime import datetime,timedelta

T=60
orange_time=2
gap_time=2

fanari_0={
    "cars": random.randint(1, 20),
    "motorcycles": random.randint(1, 10),
    "buses": random.randint(1, 5)
}

fanari_1={
    "cars": random.randint(1, 20),
    "motorcycles": random.randint(1, 10),
    "buses": random.randint(1, 5)
}

fanari_2={
    "cars": random.randint(1, 20),
    "motorcycles": random.randint(1, 10),
    "buses": random.randint(1, 5)
}

fanari_3={
    "cars": random.randint(1, 20),
    "motorcycles": random.randint(1, 10),
    "buses": random.randint(1, 5)
}


total_vehicles_0=fanari_0["cars"]+fanari_0["motorcycles"]+fanari_0["buses"]
total_vehicles_1=fanari_1["cars"]+fanari_1["motorcycles"]+fanari_1["buses"]
total_vehicles_2=fanari_2["cars"]+fanari_2["motorcycles"]+fanari_2["buses"]
total_vehicles_3=fanari_3["cars"]+fanari_3["motorcycles"]+fanari_3["buses"]

# print("Fanari 0:",total_vehicles_0,"\nFanari 1:",total_vehicles_1,"\nFanari 2:",total_vehicles_2,"\nFanari 3:",total_vehicles_3)

total_vehicles=total_vehicles_0+total_vehicles_1+total_vehicles_2+total_vehicles_3

total_vehicles_list = [
    ("fanari_0", total_vehicles_0),
    ("fanari_1", total_vehicles_1),
    ("fanari_2", total_vehicles_2),
    ("fanari_3", total_vehicles_3)
]

# Sort the list in descending order based on the total vehicles
sorted_total_vehicles = sorted(total_vehicles_list, key=lambda x: x[1], reverse=True)

# Print the sorted list
for fanari, total in sorted_total_vehicles:
    print(f"{fanari}: {total}")

fanari_0_time=(total_vehicles_0/total_vehicles)*(T-4*(orange_time+gap_time))
fanari_1_time=(total_vehicles_1/total_vehicles)*(T-4*(orange_time+gap_time))
fanari_2_time=(total_vehicles_2/total_vehicles)*(T-4*(orange_time+gap_time))
fanari_3_time=(total_vehicles_3/total_vehicles)*(T-4*(orange_time+gap_time))

print("Fanari 0 green time:",fanari_0_time,"\nFanari 1 green time:",fanari_1_time,"\nFanari 2 green time:",fanari_2_time,"\nFanari 3 green time:",fanari_3_time)

fanari_0_pattern = {
    "green_time": fanari_0_time,
    "orange_time": orange_time,
    "red_time": T - fanari_0_time - orange_time
}

fanari_1_pattern = {
    "green_time": fanari_1_time,
    "orange_time": orange_time,
    "red_time": T - fanari_1_time - orange_time
}

fanari_2_pattern = {
    "green_time": fanari_2_time,
    "orange_time": orange_time,
    "red_time": T - fanari_2_time - orange_time
}

fanari_3_pattern = {
    "green_time": fanari_3_time,
    "orange_time": orange_time,
    "red_time": T - fanari_3_time - orange_time
}

print("Fanari 0 pattern:",fanari_0_pattern,"\nFanari 1 pattern:",fanari_1_pattern,"\nFanari 2 pattern:",fanari_2_pattern,"\nFanari 3 pattern:",fanari_3_pattern)

# Store the patterns in a dictionary for easy access
fanari_patterns = {
    "fanari_0": fanari_0_pattern,
    "fanari_1": fanari_1_pattern,
    "fanari_2": fanari_2_pattern,
    "fanari_3": fanari_3_pattern
}

# Get the current time
current_time = datetime.now()

# Print the schedule for each fanari
for fanari, total in sorted_total_vehicles:
    pattern = fanari_patterns[fanari]
    green_start = current_time
    green_end = green_start + timedelta(seconds=pattern["green_time"])
    orange_start = green_end
    orange_end = orange_start + timedelta(seconds=pattern["orange_time"])
    red_start = orange_end
    red_end = red_start + timedelta(seconds=pattern["red_time"])

    print(f"{fanari} schedule:")
    print(f"  Green:  {green_start.strftime('%H:%M:%S')} - {green_end.strftime('%H:%M:%S')}")
    print(f"  Orange: {orange_start.strftime('%H:%M:%S')} - {orange_end.strftime('%H:%M:%S')}")
    print(f"  Red:    {red_start.strftime('%H:%M:%S')} - {red_end.strftime('%H:%M:%S')}")
    print()

    # Update current time to include the gap time
    current_time = red_end + timedelta(seconds=gap_time)
