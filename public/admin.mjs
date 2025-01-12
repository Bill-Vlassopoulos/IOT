//VARIABLES
let currentJunctionId = null;
var lastClickedMarker = null;
var trafficLightMarkers = [];
let trafficLights = [];
let lastclickedtrafficlight = {};

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

document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([38.292488, 21.789119], 14); // Coordinates for Patras, Greece

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetchJunctions(map);
    fetchTrafficLights(lastClickedMarker)
});

async function fetchJunctions(map) {
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
                .on("click", function () {
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
                    //subscribeToTopic(`v3_fanaria/${currentJunctionId}`);
                });
        });
    } catch (error) {
        console.error("Error fetching junctions:", error);
    }
}

async function fetchTrafficLights(location) {
    try {
        const response = await fetch(`/api/traffic-lights/${location}`);
        const tlData = await response.json();
        trafficLights = tlData.trafficLights;

        trafficLights.forEach(function (tl) {
            var tlMarker = L.marker([tl.lat, tl.lng], {
                icon: trafficLightIcon,
            })
                .addTo(map)
                .bindPopup(` ${tl.title}`)
                .on("click", function () {
                    lastclickedtrafficlight = {
                        junction: location.id,
                        trafficLight: tl.id,
                    };

                    currentTrafficLightId = tl.id;
                    console.log("Current Traffic Light ID:", currentTrafficLightId);
                });

            trafficLightMarkers.push(tlMarker);
        });

    } catch (error) {
        console.error("Error fetching traffic lights: ", error);
    }
}