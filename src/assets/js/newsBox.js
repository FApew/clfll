import { resolveObject } from "url"

let arrTitle = ["news1", "news2", "news3", "news4", "news5","news6","a"]

const newsBox = document.getElementById("newsBox")

let row = arrTitle.length / 4
row = Math.ceil(row)


newsBox.style.gridTemplateRows = `repeat( ${row}, 500px)`


for(let i = 0; i<arrTitle.length; i++)
{
    var box = document.createElement("div")
    var Title = document.createElement("div")

    box.classList.add("news")
    Title.classList.add("Title")

    Title.innerHTML += arrTitle[i]

    box.appendChild(Title)

    newsBox.appendChild(box)
}
