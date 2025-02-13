import requests

# Context Broker URL
url = "http://150.140.186.118:1026/v2/entities"

# Headers
headers = {"Content-Type": "application/json"}

# Camera Entity Data
data = {
    "id": "v3_omada14_camera_1",
    "type": "Camera",
    "requestStatus": {
        "type": "Text",
        "value": "None",  # Initial state (None, Requested, Answered)
    },
    "imageBase64": {
        "type": "Text",
        "value": "",  # Initially empty, stores Base64 image
    },
}

# Send the request
response = requests.post(url, json=data, headers=headers)

# Print response
print(response.status_code, response.text)
