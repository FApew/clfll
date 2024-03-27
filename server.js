import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/src/main.js", (req, res) => {
    res.type("application/javascript")
    res.sendFile(__dirname + "/src/main.js")
})

app.get("/src/script.js", (req, res) => {
    res.sendFile(__dirname + "/src/script.js")
})

app.get("/src/assets/style.css", (req, res) => {
    res.sendFile(__dirname + "/src/assets/style.css")
})

app.get("/src/assets/js/data.js", (req, res) => {
    res.sendFile(__dirname + "/src/assets/js/data.js")
})

app.get("/src/assets/js/lights.js", (req, res) => {
    res.sendFile(__dirname + "/src/assets/js/lights.js")
})

app.get("/src/assets/js/robot.js", (req, res) => {
    res.sendFile(__dirname + "/src/assets/js/robot.js")
})

for (let i = 0; i < 17; i++) {
    app.get(`/src/assets/model/${i}.glb`, (req, res) => {
        res.sendFile(__dirname + `/src/assets/model/${i}.glb`)
    })
}
for (let i = 0; i < 1; i++) {
    app.get(`/src/assets/img/${i}.png`, (req, res) => {
        res.sendFile(__dirname + `/src/assets/img/${i}.png`)
    })
}

app.listen(8080, () => {
    console.log("App listening on https://localhost:8080/");
})