import requests

ORION_URL = "http://150.140.186.118:1026/v2/subscriptions"
HEADERS = {"Content-Type": "application/json"}

for i in range(20):
    SUBSCRIPTION_PAYLOAD = {
        "description": f"v3_omada14_fanari_{i}",
        "subject": {
            "entities": [
                {"idPattern": f"v3_omada14_fanari_{i}", "typePattern": "TrafficLight"},
            ]
        },
        "notification": {
            "mqtt": {
                "url": "mqtt://150.140.186.118:1883",
                "topic": f"v3_fanaria/v3_omada14_fanari_{i}",
            }
        },
    }

    # for i in range(5):
    #     SUBSCRIPTION_PAYLOAD = {
    #         "description": f"v3_omada14_diastavrosi_{i}",
    #         "subject": {
    #             "entities": [
    #                 {
    #                     "idPattern": f"v3_omada14_diastavrosi_{i}",
    #                     "typePattern": "v3_omada14_diastavrosi",
    #                 },
    #             ]
    #         },
    #         "notification": {
    #             "mqtt": {
    #                 "url": "mqtt://150.140.186.118:1883",
    #                 "topic": f"v3_fanaria/v3_omada14_diastavrosi_{i}",
    #             }
    #         },
    #     }

    response = requests.post(ORION_URL, json=SUBSCRIPTION_PAYLOAD, headers=HEADERS)
    print(f"Subscription {i} response: {response.status_code} - {response.text}")
