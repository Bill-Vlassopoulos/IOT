const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "layouts", "main.html"));
});

app.get("/map", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "layouts", "dashboard-map.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
