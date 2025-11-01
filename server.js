const bcrypt = require("bcryptjs");
require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

// step 1: import and initialize passport
const passport = require("passport");
const session = require("express-session");
//step 2: define passport strategy
const localStrategy = require("passport-local").Strategy; // working with username and password for the time being then we will shift to phone number-passcode or something related

const db = require("./db/queries");
const pool = require("./db/pool");

app.use(express.json()); // because express doesn't parse json by default and our req.body will be undefined
app.use(cors()); // because our frontend and backend are on different ports

const PORT = process.env.PORT || 3000;
// step 1: continued
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

//ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//step 2: continued
passport.use(
  new localStrategy(async (username, password, done) => {
    try {
      const user = await db.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "User not found" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

app.get("/sign_up", (req, res) => {
  res.render("sign_up");
});
app.post("/sign_up", async (req, res) => {
  try {
    const { username, password, confirm_pass } = req.body;
    if (password !== confirm_pass) {
      res.status(401).send("Passwords don't match");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES($1,$2)", [
      username,
      hashedPassword,
    ]);
    redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

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
