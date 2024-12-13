// Set up dynamic data
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
