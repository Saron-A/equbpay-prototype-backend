require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

app.use(express.json()); // because express doesn't parse json by default and our req.body will be undefined
app.use(cors()); // because our frontend and backend are on different ports

const PORT = process.env.PORT || 3000;

// routing is being handled by react so I don't need to define routes to different pages here
// Instead I will focus on handling data, I.E. creating of groups, users, updating info and deleting when prompted
// We don't have a database yet so I will use an array to store data temporarily

let groups = [];

// Group Creation
app.post("/api/groups", (req, res) => {
  groups.push(req.body);
  res.status(201).send("Group created");
});
// successful integration of frontend and backend on group creation

// Get all groups
app.get("/api/groups", (req, res) => {
  res.json(groups);
});

//Group Deletion
app.delete("/api/groups/:id", (req, res) => {
  let groupID = req.params.id;
  groups = groups.filter((group) => String(group.id) !== String(groupID));
  res.status(200).send("Group deleted");
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Express server running at http://localhost:${PORT}`);
});
