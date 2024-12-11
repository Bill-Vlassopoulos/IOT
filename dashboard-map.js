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

    // var redIcon = L.icon({
    //     iconUrl: 'pngwing.com.png',
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //     shadowSize: [41, 41]
    // });

    var trafficLightIcon = L.icon({
        iconUrl: 'traffic-light.png',
        iconSize: [25, 30], // Adjust the size as needed
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
        { lat: 38.286996, lng: 21.787494, title: 'Φανάρι 1' },
        { lat: 38.286981, lng: 21.787217, title: 'Φανάρι 2' },
        { lat: 38.286845, lng: 21.787206, title: 'Φανάρι 3' },
        { lat: 38.286805, lng: 21.787362, title: 'Φανάρι 4' }
    ];

    //Φανάρια στον Τόφαλο 1
    var tl_junction2=[
        { lat: 38.286471, lng: 21.774371, title: 'Φανάρι 1' },
        { lat: 38.286327, lng: 21.774394, title: 'Φανάρι 2' },
        { lat: 38.286299, lng: 21.774248, title: 'Φανάρι 3' },
        { lat: 38.286403, lng: 21.774191,  title:'Φανάρι 4'  }
    
    ];

    //Φανάρια στον Τόφαλο 2
    var tl_junction3=[
        { lat: 38.282501, lng: 21.771518, title: 'Φανάρι 1' },
        { lat: 38.282539, lng: 21.771629, title: 'Φανάρι 2' },
        { lat: 38.282639, lng: 21.771593, title: 'Φανάρι 3' },
        { lat: 38.282608, lng: 21.771444, title: 'Φανάρι 4' }
        
    ];

    //Φανάρια στην Ζαίμη
    var tl_junction4=[
        { lat: 38.302139, lng: 21.780937, title: 'Φανάρι 1' },
        { lat: 38.301965, lng: 21.780922, title: 'Φανάρι 2' },
        { lat: 38.301972, lng: 21.780745, title: 'Φανάρι 3' },
        { lat: 38.302097, lng: 21.780763, title: 'Φανάρι 4' }
        
    ];

    //Φανάρια στην Σίκινου
    var tl_junction5=[
        { lat: 38.289115, lng: 21.768258, title: 'Φανάρι 1' },
        { lat: 38.288937, lng: 21.768398, title: 'Φανάρι 2' },
        { lat: 38.289063, lng: 21.768091, title: 'Φανάρι 3' },
        { lat: 38.288906, lng: 21.768098, title: 'Φανάρι 4' }
        
    ];

    

    var trafficLightsData = [
        tl_junction1,
        tl_junction2,
        tl_junction3,
        tl_junction4,
        tl_junction5
    ];

    var lastClickedMarker = null;
    var trafficLightMarkers = [];
    const goBackButton = document.getElementById('goBack');
    const dashboardbtn = document.getElementById('openDashboard');
    var markers = [];

    // Add markers for each location
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
    
                lastClickedMarker = marker;
                map.flyTo([location.lat, location.lng], 18);
    
                var trafficLights = trafficLightsData[index];
                trafficLights.forEach(function (tl) {
                    var tlMarker = L.marker([tl.lat, tl.lng], { icon: trafficLightIcon }).addTo(map)
                        .bindPopup(tl.title)
                        .on('click', function () {
                            // Show the dashboard button when a traffic light is clicked
                            dashboardbtn.classList.remove('hidden');
                        });
                    trafficLightMarkers.push(tlMarker);
                });
    
                map.removeLayer(marker); // Hide the location marker
                goBackButton.classList.remove('hidden'); // Show the go back button
            });
        markers.push(marker);
    });

    // Reset map to initial state
    goBackButton.addEventListener('click', function () {
        map.flyTo([38.266639, 21.798573], 13);

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

        goBackButton.classList.add('hidden');
        dashboardbtn.classList.add('hidden');
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
