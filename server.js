require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const groupId = req.params.id; // each user needs an id so that only relevant content is shown
  res.sendFile(path.join(__dirname, "./pages/Homepage.jsx"));
});

app.get("/group_details/:id", (req, res) => {
  const groupId = req.params.id;
  res.sendFile(path.join(__dirname, `./pages/Group_Details.jsx/${groupId}`));
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Express server running at http://Localhost:${PORT}`);
});
