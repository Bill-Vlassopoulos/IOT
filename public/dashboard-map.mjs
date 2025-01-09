// ---------------------------------------GLOBAL VARIABLES-------------------------------------

const MQTT_BROKER = "ws://150.140.186.118:9001/mqtt"; // WebSocket URL for MQTT
//let currentTopic = "v3_fanaria/v3_omada14_fanari_14"; // Initial topic to subscribe to

let junction_locations = [];
let traffic_lights = [];
let lastclickedtrafficlight = {};
let currentJunctionId = null;
let currentTrafficLightId = null;

var lastClickedMarker = null;
var trafficLightMarkers = [];
const goBackButton = document.getElementById("goBack");
const dashboardbtn = document.getElementById("openDashboard");
let markers = [];
let updateIconInterval;

const dashboard = document.getElementById("dashboard");
const openDashboardBtn = document.getElementById("openDashboard");
const closeDashboardBtn = document.getElementById("closeDashboard");
const mapElement = document.getElementById("map");

//--------------------------------ICONS------------------------------------

var defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var trafficLightIcon = L.icon({
  iconUrl: "traffic-light.png",
  iconSize: [25, 30], // Adjust the size as needed
  iconAnchor: [7, 30],
  popupAnchor: [4, -30],
  shadowSize: [25, 25],
});

var junctionIcon = L.icon({
  iconUrl: "junction.png",
  iconSize: [80, 80], // Adjust the size as needed
  iconAnchor: [7, 30],
  popupAnchor: [4, -30],
  shadowSize: [25, 25],
});

var greenIcon = L.icon({
  iconUrl: "green_traffic_light.png",
  iconSize: [15, 25], // Adjust the size as needed
  iconAnchor: [7, 30],
  popupAnchor: [4, -30],
  shadowSize: [25, 25],
});

var orangeIcon = L.icon({
  iconUrl: "orange_traffic_light.png",
  iconSize: [12, 25], // Adjust the size as needed
  iconAnchor: [7, 30],
  popupAnchor: [4, -30],
  shadowSize: [25, 25],
});

var redIcon = L.icon({
  iconUrl: "red_traffic_light.png",
  iconSize: [10, 25], // Adjust the size as needed
  iconAnchor: [7, 30],
  popupAnchor: [4, -30],
  shadowSize: [25, 25],
});
// -----------------------------------------------------------------------

// -----------------------------------MQTT--------------------------------
const client = new Paho.MQTT.Client(MQTT_BROKER, "clientId");

// Define the callback when the client connects to the broker
client.onConnect = function () {
  console.log("Connected to MQTT broker");
  // Subscribe to the initial topic
  //subscribeToTopic(currentTopic);
};

// Define the callback for when a message is received
client.onMessageArrived = function (message) {
  console.log("Topic:", message.destinationName);
  console.log("Something changed");
  //console.log("New Schedule:", message.payloadString);

  const jsonData = JSON.parse(message.payloadString);
  const trafficLightData = jsonData.data[0]; // Assuming you want the first traffic light in the data array
  const schedule = trafficLightData.schedule.value;

  console.log("Schedule:", schedule);

  if (message.destinationName.includes(`${trafficLightData.id.value}`)) {
    traffic_lights.find((tl) => tl.id === trafficLightData.id.value).schedule =
      schedule;
  }

  if (dashboard.classList.contains("visible")) {
    fetchTrafficDataAndUpdateDashboard(
      currentJunctionId,
      currentTrafficLightId
    );
  }
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
    },
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
    },
  });
}

// Set up the connection options
const options = {
  onSuccess: client.onConnect,
  onFailure: function (e) {
    console.log("Failed to connect:", e);
  },
};

// Connect to the broker
client.connect(options);
//[38.266639, 21.798573]
// --------------------------------------------------------------------

// -------------------MAP---------------------------

var map = L.map("map").setView([38.286366, 21.797975], 14); // Coordinates for Patras, Greece

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// -----------------------------------------------------

// ---------------------------------------------------------------------
fetchJunctions();
junction_locations = fetchJunctionLocations();
console.log(junction_locations);
putJunctionmarkers(junction_locations);

putTrafficLightMarkers();
for (marker of markers) {
  marker.on("click", function () {
    updateIconInterval = setIntervaltoUpdateTrafficLightStatus();
  });
}
// Reset map to initial state
goBackButton.addEventListener("click", function () {
  map.flyTo([38.286366, 21.797975], 14);
  unsubscribeFromTopic("v3_fanaria/#");

  markers.forEach(function (marker) {
    marker.addTo(map);
  });

  trafficLightMarkers.forEach(function (tlMarker) {
    map.removeLayer(tlMarker);
  });
  trafficLightMarkers = [];

  if (lastClickedMarker) {
    lastClickedMarker.setIcon(junctionIcon);
  }
  lastClickedMarker = null;

  goBackButton.classList.add("hidden");
  dashboardbtn.classList.add("hidden");
  clearInterval(updateIconInterval);
});

