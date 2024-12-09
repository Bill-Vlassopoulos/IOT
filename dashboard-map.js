//Initialize the map
document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([38.266639, 21.798573], 13); // Coordinates for Patras, Greece

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var redIcon = L.icon({
        iconUrl: 'pngwing.com.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var trafficLightIcon = L.icon({
        iconUrl: 'traffic_light.png',
        iconSize: [15, 30], // Adjust the size as needed
        iconAnchor: [7, 30],
        popupAnchor: [1, -25],
        shadowSize: [25, 25]
    });

    var locations = [
        { lat: 38.286890, lng: 21.787373, title: 'Διαστάρωση Πανεπιστημίου Πατρών' }, //Junction 1
        { lat: 38.286372, lng: 21.774256, title: 'Τόφαλος 1' }, //Junstion 2
        { lat: 38.282599, lng: 21.771536, title: 'Τόφαλος 2' }, //Junction 3
        { lat: 38.302055, lng: 21.780824, title: 'Ζαίμη'}, //Junction 4
        { lat: 38.289022, lng: 21.768183, title: 'Σικίνου'} //Junction 5
        // Add more locations here if needed
    ];

    //Φανάρια στην διαστάρωση του Πανεπιστημίου Πατρών
    var tl_junction1=[
        { lat: 38.286961, lng: 21.787422, title: 'Φανάρι 1' },
        { lat: 38.286913, lng: 21.787274, title: 'Φανάρι 2' },
        { lat: 38.286880, lng: 21.787268, title: 'Φανάρι 3' },
        { lat: 38.286879, lng: 21.787308, title: 'Φανάρι 4' }
    ];

    //Φανάρια στον Τόφαλο 1
    var tl_junction2=[
        { lat: 38.286394, lng: 21.774315, title: 'Φανάρι 1' },
        { lat: 38.286351, lng: 21.774327, title: 'Φανάρι 2' },
        { lat: 38.286336, lng: 21.774279, title: 'Φανάρι 3' },
        { lat:38.286389, lng: 21.774222,  title:'Φανάρι 4'  }
    
    ];

    //Φανάρια στον Τόφαλο 2
    var tl_junction3=[
        { lat:38.282542, lng: 21.771544, title: 'Φανάρι 1' },
        { lat: 38.282550, lng: 21.771586, title: 'Φανάρι 2' },
        { lat: 38.282531, lng: 21.771536, title: 'Φανάρι 3' },
        { lat: 38.282588, lng: 21.771484, title: 'Φανάρι 4' }
        
    ];

    //Φανάρια στην Ζαίμη
    var tl_junction4=[
        { lat: 38.302064, lng: 21.780860, title: 'Φανάρι 1' },
        { lat: 38.302012, lng: 21.780871, title: 'Φανάρι 2' },
        { lat: 38.302015, lng: 21.780803, title: 'Φανάρι 3' },
        { lat: 38.302064, lng: 21.780803, title: 'Φανάρι 4' }
        
    ];

    //Φανάρια στην Σίκινου
    var tl_junction5=[
        { lat: 38.289055, lng: 21.768208, title: 'Φανάρι 1' },
        { lat: 38.289041, lng: 21.768141, title: 'Φανάρι 2' },
        { lat: 38.288998, lng: 21.768165, title: 'Φανάρι 3' },
        { lat: 38.289050, lng: 21.768210, title: 'Φανάρι 4' }
        
    ];

    

    var lastClickedMarker = null;
    var trafficLightMarkers = [];


    locations.forEach(function (location, index) {
        var marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(map)
            .bindPopup(location.title)
            .on('click', function () {
                if (lastClickedMarker) {
                    lastClickedMarker.setIcon(defaultIcon);
                    trafficLightMarkers.forEach(function (tlMarker) {
                        map.removeLayer(tlMarker);
                    });
                    trafficLightMarkers = [];
                }
                marker.setIcon(redIcon);
                lastClickedMarker = marker;
                map.flyTo([location.lat, location.lng], 18); // Use flyTo for smooth zoom
    
                // Add traffic light markers for the selected junction
                var trafficLights = [];
                if (index === 0) {
                    trafficLights = tl_junction1;
                } else if (index === 1) {
                    trafficLights = tl_junction2;
                } else if (index === 2) {
                    trafficLights = tl_junction3;
                } else if (index === 3) {
                    trafficLights = tl_junction4;
                } else if (index === 4) {
                    trafficLights = tl_junction5;
                }
    
                trafficLights.forEach(function (tl) {
                    var tlMarker = L.marker([tl.lat, tl.lng], { icon: trafficLightIcon }).addTo(map)
                        .bindPopup(tl.title);
                    trafficLightMarkers.push(tlMarker);
                });
            });
    });
});
// Get elements
const dashboard = document.getElementById('dashboard');
const openDashboardBtn = document.getElementById('openDashboard');
const closeDashboardBtn = document.getElementById('closeDashboard');
const mapElement = document.getElementById('map');

// Show the dashboard
openDashboardBtn.addEventListener('click', () => {
    dashboard.classList.add('visible');
    mapElement.classList.add('map-blurred');
    openDashboardBtn.classList.add('hidden');
});

// Hide the dashboard
closeDashboardBtn.addEventListener('click', () => {
    dashboard.classList.remove('visible');
    mapElement.classList.remove('map-blurred');
    openDashboardBtn.classList.remove('hidden');
});

// Set up dynamic data for the dashboard
document.getElementById("waiting-cars").textContent = 12; // Example: Fetch live data here
document.getElementById("violations").textContent = 5; // Example: Fetch live data here

// Traffic Data for the Day
const trafficData = {
    labels: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM"],
    datasets: [
        {
            label: "Cars Passed",
            data: [50, 100, 150, 130, 80, 30],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
        },
        {
            label: "Cars Waiting",
            data: [20, 30, 40, 35, 25, 10],
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
        },
    ],
};

// Configure Chart.js
const ctx = document.getElementById("trafficChart").getContext("2d");
new Chart(ctx, {
    type: "bar",
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
    },
});
