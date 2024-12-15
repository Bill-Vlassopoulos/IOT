import taskListSession from "./app-setup/app-setup-session.mjs";
import * as logInController from "./controller/login-controller.mjs";
import { getalljunctions, gettrafficlights } from "./model/queries.mjs";
import { getlasttrafficInfo } from "./model/queries.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
app.get("/api/junctions", (req, res) => {
  const junctions = getalljunctions();
  const formattedJunctions = junctions.map((junction) => ({
    id: junction.id_diastaurosis,
    lat: junction.latitute,
    lng: junction.longitude,
    title: junction.title,
  }));
  res.json({ junctions: formattedJunctions });
  // console.log("Junctions:", formattedJunctions);
});

// API to fetch traffic lights for a specific junction
app.get("/api/traffic-lights/:junction_id", (req, res) => {
  const junctionId = req.params.junction_id;
  const trafficLights = gettrafficlights(junctionId);
  const formattedTrafficLights = trafficLights.map((tl) => ({
    id: tl.id_traffic_light,
    lat: tl.latitute,
    lng: tl.longitude,
  }));
  res.json({ trafficLights: formattedTrafficLights });
  console.log("Traffic Lights:", formattedTrafficLights);
});

// API to fetch live traffic data for a specific junction and traffic light
app.get("/api/traffic-info/:junction_id/:traffic_light_id", (req, res) => {
  const junctionId = req.params.junction_id;
  const trafficLightId = req.params.traffic_light_id;

  // Call the query to get traffic info
  const trafficInfo = getlasttrafficInfo(junctionId, trafficLightId);

  // If traffic data exists, send it as a response
  if (trafficInfo.length > 0) {
    res.json({
      success: true,
      data: trafficInfo,
    });
    console.log("Traffic Info:", trafficInfo);
  } else {
    res.json({
      success: false,
      message: "No traffic data available for this traffic light.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
