import requests

ORION_URL = "http://150.140.186.118:1026/v2/subscriptions"
HEADERS = {"Content-Type": "application/json"}

for i in range(20):
    SUBSCRIPTION_PAYLOAD = {
        "description": f"v2_omada14_fanari_{i}",
        "subject": {
            "entities": [
                {"idPattern": f"v2_omada14_fanari_{i}", "typePattern": "TrafficLight"},
            ]
        },
        "notification": {
            "mqtt": {
                "url": "mqtt://150.140.186.118:1883",
                "topic": f"v2_fanaria/v2_omada14_fanari_{i}",
            }
        },
    }

    response = requests.post(ORION_URL, json=SUBSCRIPTION_PAYLOAD, headers=HEADERS)
    print(f"Subscription {i} response: {response.status_code} - {response.text}")
