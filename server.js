const express = require("express")
const qs = require("qs")

const app = express()

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.set("query parser", (str) => qs.parse(str))

app.get("/", (req, res) => {
    res.send("hello world")
})

//Login and Register
app.post("/login", UserController.login)
app.post("/add-user", authentication, guardAdmin, UserController.addUser)



//Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


module.exports = app