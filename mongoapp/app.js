const mongoose = require("mongoose");
const express = require("express");
const Schema = mongoose.Schema;
const app = express();
const jsonParser = express.json();

const userScheme = new Schema({ name: String, age: Number }, { versionKey: false });
const User = mongoose.model("User", userScheme);

app.use(express.static(__dirname + "/public"));

mongoose.set("strictQuery", false);

mongoose.connect("mongodb://127.0.0.1:27017/usersdb", { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        app.listen(3000, function () {
            console.log("Сервер очікує підключення...");
        });
    })
    .catch(err => {
        console.error("Error connecting to MongoDB:", err);
    });


app.get("/api/users", function (req, res) {
    User.find({})
        .then(users => {
            res.send(users);
        })
        .catch(err => {
            console.error("Error fetching users:", err);
            res.status(500).send("Internal Server Error");
        });
});

app.get("/api/users/:id", function (req, res) {
    const id = req.params.id;
    User.findOne({ _id: id })
        .then(user => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.send(user);
        })
        .catch(err => {
            console.error("Error fetching user:", err);
            res.status(500).send("Internal Server Error");
        });
});


app.post("/api/users", jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const userName = req.body.name;
    const userAge = req.body.age;
    const user = new User({ name: userName, age: userAge });

    user.save()
        .then(savedUser => {
            res.send(savedUser);
        })
        .catch(err => {
            console.error("Error saving user:", err);
            res.status(500).send("Internal Server Error");
        });
});


app.delete("/api/users/:id", function (req, res) {
    const id = req.params.id;
    User.findByIdAndDelete(id)
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).send("User not found");
            }
            res.send(deletedUser);
        })
        .catch(err => {
            console.error("Error deleting user:", err);
            res.status(500).send("Internal Server Error");
        });
});

app.listen(3001, function () {
    console.log("Сервер очікує підключення...");
});


app.put("/api/users", jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);
    const id = req.body.id;
    const userName = req.body.name;
    const userAge = req.body.age;
    const newUser = { age: userAge, name: userName };

    User.findByIdAndUpdate(id, newUser, { new: true })
        .then(updatedUser => {
            res.send(updatedUser);
        })
        .catch(err => {
            console.error("Error updating user:", err);
            res.status(500).send("Internal Server Error");
        });
});
