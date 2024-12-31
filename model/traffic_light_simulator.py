import random
import datetime
import json
import requests
import threading
import paho.mqtt.client as mqtt

# MQTT broker details
MQTT_BROKER = "150.140.186.118"
MQTT_PORT = 1883
MQTT_TOPIC = (
    "v2_fanaria/v2_omada14_diastavrosi_0"  # Subscribe to all subtopics under v2_fanaria
)

message_received = False
headers = {"Content-Type": "application/json"}
link = "http://150.140.186.118:1026/v2/entities/"
MQTT_notifications = []


def main():

    # Traffic Lights
    fanari_0 = Traffic_Light("v2_omada14_fanari_0", "Φανάρι 1")
    fanari_1 = Traffic_Light("v2_omada14_fanari_1", "Φανάρι 2")
    fanari_2 = Traffic_Light("v2_omada14_fanari_2", "Φανάρι 3")
    fanari_3 = Traffic_Light("v2_omada14_fanari_3", "Φανάρι 4")
    fanari_4 = Traffic_Light("v2_omada14_fanari_4", "Φανάρι 1")
    fanari_5 = Traffic_Light("v2_omada14_fanari_5", "Φανάρι 2")
    fanari_6 = Traffic_Light("v2_omada14_fanari_6", "Φανάρι 3")
    fanari_7 = Traffic_Light("v2_omada14_fanari_7", "Φανάρι 4")
    fanari_8 = Traffic_Light("v2_omada14_fanari_8", "Φανάρι 1")
    fanari_9 = Traffic_Light("v2_omada14_fanari_9", "Φανάρι 2")
    fanari_10 = Traffic_Light("v2_omada14_fanari_10", "Φανάρι 3")
    fanari_11 = Traffic_Light("v2_omada14_fanari_11", "Φανάρι 4")
    fanari_12 = Traffic_Light("v2_omada14_fanari_12", "Φανάρι 1")
    fanari_13 = Traffic_Light("v2_omada14_fanari_13", "Φανάρι 2")
    fanari_14 = Traffic_Light("v2_omada14_fanari_14", "Φανάρι 3")
    fanari_15 = Traffic_Light("v2_omada14_fanari_15", "Φανάρι 4")
    fanari_16 = Traffic_Light("v2_omada14_fanari_16", "Φανάρι 1")
    fanari_17 = Traffic_Light("v2_omada14_fanari_17", "Φανάρι 2")
    fanari_18 = Traffic_Light("v2_omada14_fanari_18", "Φανάρι 3")
    fanari_19 = Traffic_Light("v2_omada14_fanari_19", "Φανάρι 4")

    fanari_0.set_random_waiting_vehicles()
    fanari_1.set_random_waiting_vehicles()
    fanari_2.set_random_waiting_vehicles()
    fanari_3.set_random_waiting_vehicles()

    # Junction 0 Πανεπιστήμιο Πατρών
    junction_0 = Traffic_Juction("v2_omada14_diastavrosi_0", "Πανεπιστήμιο Πατρών")
    junction_0.add_traffic_light(fanari_0)
    junction_0.add_traffic_light(fanari_1)
    junction_0.add_traffic_light(fanari_2)
    junction_0.add_traffic_light(fanari_3)

    junction_0.traffic_lights_schedule()
    for x in junction_0.traffic_lights:
        print(x.id + ": " + str(x.get_sum_waiting_vehicles()))
    # # Junction 1 Τόφαλος 1
    junction_1 = Traffic_Juction("v2_omada14_diastavrosi_1", "Τόφαλος 1")
    junction_1.add_traffic_light(fanari_4)
    junction_1.add_traffic_light(fanari_5)
    junction_1.add_traffic_light(fanari_6)
    junction_1.add_traffic_light(fanari_7)

    # # Junction 2 Τόφαλος 2
    junction_2 = Traffic_Juction("v2_omada14_diastavrosi_2", "Τόφαλος 2")
    junction_2.add_traffic_light(fanari_8)
    junction_2.add_traffic_light(fanari_9)
    junction_2.add_traffic_light(fanari_10)
    junction_2.add_traffic_light(fanari_11)

    # Junction 3 Ζαίμη
    junction_3 = Traffic_Juction("v2_omada14_diastavrosi_3", "Ζαίμη")
    junction_3.add_traffic_light(fanari_12)
    junction_3.add_traffic_light(fanari_13)
    junction_3.add_traffic_light(fanari_14)
    junction_3.add_traffic_light(fanari_15)

    # Junction 4 Σίκινου
    junction_4 = Traffic_Juction("v2_omada14_diastavrosi_4", "Σίκινου")
    junction_4.add_traffic_light(fanari_16)
    junction_4.add_traffic_light(fanari_17)
    junction_4.add_traffic_light(fanari_18)
    junction_4.add_traffic_light(fanari_19)

    mqtt_thread = threading.Thread(target=start_mqtt_loop)
    mqtt_thread.start()

    junction_0_task = PeriodicTask(float(junction_0.T), [junction_0.check_for_update_T, junction_0.traffic_lights_schedule])
    junction_0_task.start()

    traffic_light_tasks = []
    for traffic_light in junction_0.traffic_lights:
        task = PeriodicTask(
            float(junction_0.T) / 3,
            [
                traffic_light.set_random_waiting_vehicles,
                traffic_light.patch_waiting_vehicles,
            ],
        )
        task.start()
        traffic_light_tasks.append(task)

        update_task = PeriodicTask(10, [update_intervals], junction_0=junction_0, junction_0_task=junction_0_task, traffic_light_tasks=traffic_light_tasks)  # Check for updates every 10 seconds
        update_task.start()

    #  # Periodically check for updates to T and update intervals
    # def update_intervals():
    #     junction_0.check_for_update_T()
    #     junction_0.T=float(junction_0.T)
    #     print("Updating to ", junction_0.T," seconds")
    #     junction_0_task.update_interval((junction_0.T))
    #     for task in traffic_light_tasks:
    #         task.update_interval(float(junction_0.T) / 3)

    # update_task = PeriodicTask(10, [update_intervals])  # Check for updates every 10 seconds
    # update_task.start()



