import mqtt from "mqtt";

// MQTT broker details
const MQTT_BROKER = "mqtt://150.140.186.118:1883";
let currentTopic = "v2_fanaria/v2_omada14_fanari_0"; // Initial topic to subscribe to

// Create an MQTT client instance
const client = mqtt.connect(MQTT_BROKER);

// Callback when the client connects to the broker
client.on("connect", () => {
  console.log("Connected to MQTT broker");
  // Subscribe to the initial topic
  subscribeToTopic(currentTopic);
});

// Function to subscribe to a topic
export function subscribeToTopic(topic) {
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log(`Subscribed to topic: ${topic}`);
    } else {
      console.error(`Failed to subscribe to topic: ${topic}`, err);
    }
  });
}

// Function to unsubscribe from a topic
export function unsubscribeFromTopic(topic) {
  client.unsubscribe(topic, (err) => {
    if (!err) {
      console.log(`Unsubscribed from topic: ${topic}`);
    } else {
      console.error(`Failed to unsubscribe from topic: ${topic}`, err);
    }
  });
}

// Callback when a message is received
client.on("message", (topic, message) => {
  try {
    // const payload = JSON.parse(message.toString());
    console.log(
      `Topic: ${topic}\nMessage: There is a change in topic ${topic}`
    );
  } catch (error) {
    console.error(`Failed to parse message on topic: ${topic}`, error);
  }
});

// Example function to change subscription to a new fanari
function changeSubscription(newFanariId) {
  const newTopic = `v2_fanaria/v2_omada14_fanari_${newFanariId}`;
  unsubscribeFromTopic(currentTopic);
  currentTopic = newTopic;
  subscribeToTopic(currentTopic);
}

// Example usage: Change subscription to fanari 1 after 10 seconds
setTimeout(() => {
  changeSubscription(1);
}, 10000);
