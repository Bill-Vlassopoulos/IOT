import json
import paho.mqtt.client as mqtt

# MQTT broker details
MQTT_BROKER = "150.140.186.118"
MQTT_PORT = 1883
MQTT_TOPIC = "v2_fanaria/#"  # Subscribe to all subtopics under v2_fanaria


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
    except json.JSONDecodeError:
        print(f"Topic: {msg.topic}\nMessage: {msg.payload.decode()}")


# Create an MQTT client instance
client = mqtt.Client()

# Assign the callback functions
client.on_connect = on_connect
client.on_message = on_message

# Connect to the MQTT broker
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Start the MQTT client loop to process network traffic and dispatch callbacks
client.loop_forever()
