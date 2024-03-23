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
    res.sendFile(__dirname + "/src/main.js")
})

app.get("/src/script.js", (req, res) => {
    res.sendFile(__dirname + "/src/script.js")
})

app.get("/src/assets/style.css", (req, res) => {
    res.sendFile(__dirname + "/src/assets/style.css")
})

app.get("/src/assets/model/0.glb", (req, res) => {
    res.sendFile(__dirname + "/src/assets/model/0.glb")
})

app.listen(8080, () => {
    console.log("App listening on https://localhost:8080/");
})