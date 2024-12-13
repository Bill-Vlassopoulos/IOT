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

    var locations = [
        { lat: 38.286890, lng: 21.787373, title: 'Διαστάρωση Πανεπιστημίου Πατρών' },
        { lat: 38.286372, lng: 21.774256, title: 'Τόφαλος 1' },
        { lat: 38.282599, lng: 21.771536, title: 'Τόφαλος 2' }
        // Add more locations here if needed
    ];

    var lastClickedMarker = null;


    locations.forEach(function (location) {
        var marker = L.marker([location.lat, location.lng], { icon: defaultIcon }).addTo(map)
            .bindPopup(location.title)
            .on('click', function () {
                if (lastClickedMarker) {
                    lastClickedMarker.setIcon(defaultIcon);
                }
                marker.setIcon(redIcon);
                lastClickedMarker = marker;
                // alert('You selected ' + location.title);
            });
    });
});
document.addEventListener('DOMContentLoaded', function () {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Traffic Light Violations',
                data: [5, 10, 3, 7, 6, 8, 4], // Example data for violations
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    var ctx1 = document.getElementById('myChart1').getContext('2d');
    var myChart1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Average Traffic',
                data: [12, 19, 3, 5, 2, 3, 10], // Example data for average traffic
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });
});
