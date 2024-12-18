# import requests
# import random


# ORION_URL = "http://150.140.186.118:1026/v2/subscriptions"
# SUBSCRIPTION_PAYLOAD = {
#     "description": "Diastavroseis",
#     "subject": {
#         "entities": [{"idPattern": "v1_omada14_fanari_0", "typePattern": ".*"}],
#     },
#     "notification": {"mqtt": {"url": "mqtt://150.140.186.118:1883", "topic": "fanari"}},
# }
# HEADERS = {"Content-Type": "application/json"}


# response = requests.post(ORION_URL, json=SUBSCRIPTION_PAYLOAD, headers=HEADERS)

# print(response.status_code)
# print(response.text)
import requests


ORION_URL = "http://150.140.186.118:1026/v2/subscriptions"
SUBSCRIPTION_PAYLOAD = {
    "description": "v1_fanaria",
    "subject": {
        "entities": [
            {"idPattern": "v1_omada14_fanari_0", "typePattern": "TrafficLight"},
            {
                "idPattern": "v1_omada14_diastavrosi_0",
                "typePattern": "v1_omada14_diastavrosi",
            },
        ]
    },
    "notification": {
        "mqtt": {"url": "mqtt://150.140.186.118:1883", "topic": "v1_fanaria"}
    },
}
HEADERS = {"Content-Type": "application/json"}


response = requests.post(ORION_URL, json=SUBSCRIPTION_PAYLOAD, headers=HEADERS)
