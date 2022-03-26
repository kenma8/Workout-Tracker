import User, { Workout, Exercise } from "./User.js";

class App {
  constructor() {
    this._user = null;

    this._loginForm = null;
    this._addButton = null;
    this._addExerciseForm = null;
    this._finishButton = null;

    this._onLogin = this._onLogin.bind(this);
    this._onAddWorkout = this._onAddWorkout.bind(this);
    this._onAddExercise = this._onAddExercise.bind(this);
    this._onFinish = this._onFinish.bind(this);
  }

  setup() {
    this._loginForm = document.querySelector("#loginForm");
    this._loginForm.addEventListener("submit", this._onLogin);

    this._addButton = document.querySelector("#addWorkoutButton");
    this._addButton.addEventListener("click", this._onAddWorkout);

    this._addExerciseForm = document.querySelector("#addForm");
    this._addExerciseForm.addEventListener("submit", this._onAddExercise);

    this._finishButton = document.querySelector("#finishAdding");
    this._finishButton.addEventListener("click", this._onFinish);
  }

  _displayWorkout(workout) {
    /* Make sure we receive a Post object. */
    if (!(workout instanceof Workout)) throw new Error("displayWorkout wasn't passed a Workout object");

    let elem = document.querySelector("#templateWorkout").cloneNode(true);
    elem.id = "";

    elem.querySelector(".postHeader").textContent = workout.user.name;
    
    for (let i = 0; i < workout.exercises.length; i++) {
      let list = elem.querySelector(".exercises");
      let newExercise = document.querySelector("#templateExercise").cloneNode(true);
      newExercise.id = "";

      newExercise.querySelector(".exercise").textContent = workout.exercises[i].name;
      newExercise.querySelector(".reps").textContent = workout.exercises[i].reps + " @ " + workout.exercises[i].weight + " and " + workout.exercises[i].effort + " RPI"; 

      list.append(elem);
    }

    document.querySelector("#feed").append(elem);
  }

  _displayExercise(exercise) {
    /* Make sure we receive an Exercise object. */
    if (!(exercise instanceof Exercise)) throw new Error("displayExercise wasn't passed an Exercise object");

    let elem = document.querySelector("#templateExercise").cloneNode(true);
    elem.id = "";

    elem.querySelector(".name").textContent = exercise.name;
    elem.querySelector(".weight").textContent = exercise.weight;
    elem.querySelector(".reps").textContent = exercise.reps;
    elem.querySelector(".effort").textContent = exercise.effort;

    document.querySelector("#added").append(elem);
  }

  async _loadProfile() {
    document.querySelector("#welcome").classList.add("hidden");
    document.querySelector("#addWorkout").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    document.querySelector("#idContainer").textContent = this._user.id;
    /* Reset the feed */
    document.querySelector("#feed").textContent = "";

    document.querySelector("#feed").textContent = "";
    let feed = await this._user.getFeed();
    for (let i = 0; i < feed.length; i++) {
      this._displayWorkout(feed[i]);
    }
  }

  async _loadExercises() {
    document.querySelector("#idContainer").textContent = this._user.id;
    document.querySelector("#added").textContent = "";

    this._addExerciseForm.addEventListener("submit", this._onAddExercise);

    let feed = await this._user.getFeed();
    let workout = feed[0];
    for (let i = 0; i < workout.exercises.length; i++) {
      this._displayExercise(workout.exercises[i]);
    }
  }

  async _onLogin(event) {
    event.preventDefault();
    let id = document.querySelector("#loginForm").querySelector('input[name="userid"]').value;
    this._user = await User.loadOrCreate(id);
    await this._loadProfile();
  }

  async _onAddWorkout(event) {
    event.preventDefault();
    await this._user.addWorkout(); 
    document.querySelector("#main").classList.add("hidden");
    document.querySelector("#addWorkout").classList.remove("hidden");
  }

  async _onAddExercise(event) {
    event.preventDefault();

    let name = this._addExerciseForm.querySelector('input[name="exerciseName"]').value;
    let weight = this._addExerciseForm.querySelector('input[name="weight"]').value;
    let reps = this._addExerciseForm.querySelector('input[name="reps"]').value;
    let effort = this._addExerciseForm.querySelector('input[name="effort"]').value;
    let data = { "name": name, "weight": weight, "reps": reps, "effort": effort };

    this._addExerciseForm.querySelector('input[name="exerciseName"]').textContent = "";
    this._addExerciseForm.querySelector('input[name="weight"]').textContent = "";
    this._addExerciseForm.querySelector('input[name="reps"]').textContent = "";
    this._addExerciseForm.querySelector('input[name="effort"]').textContent = "";


    await this._user.addExercise(data);
    await this._loadExercises();  
  }

  async _onFinish(event) {
    document.querySelector("#addWorkout").classList.add("hidden");
    document.querySelector("#main").classList.remove("hidden");
    
    await this._loadProfile();
  }
}

let app = new App();
app.setup();