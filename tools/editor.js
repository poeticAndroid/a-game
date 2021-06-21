let txt = document.querySelector("textarea")
txt.addEventListener("focus", () => {
  if (localStorage.getItem("wip-scene"))
    txt.value = localStorage.getItem("wip-scene").replace(/><a-/gi, ">\n  <a-").trim()
  else
    load("scenes/new.html")
})
txt.addEventListener("change", () => {
  localStorage.setItem("wip-scene", txt.value.trim())
})
txt.addEventListener("keyup", () => {
  localStorage.setItem("wip-scene", txt.value.trim())
})


let loadBtn = document.querySelector("#loadBtn")
loadBtn.addEventListener("click", () => {
  let url = prompt("Enter name of scene to load", "new")
  if (!url.includes("/")) url = "scenes/" + url
  if (!url.includes(".")) url = url + ".html"
  if (url) {
    load(url)
  }
})

let saveBtn = document.querySelector("#saveBtn")
saveBtn.addEventListener("click", () => {
  let saveFrm = document.querySelector("#saveFrm")
  saveFrm.submit()
})

let copyBtn = document.querySelector("#copyBtn")
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(txt.value)
})

let editBtn = document.querySelector("#editBtn")
editBtn.addEventListener("click", () => {
  document.body.innerHTML = `
    <a-scene physics="workerUrl:../dist/cannonWorker.js">
      <a-entity include="scenes/_assets.html"></a-entity>
      <a-player locomotion="godMode:true" grabbing>
      <a-gltf-model src="https://cdn.glitch.com/e956e2ed-f877-4602-a395-a2e234731117%2Fguncil.glb" grabbable="physics:false;fixed:true;fixedPosition:0 0.125 0;" position="0 1.5 -0.5" editor="gridDensity: ${document.querySelector("#densTxt").value};rotDensity: ${document.querySelector("#rotTxt").value};"></a-gltf-model>
      </a-player>
      <a-main></a-main>
    </a-scene>
  `
})

let runBtn = document.querySelector("#runBtn")
runBtn.addEventListener("click", () => {
  document.body.innerHTML = `
    <a-scene physics="workerUrl:../dist/cannonWorker.js">
      <a-entity include="scenes/_assets.html"></a-entity>
      <a-player locomotion grabbing></a-player>
      <a-main></a-main>
    </a-scene>
  `
  runWhenReady()
})

async function load(url) {
  txt.blur()
  let html = await (await fetch(url + "?now=" + Date.now())).text()
  localStorage.setItem("wip-scene", html.trim())
  txt.focus()
}

function runWhenReady() {
  if (!document.querySelector("a-assets")) {
    let to = setTimeout(runWhenReady, 256)
    return
  }
  let world = document.querySelector("a-main")
  world.outerHTML = localStorage.getItem("wip-scene")
}
