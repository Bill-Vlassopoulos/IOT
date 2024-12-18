import requests


ORION_URL = "http://150.140.186.118:1026/v2/subscriptions"
SUBSCRIPTION_PAYLOAD = {
    "description": "fanaria",
    "subject": {
        "entities": [{"idPattern": "v1_omada14_fanari_0", "typePattern": "TrafficLight"}]
    },
        "entities": [{"idPattern": "v1_omada14_diastavrosi_0", "typePattern": "v1_omada14_diastavrosi"}],

    "notification": {
  "mqtt": {
    "url": "mqtt://150.140.186.118:1883",
    "topic": "fanaria"
  }
}
}
HEADERS = {"Content-Type": "application/json"}


response = requests.post(
    ORION_URL, json=SUBSCRIPTION_PAYLOAD, headers=HEADERS
)