// Show the dashboard
openDashboardBtn.addEventListener("click", () => {
  console.log(lastclickedtrafficlight);
  fetchTrafficDataAndUpdateDashboard(currentJunctionId, currentTrafficLightId);

  dashboard.classList.add("visible");
  mapElement.classList.add("map-blurred");
  openDashboardBtn.classList.add("hidden");
  goBackButton.classList.add("hidden");

  updateInterval = setInterval(updateTrafficLightColor, 1000);
});

// Hide the dashboard
closeDashboardBtn.addEventListener("click", () => {
  unsubscribeFromTopic(`v3_fanaria/${currentTrafficLightId}`);
  dashboard.classList.remove("visible");
  mapElement.classList.remove("map-blurred");
  openDashboardBtn.classList.remove("hidden");
  goBackButton.classList.remove("hidden");

  clearInterval(updateInterval);
});

function getIconBasedOnSchedule(schedule) {
  const currentTime = new Date();
  const greeceOffset = 2 * 60; // Greece is UTC+2
  const greeceTime = new Date(currentTime.getTime() + greeceOffset * 60 * 1000);
  const currentISOTime = greeceTime.toISOString();
  const greenStartTime = schedule[0]["startTime"];
  const greenEndTime = schedule[0]["endTime"];
  const orangeStartTime = schedule[1]["startTime"];
  const orangeEndTime = schedule[1]["endTime"];

  if (currentISOTime >= greenStartTime && currentISOTime < greenEndTime) {
    return greenIcon;
  } else if (
    currentISOTime >= orangeStartTime &&
    currentISOTime < orangeEndTime
  ) {
    return orangeIcon;
  } else {
    return redIcon;
  }
}

async function initMap() {
  junction_locations = await fetchJunctionLocations();
  console.log(junction_locations);
  putJunctionmarkers(junction_locations);
}

async function fetchJunctionLocations() {
  try {
    const response = await fetch("/api/junctions");
    const data = await response.json();
    const locations = data.junctions;

    return locations;
  } catch (error) {
    console.error("Error fetching junctions: ", error);
  }
}

function putJunctionmarkers(locations) {
  for (location of locations) {
    const marker = L.marker([location.lat, location.lng], {
      icon: junctionIcon,
    })
      .addTo(map)
      .bindPopup(location.title)
      .on("click", async function () {
        if (lastClickedMarker) {
          lastClickedMarker.setIcon(junctionIcon);
          trafficLightMarkers.forEach(function (tlMarker) {
            map.removeLayer(tlMarker);
          });
          trafficLightMarkers = [];
          //clearInterval(updateIconInterval); // Clear previous interval
        }

        lastClickedMarker = marker;
        map.flyTo([location.lat, location.lng], 18);
        currentJunctionId = location.id;
        console.log("Current Junction ID:", currentJunctionId);
      });
    markers.push(marker);
  }
  map.removeLayer(marker);
  goBackButton.classList.remove("hidden");
}

async function fetchTrafficLight(junctionId) {
  try {
    const response = await fetch(`/api/traffic-lights/${junctionId}`);
    const data = await response.json();
    const trafficLights = data.trafficLights;

    traffic_lights = trafficLights;
  } catch (error) {
    console.error("Error fetching traffic lights: ", error);
  }
}

function putTrafficLightMarkers() {
  for (marker of markers) {
    marker.on("click", () => {
      fetchTrafficLight(currentJunctionId);
      traffic_lights.forEach((tl) => {
        const tlMarker = L.marker([tl.lat, tl.lng], {
          icon: getIconBasedOnSchedule(tl.schedule),
        })
          .addTo(map)
          .bindPopup(` ${tl.title}`)
          .on("click", function () {
            dashboardbtn.classList.remove("hidden");
            lastclickedtrafficlight = {
              junction: currentJunctionId,
              trafficLight: tl.id,
            };

            currentTrafficLightId = tl.id;
            console.log("Current Traffic Light ID:", currentTrafficLightId);
          });

        trafficLightMarkers.push(tlMarker);
      });
    });
  }
}

// Function to update the traffic light status every second
function setIntervaltoUpdateTrafficLightStatus() {
  setInterval(() => {
    trafficLights.forEach((tl, index) => {
      const icon = getIconBasedOnSchedule(tl.schedule);
      trafficLightMarkers[index].setIcon(icon);
    });
  }, 1000);
}

// async function fetchJunctions() {
//   try {
//     const response = await fetch("/api/junctions");
//     const data = await response.json();
//     const locations = data.junctions;

//     for (const location of locations) {
//       const marker = L.marker([location.lat, location.lng], {
//         icon: junctionIcon,
//       })
//         .addTo(map)
//         .bindPopup(location.title)
//         .on("click", async function () {
//           if (lastClickedMarker) {
//             lastClickedMarker.setIcon(junctionIcon);
//             trafficLightMarkers.forEach(function (tlMarker) {
//               map.removeLayer(tlMarker);
//             });
//             trafficLightMarkers = [];
//             clearInterval(updateIconInterval); // Clear previous interval
//           }

//           lastClickedMarker = marker;
//           map.flyTo([location.lat, location.lng], 18);
//           currentJunctionId = location.id;
//           console.log("Current Junction ID:", currentJunctionId);
//           //subscribeToTopic(`v3_fanaria/${currentJunctionId}`);

