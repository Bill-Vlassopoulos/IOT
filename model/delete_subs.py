import requests

ORION_URL = "http://150.140.186.118:1026/v2/subscriptions"
HEADERS = {"Content-Type": "application/json"}

# Get existing subscriptions
response = requests.get(ORION_URL, headers=HEADERS)
existing_subscriptions = response.json()

# Delete subscriptions related to v3_fanaria topic and its subtopics
for sub in existing_subscriptions:
    if "notification" in sub and "mqtt" in sub["notification"]:
        topic = sub["notification"]["mqtt"]["topic"]
        if topic.startswith("v3_fanaria"):
            sub_id = sub["id"]
            delete_url = f"{ORION_URL}/{sub_id}"
            response = requests.delete(delete_url, headers=HEADERS)
            print(
                f"Deleted subscription {sub_id} with topic {topic}: {response.status_code} - {response.text}"
            )
