const mongoose = require("mongoose");
const express = require("express");
const Schema = mongoose.Schema;
const app = express();
const jsonParser = express.json();

const {
    MONGO_DB_HOSTNAME,
    MONGO_DB_PORT,
    MONGO_DB
} = process.env

const userScheme = new Schema({ name: String, age: Number }, { versionKey: false });
const User = mongoose.model("User", userScheme);

app.use(express.static(__dirname + "/public"));

mongoose.set("strictQuery", false);

mongoose.connect("mongodb://my_mongodb:27017/usersdb")
    .then(() => {
        console.log("З'єднання з MongoDB через Mongoose успішно встановлено");
        app.listen(3000, function () {
            console.log("Сервер запущено на порту 3000...");
        });
    })
    .catch((error) => {
        console.error("Помилка при з'єднанні з базою даних:", error);
    });

app.get("/api/users", function (req, res) {

    User.find({}, function (err, users) {

        if (err) return console.log(err);
        res.send(users)
    });
});

app.get("/api/users/:id", function (req, res) {

    const id = req.params.id;
    User.findOne({ _id: id }, function (err, user) {

        if (err) return console.log(err);
        res.send(user);
    });
});

app.post("/api/users", jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);

    const { name, age } = req.body;
    const user = new User({ name, age });

    user.save()
        .then(savedUser => {
            console.log("Пользователь успешно сохранен:", savedUser);
            res.send(savedUser);
        })
        .catch(error => {
            console.error("Ошибка при сохранении пользователя:", error);
            res.status(500).send("Ошибка при сохранении пользователя");
        });
});


app.put("/api/users/:id", jsonParser, async function (req, res) {
    try {
        const { id } = req.params;
        const { name, age } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { name, age }, { new: true });
        if (!updatedUser) {
            return res.status(404).send("Користувача не знайдено");
        }
        res.send(updatedUser);
    } catch (error) {
        console.error("Помилка при оновленні користувача у базі даних:", error);
        res.status(500).send("Помилка при оновленні користувача у базі даних");
    }
});
async function EditUser(userId, userName, userAge) {
    const response = await fetch("/api/users/" + userId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: userName,
            age: parseInt(userAge, 10)
        })
    });
    if (response.ok === true) {
        reset();
        location.reload(); // Оновити сторінку
    }
}

// Обработчик маршрута DELETE для удаления пользователя
app.delete("/api/users/:id", function (req, res) {
    const id = req.params.id;
    User.findByIdAndDelete(id)
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).send("Пользователь не найден");
            }
            console.log("Пользователь успешно удален:", deletedUser);
            res.send(deletedUser);
        })
        .catch(error => {
            console.error("Ошибка при удалении пользователя:", error);
            res.status(500).send("Ошибка при удалении пользователя");
        });
});