# Callback when the client receives a CONNACK response from the server
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    # Subscribing to the topic
    client.subscribe(MQTT_TOPIC)


# Callback when a PUBLISH message is received from the server
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        pretty_payload = json.dumps(payload, indent=4)

        MQTT_notifications.append(
            {
                payload["data"][0]["id"]: payload["data"][0]["period"]["value"][
                    "duration"
                ]
            }
        )
        print(MQTT_notifications)
        message_received = True
        # print("\nMessage received=", message_received)
    except json.JSONDecodeError:
        # print(f"Topic: {msg.topic}\nMessage: {msg.payload.decode()}")
        message_received = True
        # print("\nMessage received=", message_received)


def check_mqtt_message():
    print(message_received)  # Use the global variable
    if message_received:
        print("MQTT message received during the period.")
        message_received = False  # Reset the flag
    else:
        print("No MQTT message received during the period.")


def start_mqtt_loop():
    # Create an MQTT client instance
    client = mqtt.Client()

    # Assign the callback functions
    client.on_connect = on_connect
    client.on_message = on_message

    # Connect to the MQTT broker
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()

def update_intervals(junction_0, junction_0_task, traffic_light_tasks):
    junction_0.check_for_update_T()
    junction_0.T = float(junction_0.T)
    print("Updating to ", junction_0.T, " seconds")
    junction_0_task.update_interval(junction_0.T)
    for task in traffic_light_tasks:
        task.update_interval(float(junction_0.T) / 3)

def run_periodically(interval, funcs, *args, **kwargs):
    def wrapper():
        for func in funcs:
            func(*args, **kwargs)
        threading.Timer(interval, wrapper).start()

    threading.Timer(interval, wrapper).start()


def _time(starttime, endtime):
    starttime = starttime.isoformat()
    endtime = endtime.isoformat()
    return {"starttime": starttime, "endtime": endtime}


class Traffic_Light:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.waiting_vehicles = {"cars": 0, "bikes": 0, "buses": 0, "trucks": 0}
        self.traffic_light_time = {}

    def get_waiting_vehicles(self):
        return self.waiting_vehicles

    def patch_waiting_vehicles(self):

        url = link + self.id + "/attrs"
        data = {
            "waitingCars": {
                "type": "Integer",
                "value": self.get_sum_waiting_vehicles(),
                "metadata": {
                    "timestamp": {
                        "type": "DateTime",
                        "value": datetime.datetime.now().isoformat(),
                    }
                },
            }
        }

        try:
            response = requests.patch(url, json=data, headers=headers)
            if response.status_code == 204:
                # print(f"Entity {url} updated successfully")
                pass
            else:
                print(f"Failed to update entity {url}: {response.status_code}")
                print(response.json())
        except Exception as e:
            print(f"Error while updating entity {url}: {e}")

    def get_sum_waiting_vehicles(self):
        # print(self.id + ": " + str(sum(self.waiting_vehicles.values())))
        return sum(self.waiting_vehicles.values())

    def set_random_waiting_vehicles(self):
        self.waiting_vehicles = {
            "cars": random.randint(1, 10),
            "bikes": random.randint(1, 10),
            "buses": random.randint(1, 10),
            "trucks": random.randint(1, 10),
        }

    def set_traffic_light_time(self, value):
        self.traffic_light_time = {
            "schedule": {
                "type": "StructuredValue",
                "value": value,
            },
        }
        self.patch_traffic_light_time()
        # self.patch_waiting_vehicles()

    def patch_traffic_light_time(self):
        url = link + self.id + "/attrs"
        data = self.traffic_light_time

        try:
            response = requests.patch(url, json=data, headers=headers)
            if response.status_code == 204:
                # print(f"Entity {url} updated successfully")
                pass
            else:
                print(f"Failed to update entity {url}: {response.status_code}")
                print(response.json())
        except Exception as e:
            print(f"Error while updating entity {url}: {e}")


