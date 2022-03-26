import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

let DATABASE_NAME = "workoutTracker";

/* Do not modify or remove this line. It allows us to change the database for grading */
if (process.env.DATABASE_NAME) DATABASE_NAME = process.env.DATABASE_NAME;

const api = express.Router();
let conn = null;
let db = null;
let Users = null;

const initApi = async app => {
  app.set("json spaces", 2);
  app.use("/api", api);

  conn = await MongoClient.connect("mongodb://localhost");
  db = conn.db("workoutTracker");
  Users = db.collection("users");
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

api.use("/users/:id", async (req, res, next) => {
  let id = req.params.id;
  let user = await Users.findOne({ id });
  if (!user) {
    res.status(404).json({ error: `No user with ID ${id}` });
    return;
  }
  res.locals.user = user;
  next();
});

api.get("/users", async (req, res) => {
  let users = await Users.find().toArray();
  let filter = req.query.q;
  if (filter) users = users.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(filter));
  res.json( users );
});

api.get("/users/:id", async (req, res) => {
  let user = res.locals.user;
  delete user._id;
  res.json( user )
});

api.post("/users", async (req, res) => {
  let id = req.body.id;
  if (id === null) {
    res.status(400).json({ error: `Missing id` });
    return;
  }
  let user = await Users.findOne({ id });
  if (user !== null) {
    res.status(400).json({ error: `${id} already exists` });
    return;
  }
  await Users.insertOne({ id: id, workouts: [] });
  user = await Users.findOne({ id });
  delete user._id;
  res.json({ user });
});

api.patch("/users/:id", async (req, res) => {
  let id = req.params.id;
  let user = res.locals.user;
  let update = req.body;
  if ("workouts" in update) {
    if (update.workouts === null) {
      user.workouts = [];
    } else {
      user.workouts = update.workouts;
    }
  }
  await Users.replaceOne({ id: user.id }, user);
  delete user._id;
  res.json(user);
});

api.get("/users/:id/workouts", async (req, res) => {
  let user = res.locals.user;
  let workouts = user.workouts;
  res.json({ workouts })
});

api.post("/users/:id/workouts", async (req, res) => {
  let user = res.locals.user;
  let workouts = user.workouts; 
  workouts.push({ "user":user.id, "date": new Date(), "exercises":[] });
  user.workouts = workouts;
  await Users.replaceOne({ id: user.id }, user);
  res.json({ success: true });
});

api.post("/users/:id/exercise", async (req, res) => {
  let user = res.locals.user;
  let workout = user.workouts[user.workouts.length - 1]; 
  let update = req.body;
  let newExercise = { "name": update.name, "weight": update.weight, "reps": update.reps, "effort": update.effort }
  workout.exercises.push(newExercise);
  user.workouts[user.workouts.length - 1] = workout;
  await Users.replaceOne({ id: user.id }, user);
  res.json({ success: true });
});
export default initApi;
