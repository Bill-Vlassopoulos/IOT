import taskListSession from "./app-setup/app-setup-session.mjs";
import * as logInController from "./controller/login-controller.mjs";
//import { getalljunctions, gettrafficlights } from "./model/queries.mjs";
//import { getlasttrafficInfo } from "./model/queries.mjs";
import { DateTime } from "luxon";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import express from "express";
import axios from "axios";
import { fetchData } from "./model/queries.mjs";
//import { get } from "http";
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getLast24HoursFormatted() {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const year = last24Hours.getFullYear();
  const month = String(last24Hours.getMonth() + 1).padStart(2, "0");
  const day = String(last24Hours.getDate()).padStart(2, "0");
  const hours = String(last24Hours.getHours()).padStart(2, "0");
  const minutes = String(last24Hours.getMinutes()).padStart(2, "0");
  const seconds = String(last24Hours.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function formatDateTime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

app.use(express.static("public"));
app.use(express.json()); // Add this
app.use(express.urlencoded({ extended: true }));

//Ενεργοποίηση συνεδρίας
app.use(taskListSession);

//Ελέγχω πως υπάρχει ο χρήστης
app.use((req, res, next) => {
  if (req.session && req.session.loggedUserId) {
    res.locals.userId = req.session.loggedUserId;
    // console.log("Logged in user ID:", res.locals.userId);
  } else {
    res.locals.userId = "επισκέπτης";
    // console.log("User is a visitor");
  }
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "layouts", "main.html"));
});

app.get("/map", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "layouts", "dashboard-map.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "layouts", "admin.html"));
});

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "layouts", "mqtt-test.html"));
});

app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "layouts", "login.html"));
});

app.post("/signin", logInController.doLogin);

// Check session route
app.get("/check-session", (req, res) => {
  if (req.session.loggedUserId) {
    res.json({ signedIn: true });
  } else {
    res.json({ signedIn: false });
  }

  // console.log("SignedIn status:", req.session.loggedUserId ? true : false);
});

app.get("/signout", logInController.doLogout);

// API to fetch all junctions
app.get("/api/junctions", async (req, res) => {
  try {
    const response = await axios.get(
      "http://150.140.186.118:1026/v2/entities?type=v3_omada14_diastavrosi"
    );
    let cb_data = JSON.stringify(response.data);
    // console.log(response.data);
    cb_data = JSON.parse(cb_data);
    //console.log(cb_data);

    const formattedJunctions = cb_data.map((junction) => ({
      id: junction.id,
      lat: junction.location.value.coordinates[0],
      lng: junction.location.value.coordinates[1],
      title: junction.title.value,
      orange_time: junction.orange_duration.value,
      gap_time: junction.gap_duration.value,
      ptl: junction.ptl.value,
      period: junction.period.value.duration,
      pososta: junction.fixed_schedule.value,
      mode: junction.mode.value,
    }));

    res.json({ junctions: formattedJunctions });
  } catch (error) {
    console.error("Error fetching junctions from context broker:", error);
    res.status(500).json({ message: "Error fetching junctions" });
  }
});

