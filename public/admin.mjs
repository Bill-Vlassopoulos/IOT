//VARIABLES
let currentJunctionId = null;
var lastClickedMarker = null;
var trafficLightMarkers = [];
let trafficLights = [];
let lastclickedtrafficlight = {};
var markers = [];
const goBackButton = document.getElementById("goBack");

let title_fanari_1 = document.getElementById("fanari_1");
let title_fanari_2 = document.getElementById("fanari_2");
let title_fanari_3 = document.getElementById("fanari_3");
let title_fanari_4 = document.getElementById("fanari_4");

let pososto_fanari_1 = document.getElementById("pososto_fanari1");
let pososto_fanari_2 = document.getElementById("pososto_fanari2");
let pososto_fanari_3 = document.getElementById("pososto_fanari3");
let pososto_fanari_4 = document.getElementById("pososto_fanari4");

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

//MAP
const map = L.map("map").setView([38.292488, 21.789119], 13); // Coordinates for Patras, Greece

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

fetchJunctions(map);

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

          try {
            const tlData = await fetchTrafficLights(location.id);
            trafficLights = tlData.trafficLights;

            title_fanari_1.innerHTML = trafficLights[0].title;
            title_fanari_2.innerHTML = trafficLights[1].title;
            title_fanari_3.innerHTML = trafficLights[2].title;
            title_fanari_4.innerHTML = trafficLights[3].title;

            pososto_fanari_1.innerHTML = trafficLights[0].title;
            pososto_fanari_2.innerHTML = trafficLights[1].title;
            pososto_fanari_3.innerHTML = trafficLights[2].title;
            pososto_fanari_4.innerHTML = trafficLights[3].title;

            trafficLights.forEach(function (tl) {
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

goBackButton.addEventListener("click", function () {
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

  title_fanari_1.innerHTML = null;
  title_fanari_2.innerHTML = null;
  title_fanari_3.innerHTML = null;
  title_fanari_4.innerHTML = null;

  pososto_fanari_1.innerHTML = null;
  pososto_fanari_2.innerHTML = null;
  pososto_fanari_3.innerHTML = null;
  pososto_fanari_4.innerHTML = null;

  goBackButton.classList.add("hidden");
});
