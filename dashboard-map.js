// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

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
