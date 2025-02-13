import paho.mqtt.client as mqtt
import requests
import json
import base64

# MQTT broker details
MQTT_BROKER = "150.140.186.118"
MQTT_PORT = 1883
MQTT_TOPIC = "v3_omada14_camera_1/reqStatus"

# Context Broker details
CONTEXT_BROKER_URL = "http://150.140.186.118:1026/v2/entities/v3_omada14_camera_1/attrs"
HEADERS = {"Content-Type": "application/json"}


# Function to read and encode image in base64
def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
    return encoded_string


# Callback when the client receives a CONNACK response from the server
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    # Subscribing to the topic
    client.subscribe(MQTT_TOPIC)


# Callback when a PUBLISH message is received from the server
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        pretty_payload = json.dumps(payload, indent=4)
        print(f"Topic: {msg.topic}\nMessage: {pretty_payload}")

        # Check if the requestStatus is "Requested"
        req_status = payload.get("requestStatus", {}).get("value", "")
        if req_status == "Requested":
            # Encode the image to base64
            image_base64_data = encode_image_to_base64("path/to/your/image.jpg")
            data = {
                "imageBase64": {
                    "type": "Text",
                    "value": image_base64_data,
                },
            }
            response = requests.patch(CONTEXT_BROKER_URL, json=data, headers=HEADERS)
            if response.status_code == 204:
                print("Successfully updated imageBase64 in Context Broker")
                # Update the requestStatus to "Answered"
                status_data = {
                    "requestStatus": {
                        "type": "Text",
                        "value": "Answered",
                    },
                }
                status_response = requests.patch(
                    CONTEXT_BROKER_URL, json=status_data, headers=HEADERS
                )
                if status_response.status_code == 204:
                    print("Successfully updated requestStatus to Answered")
                else:
                    print(
                        f"Failed to update requestStatus: {status_response.status_code} - {status_response.text}"
                    )
            else:
                print(
                    f"Failed to update imageBase64: {response.status_code} - {response.text}"
                )
    except json.JSONDecodeError:
        print(f"Topic: {msg.topic}\nMessage: {msg.payload.decode()}")


# Create an MQTT client instance
client = mqtt.Client()

# Assign the callback functions
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Start the MQTT client loop
client.loop_forever()
