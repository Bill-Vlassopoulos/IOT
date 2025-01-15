//PORT
const PORT = 3000;

//MQTT
const MQTT_BROKER = "ws://150.140.186.118:9001/mqtt";

//CONTEXT BROKER
const headers = { "Content-Type": "application/json" };
const context_broker_link = "http://150.140.186.118:1026/v2/entities/";

//VARIABLES
let currentJunctionId = null;
var lastClickedMarker = null;
var trafficLightMarkers = [];
let trafficLights = [];
let trafficLightData = [];
let lastclickedtrafficlight = {};
var markers = [];

const goBackButton = document.getElementById("goBack");
const form = document.getElementById("form");
const mode = document.getElementById("mode");
const ptl = document.getElementById("ptl");
const period = document.getElementById("period_time");
const gap = document.getElementById("gap_time");
const orange = document.getElementById("orange_time");

let interval1, interval2, interval3, interval4;
let updateIntervals = [interval1, interval2, interval3, interval4];
let schedule1, schedule2, schedule3, schedule4;
let schedules = [schedule1, schedule2, schedule3, schedule4];

let title_fanari_1 = document.getElementById("fanari_1");
let title_fanari_2 = document.getElementById("fanari_2");
let title_fanari_3 = document.getElementById("fanari_3");
let title_fanari_4 = document.getElementById("fanari_4");

let title_pososto_fanari_1 = document.getElementById("pososto_fanari1");
let title_pososto_fanari_2 = document.getElementById("pososto_fanari2");
let title_pososto_fanari_3 = document.getElementById("pososto_fanari3");
let title_pososto_fanari_4 = document.getElementById("pososto_fanari4");

const sliders = [
  {
    slider: document.getElementById("slider_fanari1"),
    output: document.getElementById("percentage_fanari1"),
  },
  {
    slider: document.getElementById("slider_fanari2"),
    output: document.getElementById("percentage_fanari2"),
  },
  {
    slider: document.getElementById("slider_fanari3"),
    output: document.getElementById("percentage_fanari3"),
  },
  {
    slider: document.getElementById("slider_fanari4"),
    output: document.getElementById("percentage_fanari4"),
  },
];

const fanarakia = [
  {
    green_light: document.getElementById("green_light1"),
    orange_light: document.getElementById("orange_light1"),
    red_light: document.getElementById("red_light1"),
  },
  {
    green_light: document.getElementById("green_light2"),
    orange_light: document.getElementById("orange_light2"),
    red_light: document.getElementById("red_light2"),
  },
  {
    green_light: document.getElementById("green_light3"),
    orange_light: document.getElementById("orange_light3"),
    red_light: document.getElementById("red_light3"),
  },
  {
    green_light: document.getElementById("green_light4"),
    orange_light: document.getElementById("orange_light4"),
    red_light: document.getElementById("red_light4"),
  },
];

//ICONS

