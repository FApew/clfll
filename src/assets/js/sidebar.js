let arrName = ["TEAM", "PROGETTO", "ROBOT"]
let arrLink = ["#","#","#"];;

const bar = document.getElementById("sideBar")

bar.style.gridTemplateRows = `repeat( ${arrName.length}, 50px)`

bar.addEventListener("mouseenter", () => {
    bar.style.width="250px"
})

bar.addEventListener("mouseleave", () => {
    bar.style.width="50px"
})

for (let i = 0; i < arrName.length; i++)
{
    var elm = document.createElement("div")
    var svgBox = document.createElement("div")
    var txt = document.createElement("div")
    var link = document.createElement("a")

    link.href = arrLink[i]

    svgBox.classList.add("svgBox")
    elm.classList.add("navItem")
    elm.appendChild(svgBox)

    txt.innerHTML += arrName[i]
    txt.classList.add("bTxt")

    link.appendChild(txt)
    elm.appendChild(link)
    bar.appendChild(elm)
}