import express from "express"
import path from "path"
import { fileURLToPath } from "url"

let __filename = fileURLToPath(import.meta.url)
let __dirname = path.dirname(__filename)

let app = express()

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html") 
})

app.get("/src", (req, res) => {
    res.sendFile(__dirname + "/style.css") 
})

app.get("/src", (req, res) => {
    res.sendFile(__dirname + "/script.js") 
})

app.listen(3000, () => {
    console.log("App listening on port " + 3000)
})