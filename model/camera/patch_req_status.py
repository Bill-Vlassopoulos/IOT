import requests

# Context Broker URL
CONTEXT_BROKER_URL = "http://150.140.186.118:1026/v2/entities/v3_omada14_camera_1/attrs"
HEADERS = {"Content-Type": "application/json"}

# Data payload to update the requestStatus to "None"
data = {
    "requestStatus": {
        "type": "Text",
        "value": "None",
    },
}


# Function to patch the requestStatus
def patch_request_status():
    try:
        response = requests.patch(CONTEXT_BROKER_URL, json=data, headers=HEADERS)
        if response.status_code == 204:
            print("Successfully updated requestStatus to None")
        else:
            print(
                f"Failed to update requestStatus: {response.status_code} - {response.text}"
            )
    except Exception as e:
        print(f"Error while updating requestStatus: {e}")


# Run the function
if __name__ == "__main__":
    patch_request_status()
