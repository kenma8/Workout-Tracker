import apiRequest, { HTTPError } from "./api.js";

export class Workout {
  constructor(data) {
    this.user = new User(data.user);
    this.time = new Date(data.time);
    this.exercises = data.exercises;
  }
}

export class Exercise {
  constructor(data) {
    this.name = data.name;
    this.weight = data.weight;
    this.reps = data.reps;
    this.effort = data.effort;
  }
}

export default class User {

  static async loadOrCreate(id) {
    try {
      return new User(await apiRequest("GET", "/users/" + id));
    } catch (e) {
      if (e instanceof HTTPError && e.status === 404) {
        return new User(await apiRequest("POST", "/users", {"id":id}));
      }
    }
  }

  constructor(data) {
    this.id = data.id;
    this.workouts = data.workouts;
  }

  toJSON() {
    return {"id":this.id, "workouts":this.workouts};
  }

  async save() {
    await this._reload();
    return new User(await apiRequest("PATCH", "/users/" + this.id, {"id":this.id, "workouts":this.workouts}));
  }

  async getFeed() {
    let feed = await apiRequest("GET", "/users/" + this.id + "/workouts");
    let workouts = [];
    for (let i = 0; i < feed.workouts.length; i++) {
      let workoutJSON = feed.workouts[i];
      let exercises = [];
      for(let j = 0; j < workoutJSON.length; j++) {
        exercises.push(new Exercise(workoutJSON[j]));
      }
      workouts.push(new Workout({ "user":feed.workouts[i].user, "date":feed.workouts[i].date, "exercises":exercises }));
    }
    return workouts;
  }

  async addExercise(data) {
    await apiRequest("POST", "/users/" + this.id + "/exercise", { "name": data.name, "weight": data.weight, "reps": data.reps, "effort": data.effort });
    await this._reload(); 
  }
  
  async addWorkout() {
    await apiRequest("POST", "/users/" + this.id + "/workouts");
    await this._reload(); 
  }

  async _reload() {
    let data = await apiRequest("GET", "/users/" + this.id);
    this.name = data.name;
    this.workouts = data.workouts;
  }
}