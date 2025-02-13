import requests

# Context Broker URL
CONTEXT_BROKER_URL = "http://150.140.186.118:1026/v2/entities/v3_omada14_camera_1/attrs"
HEADERS = {"Content-Type": "application/json"}

# Data payload to update the imageBase64 to an empty string
data = {
    "imageBase64": {
        "type": "Text",
        "value": "",
    },
}


# Function to patch the imageBase64
def patch_image_base64():
    try:
        response = requests.patch(CONTEXT_BROKER_URL, json=data, headers=HEADERS)
        if response.status_code == 204:
            print("Successfully updated imageBase64 to an empty string")
        else:
            print(
                f"Failed to update imageBase64: {response.status_code} - {response.text}"
            )
    except Exception as e:
        print(f"Error while updating imageBase64: {e}")


# Run the function
if __name__ == "__main__":
    patch_image_base64()
