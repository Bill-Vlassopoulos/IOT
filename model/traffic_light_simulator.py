import random
import datetime


def main():
    # Traffic Lights
    fanari_0 = Traffic_Light("v2_omada14_fanari_0", "Φανάρι 0")
    fanari_1 = Traffic_Light("v2_omada14_fanari_1", "Φανάρι 1")
    fanari_2 = Traffic_Light("v2_omada14_fanari_2", "Φανάρι 2")
    fanari_3 = Traffic_Light("v2_omada14_fanari_3", "Φανάρι 3")
    fanari_4 = Traffic_Light("v2_omada14_fanari_4", "Φανάρι 0")
    fanari_5 = Traffic_Light("v2_omada14_fanari_5", "Φανάρι 1")
    fanari_6 = Traffic_Light("v2_omada14_fanari_6", "Φανάρι 2")
    fanari_7 = Traffic_Light("v2_omada14_fanari_7", "Φανάρι 3")
    fanari_8 = Traffic_Light("v2_omada14_fanari_8", "Φανάρι 0")
    fanari_9 = Traffic_Light("v2_omada14_fanari_9", "Φανάρι 1")
    fanari_10 = Traffic_Light("v2_omada14_fanari_10", "Φανάρι 2")
    fanari_11 = Traffic_Light("v2_omada14_fanari_11", "Φανάρι 3")
    fanari_12 = Traffic_Light("v2_omada14_fanari_12", "Φανάρι 0")
    fanari_13 = Traffic_Light("v2_omada14_fanari_13", "Φανάρι 1")
    fanari_14 = Traffic_Light("v2_omada14_fanari_14", "Φανάρι 2")
    fanari_15 = Traffic_Light("v2_omada14_fanari_15", "Φανάρι 3")
    fanari_16 = Traffic_Light("v2_omada14_fanari_16", "Φανάρι 0")
    fanari_17 = Traffic_Light("v2_omada14_fanari_17", "Φανάρι 1")
    fanari_18 = Traffic_Light("v2_omada14_fanari_18", "Φανάρι 2")
    fanari_19 = Traffic_Light("v2_omada14_fanari_19", "Φανάρι 3")

    # Junction 0 Πανεπιστήμιο Πατρών
    junction_0 = Traffic_Juction("v2_omada14_diastavrosi_0", "Πανεπιστήμιο Πατρών")
    junction_0.add_traffic_light(fanari_0)
    junction_0.add_traffic_light(fanari_1)
    junction_0.add_traffic_light(fanari_2)
    junction_0.add_traffic_light(fanari_3)

    # Junction 1 Τόφαλος 1
    junction_1 = Traffic_Juction("v2_omada14_diastavrosi_1", "Τόφαλος 1")
    junction_1.add_traffic_light(fanari_4)
    junction_1.add_traffic_light(fanari_5)
    junction_1.add_traffic_light(fanari_6)
    junction_1.add_traffic_light(fanari_7)

    # Junction 2 Τόφαλος 2
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


def _time(starttime, endtime):
    return {"starttime": starttime, "endtime": endtime}


class Traffic_Light:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.waiting_vehicles = {"cars": 0, "bikes": 0, "buses": 0, "trucks": 0}
        self.traffic_light_time = {
            "redtime": {"starttime": None, "endtime": None},
            "greentime": {"starttime": None, "endtime": None},
            "orangetime": {"starttime": None, "endtime": None},
        }

    def get_waiting_vehicles(self):
        return self.waiting_vehicles

    def get_sum_waiting_vehicles(self):
        return sum(self.waiting_vehicles.values())

    def set_random_waiting_vehicles(self):
        self.waiting_vehicles = {
            "cars": random.randint(1, 10),
            "bikes": random.randint(1, 10),
            "buses": random.randint(1, 10),
            "trucks": random.randint(1, 10),
        }

    def set_traffic_light_time(self, redtime, greentime, orangetime):
        self.traffic_light_time = {
            "redtime": redtime,
            "greentime": greentime,
            "orangetime": orangetime,
        }


class Traffic_Juction:
    def __init__(self, id, name, T=60):
        self.id = id
        self.name = name
        self.T = T
        self.traffic_lights = []

    def add_traffic_light(self, traffic_light):
        self.traffic_lights.append(traffic_light)

    def traffic_lights_schedule(self):
        gaptime = 2
        orangetime = 2
        overall_green_time = (
            self.T - len(self.traffic_lights) * (orangetime) - 5 * gaptime
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

        all_times = all_vehicles
        timeframes = {}
        previous_time = datetime.timedelta(seconds=0)
        for key in all_times:
            timeframes[key] = {
                "greentime": _time(
                    datetime.datetime.now() + previous_time,
                    datetime.datetime.now()
                    + datetime.timedelta(seconds=all_times[key]),
                ),
            }
            previous_time = datetime.datetime.now() + datetime.timedelta(
                seconds=all_times[key]
            )


if __name__ == "__main__":
    main()
