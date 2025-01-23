import random
import datetime
import json
import requests
import threading
import time
import sys

id = int(sys.argv[1])

GLOBAL_SEED = random.seed(id)

# import paho.mqtt.client as mqtt

# # MQTT broker details
# MQTT_BROKER = "150.140.186.118"
# MQTT_PORT = 1883
# MQTT_TOPIC = (
#     "v3_fanaria/v3_omada14_diastavrosi_0"  # Subscribe to all subtopics under v3_fanaria
# )

# message_received = False
headers = {"Content-Type": "application/json"}
link = "http://150.140.186.118:1026/v2/entities/"
# MQTT_notifications = []


def main():

    # Traffic Lights
    fanari_0 = Traffic_Light("v3_omada14_fanari_" + str(4 * id), "Φανάρι 1")
    fanari_1 = Traffic_Light("v3_omada14_fanari_" + str(4 * id + 1), "Φανάρι 2")
    fanari_2 = Traffic_Light("v3_omada14_fanari_" + str(4 * id + 2), "Φανάρι 3")
    fanari_3 = Traffic_Light("v3_omada14_fanari_" + str(4 * id + 3), "Φανάρι 4")

    fanari_0.set_random_waiting_vehicles(seed=GLOBAL_SEED)
    fanari_1.set_random_waiting_vehicles(seed=GLOBAL_SEED)
    fanari_2.set_random_waiting_vehicles(seed=GLOBAL_SEED)
    fanari_3.set_random_waiting_vehicles(seed=GLOBAL_SEED)

    # Junction 0 Πανεπιστήμιο Πατρών
    junction_0 = Traffic_Juction(
        "v3_omada14_diastavrosi_" + str(id), "Πανεπιστήμιο Πατρών"
    )
    junction_0.add_traffic_light(fanari_0)
    junction_0.add_traffic_light(fanari_1)
    junction_0.add_traffic_light(fanari_2)
    junction_0.add_traffic_light(fanari_3)

    while True:
        junction_0.check_for_cb_update()
        for i in range(3):
            for traffic_light in junction_0.traffic_lights:
                traffic_light.set_random_waiting_vehicles(seed=GLOBAL_SEED)
                traffic_light.patch_waiting_vehicles()
            time.sleep(float(junction_0.T) / 3)
        if junction_0.mode == 0:
            junction_0.traffic_lights_schedule()
        elif junction_0.mode == 1:
            if junction_0.ptl == -1:
                junction_0.static_schedule()
            elif junction_0.ptl > 0:
                junction_0.static_schedule()
                junction_0.ptl -= 1
                if junction_0.ptl == 0:
                    junction_0.mode = 0
                junction_0.general_cb_patch()


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
        print(self.id + ": " + str(sum(self.waiting_vehicles.values())))
        return sum(self.waiting_vehicles.values())

    def set_random_waiting_vehicles(self, seed=None):
        if seed is None:
            seed = GLOBAL_SEED
        random.seed(seed)

        self.waiting_vehicles = {
            "cars": max(1, int(random.gauss(5, 2))),  # mean=5, std=2
            "bikes": max(0, int(random.gauss(0.5, 0.5))),  # mean=0.5, std=0.5
            "buses": max(0, int(random.gauss(1, 0.5))),  # mean=1, std=0.5
            "trucks": max(0, int(random.gauss(0.5, 0.5))),  # mean=0.5, std=0.5
        }

        # print(self.id + ": " + json.dumps(self.waiting_vehicles, indent=4))

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
        self.ptl = 0
        self.mode = 0
        self.orangetime = 2
        self.gaptime = 2

    def set_T(self, T):
        self.T = T

    def add_traffic_light(self, traffic_light):
        self.traffic_lights.append(traffic_light)

    def traffic_lights_schedule(self):
        gaptime = self.gaptime
        orangetime = self.orangetime
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

    def static_schedule(self):
        url = link + self.id
        response = requests.get(url)
        gaptime = self.gaptime
        orangetime = self.orangetime
        self.T = float(self.T)

        if response.status_code == 200:
            entity = response.json()
            # print("Full entity:")
            # print(json.dumps(entity, indent=4))

            fixed_schedule = entity["fixed_schedule"]["value"]

            percentages = [
                fixed_schedule[0][self.traffic_lights[0].id],
                fixed_schedule[1][self.traffic_lights[1].id],
                fixed_schedule[2][self.traffic_lights[2].id],
                fixed_schedule[3][self.traffic_lights[3].id],
            ]

            print("Fanari 0:", percentages[0])
            print("Fanari 1:", percentages[1])
            print("Fanari 2:", percentages[2])
            print("Fanari 3:", percentages[3])

            overall_green_time = (
                self.T - len(self.traffic_lights) * (orangetime) - 4 * gaptime
            )

            green_times = [
                overall_green_time * (percentages[0] / 100),
                overall_green_time * (percentages[1] / 100),
                overall_green_time * (percentages[2] / 100),
                overall_green_time * (percentages[3] / 100),
            ]
            all_times = {}
            i = 0
            for traffic_light in self.traffic_lights:
                all_times[traffic_light.id] = green_times[i]
                i += 1

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
            print(json.dumps(timeframes, indent=4, ensure_ascii=False))

            self.share_schedule(timeframes)

        else:
            print(f"Failed to retrieve entity: {response.status_code}")
            print(response.json())

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

    def check_for_update_T_cb(self):
        url = link + self.id
        response = requests.get(url)

        if response.status_code == 200:
            entity = response.json()
            if self.T != entity["period"]["value"]["duration"]:
                self.T = entity["period"]["value"]["duration"]
                # print("T updated to ", self.T)
        else:
            print(f"Failed to retrieve entity: {response.status_code}")
            print(response.json())
        print("T: ", self.T)

    def check_for_cb_update(self):
        url = link + self.id
        response = requests.get(url)

        if response.status_code == 200:
            entity = response.json()
            if self.T != entity["period"]["value"]["duration"]:
                self.T = entity["period"]["value"]["duration"]
                # print("T updated to ", self.T)
            if self.mode != entity["mode"]["value"]:
                self.mode = entity["mode"]["value"]
                # print("Mode updated to ", self.mode)
            if self.ptl != entity["ptl"]["value"]:
                self.ptl = entity["ptl"]["value"]
                # print("Ptl updated to ", self.ptl)
            if self.orangetime != entity["orange_duration"]["value"]:
                self.orangetime = entity["orange_duration"]["value"]
                # print("Orangetime updated to ", self.orangetime)
            if self.gaptime != entity["gap_duration"]["value"]:
                self.gaptime = entity["gap_duration"]["value"]
                # print("Gaptime updated to ", self.gaptime)
        else:
            print(f"Failed to retrieve entity: {response.status_code}")
            print(response.json())
        print("T: ", self.T)
        print("Mode: ", self.mode)
        print("Ptl: ", self.ptl)

    def general_cb_patch(self):
        url = link + self.id + "/attrs"
        data = {
            "mode": {"type": "Integer", "value": self.mode},
            "ptl": {"type": "Integer", "value": self.ptl},
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


if __name__ == "__main__":
    main()
# python -u "c:\Users\billy\OneDrive\ΗΜΤΥ\9ο ΕΞΑΜΗΝΟ\ΔΙΑΔΙΚΤΥΟ ΤΩΝ ΠΡΑΓΜΑΤΩΝ\PROJECT\Web\model\traffic_light_simulator.py"
