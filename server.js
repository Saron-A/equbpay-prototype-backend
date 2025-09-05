require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const groupId = req.params.id;
  res.sendFile(path.join(__dirname, "./index.html"));
});

app.get("api/groups/:id", (req, res) => {
  res.json({ id: groupId, name: "Test Group" });
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Express server running at http://Localhost:${PORT}`);
});
