import requests
from datetime import datetime


# Get the current time in the required format
current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

url= "http://150.140.186.118:1026/v2/entities/v2_omada14_fanari_4/attrs"
#url= "http://150.140.186.118:1026/v2/entities/v2_omada14_diastavrosi_0/attrs"

headers = {
    "Content-Type": "application/json"
}

data = {
    "waitingCars": {
                "type": "Integer",
                "value": 15,
                "metadata": {
                    "timestamp": {"type": "DateTime", "value": current_time}
                },
            }
}

# data={
#      "period": {"type": "StructuredValue", "value": {"duration": "PT40S"}}
# }

response = requests.patch(url, json=data, headers=headers)

if response.status_code == 204:
    print("Entity updated successfully!")
else:
    print(f"Failed to update entity: {response.status_code}")
    print(response.json())
