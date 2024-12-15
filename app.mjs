import taskListSession from "./app-setup/app-setup-session.mjs";
import * as logInController from "./controller/login-controller.mjs";
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
    console.log("Logged in user ID:", res.locals.userId);
  } else {
    res.locals.userId = "επισκέπτης";
    console.log("User is a visitor");
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

  console.log("SignedIn status:", req.session.loggedUserId ? true : false);
});

app.get("/signout", logInController.doLogout);

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