class Traffic_Juction:
    def __init__(self, id, name, T=60):
        self.id = id
        self.name = name
        self.T = T
        self.traffic_lights = []

    def set_T(self, T):
        self.T = T

    def add_traffic_light(self, traffic_light):
        self.traffic_lights.append(traffic_light)

    def traffic_lights_schedule(self):
        gaptime = 2
        orangetime = 2
        self.T = float(self.T)
        overall_green_time = (
            self.T - len(self.traffic_lights) * (orangetime) - 4 * gaptime
        )
        all_vehicles = {}
        for traffic_light in self.traffic_lights:
            all_vehicles[traffic_light.id] = traffic_light.get_sum_waiting_vehicles()

        all_vehicles = dict(
            sorted(all_vehicles.items(), key=lambda item: item[1], reverse=True)
        )

        total_sum_vehicles = sum(all_vehicles.values())
        for key in all_vehicles:
            all_vehicles[key] = (
                all_vehicles[key] * overall_green_time / total_sum_vehicles
            )
        print("Overall Green Time: ", overall_green_time)

        all_times = all_vehicles
        timeframes = {}
        previous_time = datetime.datetime.now()
        for key in all_times:
            start_time = previous_time
            end_time = start_time + datetime.timedelta(seconds=all_times[key])
            timeframes[key] = [
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

            # green_duration = datetime.datetime.fromisoformat(
            #     timeframes[key]["greentime"]["endtime"]
            # ) - datetime.datetime.fromisoformat(
            #     timeframes[key]["greentime"]["starttime"]
            # )
            # print(f"Green duration for {key}: {green_duration}")
            previous_time = (
                end_time
                + datetime.timedelta(seconds=orangetime)
                + datetime.timedelta(seconds=gaptime)
            )

        # print(timeframes)
        # print(json.dumps(timeframes, indent=4, ensure_ascii=False))

        self.share_schedule(timeframes)

        return timeframes

    def share_schedule(self, timeframes):
        for traffic_light in self.traffic_lights:
            if traffic_light.id in timeframes:
                traffic_light.set_traffic_light_time(timeframes[traffic_light.id])
                # print(
                #     traffic_light.id
                #     + ": "
                #     + json.dumps(
                #         traffic_light.traffic_light_time, indent=4, ensure_ascii=False
                #     )
                # )

        # def notify_for_change_T_with_mqtt(self):
        #     if message_received:
        #         self.update_T_from_cb()
        #         message_received = False
        #         print(self.T)
        #     else:
        #         print("No MQTT message received during the period.")

        # def update_T_from_cb(self):
        url = link + self.id
        response = requests.get(url)

        if response.status_code == 200:
            entity = response.json()
            self.T = entity["period"]["value"]["duration"]

        else:
            print(f"Failed to retrieve entity: {response.status_code}")
            print(response.json())

    def check_for_update_T(self):
        print(MQTT_notifications)
        for notification in MQTT_notifications:
            if self.id in notification:
                self.T = notification[self.id]
                print(self.T)
                MQTT_notifications.remove(notification)
                break

class PeriodicTask:
    def __init__(self, interval, funcs, **kwargs):
        self.interval = interval
        self.funcs = funcs
        self.kwargs = kwargs
        self.timer = None
        self.running = False

    def start(self):
        self.running = True
        self._run()

    def _run(self):
        if self.running:
            for func in self.funcs:
                func(**self.kwargs)
            self.timer = threading.Timer(self.interval, self._run)
            self.timer.start()

    def stop(self):
        self.running = False
        if self.timer:
            self.timer.cancel()

    def update_interval(self, interval):
        self.interval = interval
        print("Interval updated to ", interval)
        self.stop()
        self.start()


if __name__ == "__main__":
    main()
# python -u "c:\Users\billy\OneDrive\ΗΜΤΥ\9ο ΕΞΑΜΗΝΟ\ΔΙΑΔΙΚΤΥΟ ΤΩΝ ΠΡΑΓΜΑΤΩΝ\PROJECT\Web\model\traffic_light_simulator.py"