//           try {
//             const response = await fetch(`/api/traffic-lights/${location.id}`);
//             const tlData = await response.json();
//             const trafficLights = tlData.trafficLights;

//             trafficLights.forEach(function (tl) {
//               console.log("Traffic Light Schedule:", tl.schedule);
//               subscribeToTopic(`v3_fanaria/${tl.id}`);
//               const tlMarker = L.marker([tl.lat, tl.lng], {
//                 icon: getIconBasedOnSchedule(tl.schedule),
//               })
//                 .addTo(map)
//                 .bindPopup(` ${tl.title}`)
//                 .on("click", function () {
//                   dashboardbtn.classList.remove("hidden");
//                   lastclickedtrafficlight = {
//                     junction: location.id,
//                     trafficLight: tl.id,
//                   };

//                   currentTrafficLightId = tl.id;
//                   console.log(
//                     "Current Traffic Light ID:",
//                     currentTrafficLightId
//                   );
//                 });

//               trafficLightMarkers.push(tlMarker);
//             });

//             // Start updating traffic light status every second
//             updateIconInterval = setInterval(() => {
//               trafficLights.forEach((tl, index) => {
//                 const icon = getIconBasedOnSchedule(tl.schedule);
//                 trafficLightMarkers[index].setIcon(icon);
//               });
//             }, 1000);
//           } catch (error) {
//             console.error("Error fetching traffic lights: ", error);
//           }

//           map.removeLayer(marker);
//           goBackButton.classList.remove("hidden");
//         });
//       markers.push(marker);
//     }
//   } catch (error) {
//     console.error("Error fetching junctions: ", error);
//   }
// }

async function fetchTrafficDataAndUpdateDashboard(junctionId, trafficLightId) {
  //subscribeToTopic(`v3_fanaria/${trafficLightId}`);

  try {
    // Fetch traffic info from the backend
    const response = await fetch(
      `/api/traffic-info/${junctionId}/${trafficLightId}`
    );
    const data = await response.json();

    console.log(data);
    if (data.success) {
      const trafficInfo = data.data; // Array of traffic data for the traffic light

      console.log(trafficInfo);
      document.getElementById("waiting-cars").textContent =
        trafficInfo["waiting-cars"];
      document.getElementById("violations").textContent =
        trafficInfo["violations"];

      console.log(trafficInfo["colors"]);
      const greenStartTime = trafficInfo["colors"][0].startTime;
      const greenEndTime = trafficInfo["colors"][0].endTime;
      const orangeStartTime = trafficInfo["colors"][1].startTime;
      const orangeEndTime = trafficInfo["colors"][1].endTime;

      // Store the traffic light color times globally
      window.trafficLightColorTimes = {
        greenStartTime,
        greenEndTime,
        orangeStartTime,
        orangeEndTime,
      };
    }
  } catch (error) {
    console.log("Error fetching data:", error);
  }
}

// Function to update the traffic chart with the new waiting cars data
function updateTrafficChart(waitingCars) {
  // Assuming trafficData is already defined globally for the chart
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Update the chart's dataset with the new waiting cars value at the current time slot
  trafficData.datasets[0].data[
    currentHour * 30 + Math.floor(currentMinutes / 2)
  ] = waitingCars;

  // Re-render the chart with the updated data
  const ctx = document.getElementById("trafficChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: trafficData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true, // Enable panning
            mode: "xy", // Allow horizontal panning only
          },
          zoom: {
            wheel: {
              enabled: true, // Enable zooming with mouse wheel
              mode: "x", // Zoom horizontally
            },
            pinch: {
              enabled: true, // Enable zooming with pinch gestures
              mode: "x", // Zoom horizontally
            },
            mode: "x", // Overall zoom mode
          },
        },
      },
    },
  });
}
const red_light = document.querySelector(".fanaraki #red_light");
const orange_light = document.querySelector(".fanaraki #orange_light");
const green_light = document.querySelector(".fanaraki #green_light");

function updateTrafficLightColor() {
  const currentTime = new Date();
  const greeceOffset = 2 * 60; // Greece is UTC+2
  const greeceTime = new Date(currentTime.getTime() + greeceOffset * 60 * 1000);
  const currentISOTime = greeceTime.toISOString();

  const { greenStartTime, greenEndTime, orangeStartTime, orangeEndTime } =
    window.trafficLightColorTimes || {};
  console.log("Green Start Time:", greenStartTime);
  console.log("Green End Time:", greenEndTime);

  if (currentISOTime >= greenStartTime && currentISOTime < greenEndTime) {
    green_light.style.backgroundColor = "green";
    orange_light.style.backgroundColor = "gray";
    red_light.style.backgroundColor = "gray";
  } else if (
    currentISOTime >= orangeStartTime &&
    currentISOTime < orangeEndTime
  ) {
    green_light.style.backgroundColor = "gray";
    orange_light.style.backgroundColor = "orange";
    red_light.style.backgroundColor = "gray";
  } else {
    green_light.style.backgroundColor = "gray";
    orange_light.style.backgroundColor = "gray";
    red_light.style.backgroundColor = "red";
  }
}
