import requests

ORION_URL = "http://150.140.186.118:1026/v2/subscriptions"
HEADERS = {"Content-Type": "application/json"}

# Define the camera ID and the MQTT topic
camera_id = "v3_omada14_camera_1"
mqtt_topic = f"{camera_id}/requestStatus"

# Subscription payload for the camera entity
SUBSCRIPTION_PAYLOAD = {
    "description": f"Subscription to {camera_id} requestStatus",
    "subject": {
        "entities": [
            {"id": camera_id, "type": "Camera"},
        ],
        "condition": {
            "attrs": ["requestStatus"],
            "expression": {"q": "requestStatus==Requested"},
        },
    },
    "notification": {
        "mqtt": {
            "url": "mqtt://150.140.186.118:1883",
            "topic": mqtt_topic,
        },
        "attrs": ["requestStatus"],
    },
}

# Send the subscription request
response = requests.post(ORION_URL, json=SUBSCRIPTION_PAYLOAD, headers=HEADERS)
print(f"Subscription response: {response.status_code} - {response.text}")
