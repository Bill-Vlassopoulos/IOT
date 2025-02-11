import random
import datetime
import requests
import time
import RPi.GPIO as GPIO

# Context Broker API
CONTEXT_BROKER_URL = "http://150.140.186.118:1026/v2/entities/"
HEADERS = {"Accept": "application/json"}

# Define Diastavrosi 3 and its Traffic Lights
JUNCTION_ID = "v3_omada14_diastavrosi_3"
TRAFFIC_LIGHTS = [
    "v3_omada14_fanari_8",
    "v3_omada14_fanari_9",
    "v3_omada14_fanari_10",
    "v3_omada14_fanari_11",
]
percentages = {}

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Define Traffic Light GPIO Pins
TRAFFIC_LIGHTS_PINS = {
    "v3_omada14_fanari_8": {"red": 17, "yellow": 27, "green": 22},
    "v3_omada14_fanari_9": {"red": 5, "yellow": 6, "green": 13},
    "v3_omada14_fanari_10": {"red": 19, "yellow": 26, "green": 21},
    "v3_omada14_fanari_11": {"red": 12, "yellow": 16, "green": 20},
}

# Setup GPIO pins as output
for light in TRAFFIC_LIGHTS_PINS.values():
    for pin in light.values():
        GPIO.setup(pin, GPIO.OUT)
        GPIO.output(pin, GPIO.LOW)


def reset_all_red():
    """Turn all traffic lights red."""
    for light in TRAFFIC_LIGHTS:
        set_traffic_light_state(light, "red")


def set_traffic_light_state(light_id, color):
    """Simulates setting a traffic light state via GPIO or Context Broker"""
    pin_config = TRAFFIC_LIGHTS_PINS.get(light_id, {})
    for color_name, pin in pin_config.items():
        GPIO.output(pin, GPIO.HIGH if color_name == color else GPIO.LOW)
    print(f"Traffic Light {light_id} set to {color.upper()}")


# Function to fetch junction settings, including mode and ptl
def fetch_junction_settings():
    url = f"{CONTEXT_BROKER_URL}{JUNCTION_ID}"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        entity = response.json()
        try:
            T = int(entity["period"]["value"]["duration"])
            orangetime = int(entity["orange_duration"]["value"])
            gaptime = int(entity["gap_duration"]["value"])
            mode = int(entity["mode"]["value"])
            ptl = int(entity["ptl"]["value"])
            fixed_schedule = entity.get("fixed_schedule", {}).get("value", [])
        except (KeyError, ValueError, TypeError):
            print("Error parsing values from Context Broker. Using defaults.")
            return 60, 3, 2, 0, -1, []  # Default values
        return T, orangetime, gaptime, mode, ptl, fixed_schedule
    else:
        print(f"Error fetching junction settings: {response.status_code}")
        return 60, 3, 2, 0, -1, []  # Default values if request fails


# Function to simulate waiting vehicles
def generate_vehicle_count():
    return max(1, int(random.gauss(5, 2)))  # mean=5, std=2


# Function to update vehicle data (every T/3 seconds)
def update_vehicle_counts():
    for light_id in TRAFFIC_LIGHTS:
        data = {
            "waitingCars": {
                "type": "Integer",
                "value": generate_vehicle_count(),
                "metadata": {
                    "timestamp": {
                        "type": "DateTime",
                        "value": datetime.datetime.utcnow().isoformat(),
                    }
                },
            }
        }
        response = requests.patch(
            f"{CONTEXT_BROKER_URL}{light_id}/attrs", json=data, headers=HEADERS
        )
        if response.status_code == 204:
            print(f"Updated vehicle count for {light_id}")
        else:
            print(f"Error updating {light_id}: {response.status_code}")


# Function to create dynamic schedule (mode = 0)
def generate_dynamic_schedule(T, orangetime, gaptime):
    total_green_time = (
        T - len(TRAFFIC_LIGHTS) * (orangetime) - len(TRAFFIC_LIGHTS) * gaptime
    )
    if total_green_time <= 0:
        print("Error: Green time calculation resulted in non-positive value.")
        return {}

    vehicle_counts = {light: generate_vehicle_count() for light in TRAFFIC_LIGHTS}
    total_vehicles = sum(vehicle_counts.values())

    schedule = {}
    current_time = datetime.datetime.utcnow()

    for light, count in vehicle_counts.items():
        green_time = (
            (count / total_vehicles) * total_green_time
            if total_vehicles > 0
            else total_green_time / len(TRAFFIC_LIGHTS)
        )
        start_time = current_time
        end_time = start_time + datetime.timedelta(seconds=green_time)

        schedule[light] = [
            {
                "phase": "Green",
                "startTime": start_time.isoformat(),
                "endTime": end_time.isoformat(),
            },
            {
                "phase": "Orange",
                "startTime": end_time.isoformat(),
                "endTime": (
                    end_time + datetime.timedelta(seconds=orangetime)
                ).isoformat(),
            },
            {"phase": "Red", "startTime": "None", "endTime": "None"},
        ]
        percentages[light] = green_time / T
        current_time = end_time + datetime.timedelta(seconds=orangetime + gaptime)

    return schedule


