require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

const db = require("./db/queries");

app.use(express.json()); // because express doesn't parse json by default and our req.body will be undefined
app.use(cors()); // because our frontend and backend are on different ports

const PORT = process.env.PORT || 3000;

// routing is being handled by react so I don't need to define routes to different pages here
// Instead I will focus on handling data, I.E. creating of groups, users, updating info and deleting when prompted

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// actual routes to the backend (database)
app.get("/api/groups", async (req, res) => {
  try {
    const groups = await db.getAllGroups();
    console.log(groups);
    res.json(groups);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Express server running at http://localhost:${PORT}`);
});