var defaultIcon = L.icon({
  iconUrl: "pngwing.com.png",
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

//MQTT CONNECTION

const client = new Paho.MQTT.Client(MQTT_BROKER, "clientId");

client.onConnect = function () {
  console.log("Connected to MQTT broker");
  // Subscribe to the initial topic
  //subscribeToTopic(currentTopic);
};

client.onMessageArrived = function (message) {
  console.log("Topic:", message.destinationName);
  console.log("Something changed");
  // console.log("Message:", message.payloadString);

  const jsonData = JSON.parse(message.payloadString);
  const trafficLightData = jsonData.data[0];

  console.log("Traffic Light title:", trafficLightData.title.value);
  let title = trafficLightData.title.value;
  let schedule = trafficLightData.schedule.value;

  if (title === "Φανάρι 1") {
    schedules[0] = schedule;
    updateTrafficLightColor(
      schedule,
      fanarakia[0].green_light,
      fanarakia[0].orange_light,
      fanarakia[0].red_light
    );
    console.log("Updated Fanari 1");
  } else if (title === "Φανάρι 2") {
    schedules[1] = schedule;
    updateTrafficLightColor(
      schedule,
      fanarakia[1].green_light,
      fanarakia[1].orange_light,
      fanarakia[1].red_light
    );
    console.log("Updated Fanari 2");
  } else if (title === "Φανάρι 3") {
    schedules[2] = schedule;
    updateTrafficLightColor(
      schedule,
      fanarakia[2].green_light,
      fanarakia[2].orange_light,
      fanarakia[2].red_light
    );
    console.log("Updated Fanari 3");
  } else if (title === "Φανάρι 4") {
    schedules[3] = schedule;
    updateTrafficLightColor(
      schedule,
      fanarakia[3].green_light,
      fanarakia[3].orange_light,
      fanarakia[3].red_light
    );
    console.log("Updated Fanari 4");
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

//MAP
const map = L.map("map").setView([38.292488, 21.789119], 13); // Coordinates for Patras, Greece

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

reset();

fetchJunctions(map);

const ctx = document.getElementById("myChart").getContext("2d");
const myChart = new Chart(ctx, {
  type: "line", // Change to 'line' for a line chart
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July"], // Example labels
    datasets: [
      {
        label: "Dataset 1",
        data: [], // Example data for the first line
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
      },
      {
        label: "Dataset 2",
        data: [], // Example data for the second line
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: false,
      },
      {
        label: "Dataset 3",
        data: [], // Example data for the third line
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
      {
        label: "Dataset 4",
        data: [], // Example data for the fourth line
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

//FUNCTIONS

async function fetchJunctions() {
  try {
    const response = await fetch("/api/junctions");
    const data = await response.json();
    const locations = data.junctions;

    locations.forEach(function (location, index) {
      var marker = L.marker([location.lat, location.lng], {
        icon: defaultIcon,
      })
        .addTo(map)
        .bindPopup(location.title)
        .on("click", async function () {
          if (lastClickedMarker) {
            lastClickedMarker.setIcon(defaultIcon);
            trafficLightMarkers.forEach(function (tlMarker) {
              map.removeLayer(tlMarker);
            });
            trafficLightMarkers = [];
          }

          lastClickedMarker = marker;
          map.flyTo([location.lat, location.lng], 18);
          currentJunctionId = location.id;
          console.log("Current Junction ID:", currentJunctionId);
          mode.checked = location.mode === 0 ? true : false;
          ptl.value = location.ptl;
          period.value = location.period;
          gap.value = location.gap_time;
          orange.value = location.orange_time;

          try {
            const tlData = await fetchTrafficLights(location.id);
            trafficLights = tlData.trafficLights;

            title_fanari_1.innerHTML = trafficLights[0].title;
            title_fanari_2.innerHTML = trafficLights[1].title;
            title_fanari_3.innerHTML = trafficLights[2].title;
            title_fanari_4.innerHTML = trafficLights[3].title;

            title_pososto_fanari_1.innerHTML = trafficLights[0].title;
            title_pososto_fanari_2.innerHTML = trafficLights[1].title;
            title_pososto_fanari_3.innerHTML = trafficLights[2].title;
            title_pososto_fanari_4.innerHTML = trafficLights[3].title;

            trafficLights.forEach(async function (tl) {
              subscribeToTopic(`v3_fanaria/${tl.id}`);
              console.log("Scheduled:", tl.schedule);

              let lightdata = await fetchTrafficLightData(tl.id);
              //console.log(lightdata);

              trafficLightData.push({
                id: tl.id,
                data: lightdata.data,
              });

              //console.log(trafficLightData);

              if (tl.title === "Φανάρι 1") {
                schedules[0] = tl.schedule;
                sliders[0].slider.value = location.pososta[0][tl.id];
                updateTrafficLightColor(
                  schedules[0],
                  fanarakia[0].green_light,
                  fanarakia[0].orange_light,
                  fanarakia[0].red_light
                );
              } else if (tl.title === "Φανάρι 2") {
                schedules[1] = tl.schedule;
                sliders[1].slider.value = location.pososta[1][tl.id];
                updateTrafficLightColor(
                  schedules[1],
                  fanarakia[1].green_light,
                  fanarakia[1].orange_light,
                  fanarakia[1].red_light
                );
              } else if (tl.title === "Φανάρι 3") {
                schedules[2] = tl.schedule;
                sliders[2].slider.value = location.pososta[2][tl.id];
                updateTrafficLightColor(
                  schedules[2],
                  fanarakia[2].green_light,
                  fanarakia[2].orange_light,
                  fanarakia[2].red_light
                );
              } else if (tl.title === "Φανάρι 4") {
                schedules[3] = tl.schedule;
                sliders[3].slider.value = location.pososta[3][tl.id];
                updateTrafficLightColor(
                  schedules[3],
                  fanarakia[3].green_light,
                  fanarakia[3].orange_light,
                  fanarakia[3].red_light
                );
              }
              var tlMarker = L.marker([tl.lat, tl.lng], {
                icon: trafficLightIcon,
              })
                .addTo(map)
                .bindTooltip(tl.title)
                .on("click", function () {
                  lastclickedtrafficlight = {
                    junction: location.id,
                    trafficLight: tl.id,
                  };

                  currentTrafficLightId = tl.id;
                  console.log(
                    "Current Traffic Light ID:",
                    currentTrafficLightId
                  );
                });

              trafficLightMarkers.push(tlMarker);

              sliders.forEach(({ slider, output }) => {
                output.textContent = `${slider.value}%`;
              });

              let index;
              if (tl.title === "Φανάρι 1") {
                index = 0;
              } else if (tl.title === "Φανάρι 2") {
                index = 1;
              } else if (tl.title === "Φανάρι 3") {
                index = 2;
              } else if (tl.title === "Φανάρι 4") {
                index = 3;
              }

              if (index !== undefined) {
                updateIntervals[index] = setInterval(() => {
                  updateTrafficLightColor(
                    schedules[index],
                    fanarakia[index].green_light,
                    fanarakia[index].orange_light,
                    fanarakia[index].red_light
                  );
                }, 1000);
              }
            });
          } catch (error) {
            console.error("Error fetching traffic lights: ", error);
          }

          map.removeLayer(marker);
          goBackButton.classList.remove("hidden");
        });
      markers.push(marker);
    });
  } catch (error) {
    console.error("Error fetching junctions: ", error);
  }
}

async function fetchTrafficLights(locationId) {
  try {
    const response = await fetch(`/api/traffic-lights/${locationId}`);
    const tlData = await response.json();
    return tlData;
  } catch (error) {
    console.error("Error fetching traffic lights: ", error);
    throw error;
  }
}

async function fetchTrafficLightData(id) {
  try {
    const response = await fetch(`/api/traffic-info/${id}`);
    const tlData = await response.json();
    return tlData;
  } catch (error) {
    console.error("Error fetching traffic lights: ", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  sliders.forEach(({ slider, output }) => {
    slider.addEventListener("input", function () {
      output.textContent = `${slider.value}%`;
    });
  });
});

goBackButton.addEventListener("click", function () {
  unsubscribeFromTopic("v3_fanaria/#");
  map.flyTo([38.292488, 21.789119], 13);

  markers.forEach(function (marker) {
    marker.addTo(map);
  });

  trafficLightMarkers.forEach(function (tlMarker) {
    map.removeLayer(tlMarker);
  });
  trafficLightMarkers = [];

  if (lastClickedMarker) {
    lastClickedMarker.setIcon(defaultIcon);
  }
  lastClickedMarker = null;

  let interval;

  for (interval of updateIntervals) {
    clearInterval(interval);
  }

  reset();

  goBackButton.classList.add("hidden");
});

function updateTrafficLightColor(
  schedule,
  green_light,
  orange_light,
  red_light
) {
  const currentTime = new Date();
  const greeceOffset = 2 * 60; // Greece is UTC+2
  const greeceTime = new Date(currentTime.getTime() + greeceOffset * 60 * 1000);
  const currentISOTime = greeceTime.toISOString();

  const greenStartTime = schedule[0]["startTime"];
  const greenEndTime = schedule[0]["endTime"];
  const orangeStartTime = schedule[1]["startTime"];
  const orangeEndTime = schedule[1]["endTime"];

  // const { greenStartTime, greenEndTime, orangeStartTime, orangeEndTime } =
  //   window.trafficLightColorTimes || {};
  // console.log("Green Start Time:", greenStartTime);
  // console.log("Green End Time:", greenEndTime);

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

function reset() {
  fanarakia.forEach((fanari) => {
    fanari.green_light.style.backgroundColor = "gray";
    fanari.orange_light.style.backgroundColor = "gray";
    fanari.red_light.style.backgroundColor = "gray";
  });
  mode.checked = true;
  orange.value = 2;
  gap.value = 2;
  period.value = "";
  ptl.value = "";

  sliders.forEach(({ slider, output }) => {
    slider.value = 35;
    output.textContent = "";
  });

  title_fanari_1.innerHTML = null;
  title_fanari_2.innerHTML = null;
  title_fanari_3.innerHTML = null;
  title_fanari_4.innerHTML = null;

  title_pososto_fanari_1.innerHTML = null;
  title_pososto_fanari_2.innerHTML = null;
  title_pososto_fanari_3.innerHTML = null;
  title_pososto_fanari_4.innerHTML = null;
}

/*SUBMIT FORMS*/

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = {
    orange_time: document.getElementById("orange_time").value,
    gap_time: document.getElementById("gap_time").value,
    period_time: document.getElementById("period_time").value,
    ptl_time: document.getElementById("ptl").value,
    pososto_fanari1: document.getElementById("slider_fanari1").value,
    pososto_fanari2: document.getElementById("slider_fanari2").value,
    pososto_fanari3: document.getElementById("slider_fanari3").value,
    pososto_fanari4: document.getElementById("slider_fanari4").value,
    mode: document.getElementById("mode").checked ? "0" : "1", //if it is checked then it is 0 else it is 1
  };

  localStorage.setItem("formData", JSON.stringify(formData));

  patch_entity();

  //console.log("Form Data:", formData);

  //window.location.href = "/admin";
});

function getFormData() {
  const formData = localStorage.getItem("formData");
  return JSON.parse(formData);
}

async function patch_entity() {
  const contextBrokerUrl = context_broker_link + currentJunctionId + "/attrs";
  const formData = getFormData();

  let gap_time = parseInt(formData.gap_time);
  let period_time = parseInt(formData.period_time);
  let ptl_time = parseInt(formData.ptl_time);
  let orange_time = parseInt(formData.orange_time);
  let pososto_fanari1 = parseInt(formData.pososto_fanari1);
  let pososto_fanari2 = parseInt(formData.pososto_fanari2);
  let pososto_fanari3 = parseInt(formData.pososto_fanari3);
  let pososto_fanari4 = parseInt(formData.pososto_fanari4);
  let mode = parseInt(formData.mode);

  const fixedSchedule = [
    { [`${trafficLights[0].id}`]: pososto_fanari1 },
    { [`${trafficLights[1].id}`]: pososto_fanari2 },
    { [`${trafficLights[2].id}`]: pososto_fanari3 },
    { [`${trafficLights[3].id}`]: pososto_fanari4 },
  ];

  const data = {
    period: { type: "StructuredValue", value: { duration: period_time } },
    mode: { type: "Integer", value: mode },
    fixed_schedule: {
      type: "StructuredValue",
      value: fixedSchedule,
    },
    ptl: { type: "Integer", value: ptl_time },
    gap_duration: {
      type: "Integer",
      value: gap_time,
      metadata: {},
    },
    orange_duration: {
      type: "Integer",
      value: orange_time,
      metadata: {},
    },
  };

  try {
    const response = await axios.post(`http://localhost:${PORT}/api/patch`, {
      contextBrokerUrl,
      data,
    });

    console.log("Success!");
    alert("Form submitted successfully!");
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to submit the form. Please try again.");
  }
}