# Function to create static schedule (mode = 1) with fixed percentages
def generate_static_schedule(T, orangetime, gaptime, fixed_schedule):
    total_green_time = (
        T - len(TRAFFIC_LIGHTS) * (orangetime) - len(TRAFFIC_LIGHTS) * gaptime
    )
    if total_green_time <= 0:
        print("Error: Green time calculation resulted in non-positive value.")
        return {}

    schedule = {}
    current_time = datetime.datetime.utcnow()

    for entry in fixed_schedule:
        light_id = list(entry.keys())[0]
        percentage = entry[light_id]

        green_time = (percentage / 100) * total_green_time
        start_time = current_time
        end_time = start_time + datetime.timedelta(seconds=green_time)

        schedule[light_id] = [
            {
                "phase": "Green",
                "startTime": start_time.isoformat(),
                "endTime": end_time.isoformat(),
            },
            {
                "phase": "Orange",
                "startTime": end_time.isoformat(),
                "endTime": (
                    end_time + datetime.timedelta(seconds=orangetime)
                ).isoformat(),
            },
            {"phase": "Red", "startTime": "None", "endTime": "None"},
        ]
        percentages[light] = green_time / T
        current_time = end_time + datetime.timedelta(seconds=orangetime + gaptime)

    return schedule


# Function to update mode and ptl in Context Broker
def update_junction_mode(new_mode, new_ptl):
    data = {
        "mode": {"type": "Integer", "value": new_mode},
        "ptl": {"type": "Integer", "value": new_ptl},
    }
    response = requests.patch(
        f"{CONTEXT_BROKER_URL}{JUNCTION_ID}/attrs", json=data, headers=HEADERS
    )
    if response.status_code == 204:
        print(f"Updated mode to {new_mode} and ptl to {new_ptl}")
    else:
        print(f"Error updating mode/ptl: {response.status_code}")


# Function to update schedule on context broker
def update_schedule(mode, T, orangetime, gaptime, fixed_schedule, ptl):
    if mode == 0:
        print("Dynamic Mode: Generating schedule based on traffic.")
        schedule = generate_dynamic_schedule(T, orangetime, gaptime)
    else:
        print(f"Static Mode: Applying fixed schedule (PTL={ptl}).")
        schedule = generate_static_schedule(T, orangetime, gaptime, fixed_schedule)

        # Handle PTL decrement
        if ptl > 0:
            ptl -= 1
            if ptl == 0:
                print("PTL reached 0, switching to dynamic mode.")
                update_junction_mode(0, ptl)  # Change to dynamic mode

    for light_id, phases in schedule.items():
        data = {"schedule": {"type": "StructuredValue", "value": phases}}
        response = requests.patch(
            f"{CONTEXT_BROKER_URL}{light_id}/attrs", json=data, headers=HEADERS
        )
        if response.status_code == 204:
            print(f"Updated schedule for {light_id}")
        else:
            print(f"Error updating schedule for {light_id}: {response.status_code}")


# Main loop
if __name__ == "__main__":
    while True:
        # Fetch junction settings
        T, orangetime, gaptime, mode, ptl, fixed_schedule = fetch_junction_settings()

        update_schedule(mode, T, orangetime, gaptime, fixed_schedule, ptl)

        # Iterate through the traffic lights in the schedule
        reset_all_red()
        for light_id in TRAFFIC_LIGHTS:
            green_time = T * percentages.get(
                light_id, 0
            )  # Compute green time based on percentage

            if green_time > 0:
                # Set to Green
                set_traffic_light_state(light_id, "green")
                print(f"{light_id} GREEN for {green_time} seconds")
                time.sleep(green_time)

                # Set to Orange
                set_traffic_light_state(light_id, "yellow")
                print(f"{light_id} ORANGE for {orangetime} seconds")
                time.sleep(orangetime)

                # Set to Red
                set_traffic_light_state(light_id, "red")
                print(f"{light_id} RED (waiting for gap time)")
                time.sleep(gaptime)  # Wait for gap before next light
