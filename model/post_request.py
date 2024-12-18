import requests

# http://150.140.186.118:1026/v2/entities/v2_omada14_fanari_0

url = "http://150.140.186.118:1026/v2/entities"
headers = {"Content-Type": "application/json"}

juction_locations = [
    (38.28689, 21.787373, "Διαστάρωση Πανεπιστημίου Πατρών"),
    (38.286372, 21.774256, "Τόφαλος 1"),
    (38.282599, 21.771536, "Τόφαλος 2"),
    (38.302055, 21.780824, "Ζαίμη"),
    (38.289022, 21.768183, "Σικίνου"),
]

traffic_lights = [
    (38.286996, 21.787494, "Φανάρι 1", 1),
    (38.286981, 21.787217, "Φανάρι 2", 1),
    (38.286845, 21.787206, "Φανάρι 3", 1),
    (38.286805, 21.787362, "Φανάρι 4", 1),
    (38.286471, 21.774371, "Φανάρι 1", 2),
    (38.286327, 21.774394, "Φανάρι 2", 2),
    (38.286299, 21.774248, "Φανάρι 3", 2),
    (38.286403, 21.774191, "Φανάρι 4", 2),
    (38.282501, 21.771518, "Φανάρι 1", 3),
    (38.282539, 21.771629, "Φανάρι 2", 3),
    (38.282639, 21.771593, "Φανάρι 3", 3),
    (38.282608, 21.771444, "Φανάρι 4", 3),
    (38.302139, 21.780937, "Φανάρι 1", 4),
    (38.301965, 21.780922, "Φανάρι 2", 4),
    (38.301972, 21.780745, "Φανάρι 3", 4),
    (38.302097, 21.780763, "Φανάρι 4", 4),
    (38.289115, 21.768258, "Φανάρι 1", 5),
    (38.288937, 21.768398, "Φανάρι 2", 5),
    (38.289063, 21.768091, "Φανάρι 3", 5),
    (38.288906, 21.768098, "Φανάρι 4", 5),
]

fanari_id = 0
max_diastavroseis = 5

for diastavrosi_id in range(0, max_diastavroseis):
    lista_apo_fanaria = []
    for i in range(0, 4):
        lista_apo_fanaria.append("v2_omada14_fanari_" + str(fanari_id))
        #### fanari creation
        data = {
            "id": "v2_omada14_fanari_" + str(fanari_id),
            "type": "TrafficLight",
            "title": {"type": "Text", "value": traffic_lights[fanari_id][2]},
            "location": {
                "type": "geo:json",
                "value": {
                    "type": "Point",
                    "coordinates": [
                        traffic_lights[fanari_id][0],
                        traffic_lights[fanari_id][1],
                    ],
                },
            },
            "waitingCars": {
                "type": "Integer",
                "value": 15,
                "metadata": {
                    "timestamp": {"type": "DateTime", "value": "2024-12-17T15:30:00Z"}
                },
            },
            "waitingPedestrians": {
                "type": "Integer",
                "value": 2,
                "metadata": {
                    "timestamp": {"type": "DateTime", "value": "2024-12-17T15:30:00Z"}
                },
            },
            "schedule": {
                "type": "StructuredValue",
                "value": [
                    {
                        "phase": "Green",
                        "startTime": "2024-12-17T15:30:00Z",
                        "endTime": "2024-12-17T15:30:30Z",
                    },
                    {
                        "phase": "Orange",
                        "startTime": "2024-12-17T15:30:30Z",
                        "endTime": "2024-12-17T15:30:35Z",
                    },
                    {
                        "phase": "Red",
                        "startTime": "2024-12-17T15:30:35Z",
                        "endTime": "2024-12-17T15:31:00Z",
                    },
                ],
            },

            "violations":{
                "type": "Integer",
                "value": 1,
                "metadata": {
                    "timestamp": {"type": "DateTime", "value": "2024-12-17T15:30:00Z"}
                },
            }
        }

        response = requests.post(url, json=data, headers=headers)
        print(response.text)
        ####

        fanari_id += 1
    data = {
        "id": "v2_omada14_diastavrosi_" + str(diastavrosi_id),
        "type": "v2_omada14_diastavrosi",
        "title": {"type": "Text", "value": juction_locations[diastavrosi_id][2]},
        "fanaria": {"type": "list", "value": lista_apo_fanaria},
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [
                    juction_locations[diastavrosi_id][0],
                    juction_locations[diastavrosi_id][1],
                ],
            },
        },
        "period": {"type": "StructuredValue", "value": {"duration": "PT60S"}},
    }

    response = requests.post(url, json=data, headers=headers)
    print(response.text)
