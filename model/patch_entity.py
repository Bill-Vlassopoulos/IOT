import requests
from datetime import datetime, timezone
import time
import random

url = "http://150.140.186.118:1026/v2/entities/v3_omada14_diastavrosi_0/attrs"
# List of entity URLs
entity_urls = [
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_0/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_1/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_2/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_3/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_4/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_5/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_6/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_7/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_8/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_9/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_10/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_11/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_12/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_13/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_14/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_15/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_16/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_17/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_18/attrs",
    "http://150.140.186.118:1026/v2/entities/v3_omada14_fanari_19/attrs",
]

# Common headers for all requests
headers = {"Content-Type": "application/json"}


def patch_entity(url):
    # Get the current time in the required format
    current_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Generate a random value for waitingCars
    random_value = random.randint(1, 20)

    # Data payload for the PATCH request
    # data = {
    #     "waitingCars": {
    #         "type": "Integer",
    #         "value": random_value,
    #         "metadata": {"timestamp": {"type": "DateTime", "value": current_time}},
    #     }
    # }

    data = {
        "period": {"type": "StructuredValue", "value": {"duration": "20"}},
    }

    # Send the PATCH request
    try:
        response = requests.patch(url, json=data, headers=headers)
        if response.status_code == 204:
            print(f"Entity {url} updated successfully with waitingCars: {random_value}")
        else:
            print(f"Failed to update entity {url}: {response.status_code}")
            print(response.json())
    except Exception as e:
        print(f"Error while updating entity {url}: {e}")


patch_entity(url)  # Patch the first entity

# # Infinite loop to patch all entities every 30 seconds
# try:
#     while True:
#         for url in entity_urls:
#             patch_entity(url)  # Patch each entity
#         time.sleep(30)  # Wait for 30 seconds before the next round of patches
# except KeyboardInterrupt:
#     print("Script stopped by user.")
