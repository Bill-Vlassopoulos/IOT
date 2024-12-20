const MQTT_BROKER = "ws://150.140.186.118:9001/mqtt"; // WebSocket URL for MQTT
let currentTopic = "v2_fanaria/v2_omada14_fanari_14"; // Initial topic to subscribe to

// Create a new MQTT client instance
const client = new Paho.MQTT.Client(MQTT_BROKER, "clientId");

// Define the callback when the client connects to the broker
client.onConnect = function () {
    console.log("Connected to MQTT broker");
    // Subscribe to the initial topic
    subscribeToTopic(currentTopic);
};

// Define the callback for when a message is received
client.onMessageArrived = function (message) {
    console.log("Message received:", message.payloadString);
    console.log("Topic:", message.destinationName);
};

// Callback for when the connection is lost
client.onConnectionLost = function (responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost: " + responseObject.errorMessage);
    }
};

// Function to subscribe to a topic
function subscribeToTopic(topic) {
    client.subscribe(topic, {
        onSuccess: function () {
            console.log(`Subscribed to topic: ${topic}`);
        },
        onFailure: function (err) {
            console.error(`Failed to subscribe to topic: ${topic}`, err);
        }
    });
}

// Function to unsubscribe from a topic
function unsubscribeFromTopic(topic) {
    client.unsubscribe(topic, {
        onSuccess: function () {
            console.log(`Unsubscribed from topic: ${topic}`);
        },
        onFailure: function (err) {
            console.error(`Failed to unsubscribe from topic: ${topic}`, err);
        }
    });
}

// Set up the connection options
const options = {
    onSuccess: client.onConnect,
    onFailure: function (e) {
        console.log("Failed to connect:", e);
    }
};

// Connect to the broker
client.connect(options);

// Example usage: Subscribe to a new topic after 10 seconds
setTimeout(() => {
    const newTopic = "v2_fanaria/v2_omada14_fanari_15";
    unsubscribeFromTopic(currentTopic);
    currentTopic = newTopic;
    subscribeToTopic(currentTopic);
}, 10000);