// API to fetch traffic lights for a specific junction
app.get("/api/traffic-lights/:junction_id", async (req, res) => {
  try {
    const junction = await axios.get(
      `http://150.140.186.118:1026/v2/entities/${req.params.junction_id}`
    );

    let cb_data_junction = JSON.stringify(junction.data);
    cb_data_junction = JSON.parse(cb_data_junction);
    //console.log(cb_data_junction);
    let trafficlightsinfo;
    for (let i = 0; i < cb_data_junction.fanaria.value.length; i++) {
      const trafficLight = await axios.get(
        "http://150.140.186.118:1026/v2/entities?id=" +
        cb_data_junction.fanaria.value[i]
      );
      let cb_data_trafficlight = JSON.stringify(trafficLight.data);
      cb_data_trafficlight = JSON.parse(cb_data_trafficlight);
      // console.log(cb_data_trafficlight);
      // console.log(cb_data_trafficlight[0].id);
      // console.log(cb_data_trafficlight[0].location.value.coordinates);
      // console.log(cb_data_trafficlight[0].title.value);
      if (!trafficlightsinfo) {
        trafficlightsinfo = [];
      }
      trafficlightsinfo.push({
        id: cb_data_trafficlight[0].id,
        lat: cb_data_trafficlight[0].location.value.coordinates[0],
        lng: cb_data_trafficlight[0].location.value.coordinates[1],
        title: cb_data_trafficlight[0].title.value,
        schedule: cb_data_trafficlight[0].schedule.value,
      });
    }
    res.json({ trafficLights: trafficlightsinfo });
    //res.json({ junctions: formattedJunctions });
  } catch (error) {
    console.error("Error fetching junctions from context broker:", error);
    res.status(500).json({ message: "Error fetching junctions" });
  }
  // const junctionId = req.params.junction_id;
  // const trafficLights = gettrafficlights(junctionId);
  // const formattedTrafficLights = trafficLights.map((tl) => ({
  //   id: tl.id_traffic_light,
  //   lat: tl.latitute,
  //   lng: tl.longitude,
  // }));
  // res.json({ trafficLights: formattedTrafficLights });
  // console.log("Traffic Lights:", formattedTrafficLights);
});

// API to fetch live traffic data for a specific junction and traffic light
app.get(
  "/api/traffic-info/:junction_id/:traffic_light_id",
  async (req, res) => {
    const junctionId = req.params.junction_id;
    const trafficLightId = req.params.traffic_light_id;

    // Call the query to get traffic info
    // const trafficInfo = getlasttrafficInfo(junctionId, trafficLightId);
    let dashboardinfo;
    dashboardinfo = await axios.get(
      `http://150.140.186.118:1026/v2/entities/${req.params.traffic_light_id}`
    );
    let cb_data_dashboard = JSON.stringify(dashboardinfo.data);
    cb_data_dashboard = JSON.parse(cb_data_dashboard);
    // console.log(cb_data_dashboard.waitingCars.value, cb_data_dashboard.violations.value);
    let trafficInfo = {
      "waiting-cars": cb_data_dashboard.waitingCars.value,
      violations: cb_data_dashboard.violations.value,
      colors: cb_data_dashboard.schedule.value,
    };

    // If traffic data exists, send it as a response

    res.json({
      success: true,
      data: trafficInfo,
    });
  }
);

//End point to get data from sql database for historical data
app.get("/api/traffic-info/:traffic_light_id", async (req, res) => {
  const trafficLightId = req.params.traffic_light_id;
  try {
    const now = DateTime.now().setZone("Europe/Athens");
    const startTime = now.minus({ hours: 24 }).toFormat("yyyy-MM-dd HH:mm:ss");
    const endTime = now.toFormat("yyyy-MM-dd HH:mm:ss");
    console.log("Start time:", startTime);
    console.log("End time:", endTime);
    const response = await fetchData(
      trafficLightId + "_TrafficLight",
      "waitingCars",
      startTime,
      endTime
    );
    console.log(response);
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching data from sql database:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
});

//API to take the requests from front end and send them to the context broker
app.post("/api/patch", async (req, res) => {
  const { contextBrokerUrl, data } = req.body;

  try {
    const response = await axios.patch(contextBrokerUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to patch data to context broker" });
  }
});


app.post("/api/photo-request", async (req, res) => {
  const { cameraId } = req.body;
  const contextBrokerUrl = `http://150.140.186.118:1026/v2/entities/${cameraId}/attrs`;

  const data = {
    requestStatus: {
      type: "Text",
      value: "Requested",
    },
  };

  try {
    const response = await axios.patch(contextBrokerUrl, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    res.json({ success: true, message: "Photo request status updated to Requested" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to update photo request status" });
  }

});

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});

// // Start the Python script
// const scriptManager = new PythonScriptManager("./model/patch_entity.py");

// scriptManager.start();

// // Stop the script after 1 minute
// setTimeout(() => {
//   scriptManager.stop();
// }, 60000); // 60,000 ms = 1 minute

// // Restart the script after 2 minutes
// setTimeout(() => {
//   scriptManager.restart();
// }, 120000); // 120,000 ms = 2 minutes
