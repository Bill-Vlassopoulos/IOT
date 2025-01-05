import requests
import json

url = "http://150.140.186.118:1026/v2/entities/v3_omada14_diastavrosi_0"
headers = {"Accept": "application/json"}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    entity = response.json()
    print("Full entity:")
    print(json.dumps(entity, indent=4))
    entity_id = entity["id"]
    # print(entity["period"]["value"]["duration"])
else:
    print(f"Failed to retrieve entity: {response.status_code}")
    print(response.json())
