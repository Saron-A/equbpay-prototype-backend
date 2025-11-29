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
app.use(
  cors({
    origin: "http://localhost:5173", // your React app
    credentials: true,
  })
); // because our frontend and backend are on different ports

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
  new localStrategy(
    { usernameField: "phoneNum", passwordField: "passcode" },
    async (phoneNum, passcode, done) => {
      try {
        //get user by phonenumber then match the passcode
        const { rows } = await pool.query(
          "SELECT * FROM users WHERE phoneNum=$1",
          [phoneNum]
        );
        const user = rows[0];
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        const match = await bcrypt.compare(passcode, user.passcode);
        if (!match) {
          return done(null, false, { message: "User not found" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

//Step 3 : serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
  const user = rows[0];
  if (!user) {
    return done(null, false);
  }
  return done(null, user);
});

app.post("/api/signup", async (req, res) => {
  try {
    const { phoneNum, passcode, confirm_pass, username } = req.body;
    //username and phoneNum must be unique
    //passcode and confirm_pass must match

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username=$1 or phoneNum=$2",
      [username, phoneNum]
    );
    if (rows.length > 0) {
      return res.send({ error: "username or phone number already exists" });
    }
    if (passcode !== confirm_pass) {
      return res.send({ error: "passcodes do not match" });
    }
    const hashedPasscode = await bcrypt.hash(passcode, 10);
    await pool.query(
      "INSERT INTO users (username, phoneNum, passcode) VALUES ($1,$2,$3)",
      [username, phoneNum, hashedPasscode]
    );
    console.log("User registered successfully");
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) next(err);
    if (!user) {
      return res.status(400).json({ error: "Login failed" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({
        message: "Login successful",
        user: { id: user.id, username: user.username, phoneNum: user.phoneNum },
      });
    });
  })(req, res, next);
});

app.get("/api/users/current_user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});
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
