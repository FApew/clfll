import * as THREE from "three"
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Pos } from "./assets/js/data.js"
import { robot } from "./assets/js/robot.js"
import { dirLight, hemiLight } from "./assets/js/lights.js";

const container = document.getElementById("main")

const scene = new THREE.Scene()

let speed = {rot: .5, mov:8}

function init() {
    if (WebGL.isWebGLAvailable()) {
        let vel = {w: 0, a: 0, s: 0, d: 0}

        const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000)
        camera.position.set(0, 56, 100)

        const renderer = new THREE.WebGLRenderer({ antialias: true})
        renderer.setSize( container.clientWidth, container.clientHeight)
        container.appendChild(renderer.domElement)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.clearColor("black");

        const controls = new OrbitControls( camera, renderer.domElement)
        controls.enableRotate = false
        controls.screenSpacePanning = false;
        controls.enableZoom = false

        const dirBox = new THREE.Group()
        dirBox.add(dirLight)
        scene.add(dirBox)
        scene.add(dirLight.target)

        scene.add(hemiLight)

        const world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.806, 0)
        })

        const plane = new THREE.Mesh(
            new THREE.BoxGeometry(16000, 0.01, 16000),
            new THREE.MeshStandardMaterial({ color: 0x29c1e7 })
        )
        plane.receiveShadow = true
        scene.add(plane)

        const cPlane = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane()
        })
        cPlane.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(cPlane)
        
        const pole = new THREE.Mesh(
            new THREE.BoxGeometry(5, 50, 5),
            new THREE.MeshStandardMaterial({color: 0x131313})
        )
        pole.position.x = 20
        pole.position.y = 25
        pole.position.z = 0
        pole.castShadow = true
        scene.add(pole)

        const cPole = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(2.5, 25, 2.5)),
            position: new CANNON.Vec3(pole.position.x, pole.position.y, pole.position.z),
            mass: 1
        })
        world.addBody(cPole)

        scene.add(robot)

        const cRobot = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(10, 6, 9.225)),
            position: new CANNON.Vec3(0,robot.position.y,0),
            mass: 5
        })
        cRobot.quaternion.setFromEuler(0,robot.rotation.y,0)
        world.addBody(cRobot)

        camera.lookAt(robot.position)

        window.onresize = () => {
            camera.aspect = container.clientWidth / container.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(container.clientWidth, container.clientHeight )
        }

        document.addEventListener("keydown", (e) => {
            let k = e.key
            if (k === "w") {
                vel.w = 1
            } else if (k === "a") {
                vel.a = 1
            } else if (k === "s") {
                vel.s = 1
            } else if (k === "d") {
                vel.d = 1
            }
        })

        document.addEventListener("keyup", (e) => {
            let k = e.key
            if (k === "w") {
                vel.w = 0
            } else if (k === "a") {
                vel.a = 0
            } else if (k === "s") {
                vel.s = 0
            } else if (k === "d") {
                vel.d = 0
            }
        })

        const startPos = camera.position.clone()

        const robotMaterial = new CANNON.Material()
        cRobot.material = robotMaterial
        cPlane.material = robotMaterial

        function animate() {
            dirBox.position.set(camera.position.x - startPos.x, camera.position.y - startPos.y, camera.position.z - startPos.z);
            dirLight.target.position.set(camera.position.x - startPos.x, camera.position.y - startPos.y, camera.position.z - startPos.z)

            if ((vel.w || vel.a) || (vel.s || vel.d)) {
                cRobot.material.friction = 0
                cPlane.material.friction = 0
            } else {
                cPlane.material.friction = 0.5
                cRobot.material.friction = 0.5
            }
            
            if (vel.d) {
                cRobot.angularVelocity.y = -speed.rot
            } else if (vel.a) {
                cRobot.angularVelocity.y = speed.rot
            } else {
                cRobot.angularVelocity.y = 0
            }

            let angle = robot.rotation.y, k = 1
            if (Math.round(Math.abs(robot.rotation.x)*100)/100 != Math.round(Math.PI*100)/100) {
                angle = -robot.rotation.y
                k = -1
            }
            
            if (vel.w) {
                cRobot.velocity.x = -speed.mov * Math.sin(angle)*k
                cRobot.velocity.z = speed.mov * Math.cos(angle)*k
            }
            if (vel.s) {
                cRobot.velocity.x = speed.mov * Math.sin(angle)*k
                cRobot.velocity.z = -speed.mov * Math.cos(angle)*k
            }

            if ((vel.w || vel.a) || (vel.s || vel.d)) {
                camera.position.set(robot.position.x, 56, robot.position.z+100)
                camera.lookAt(robot.position)
            } else {
                controls.update()
                camera.rotation.set(-0.4636,0,0)
            }

            world.step(0.1)

            pole.position.copy(cPole.position)
            pole.quaternion.copy(cPole.quaternion)
            robot.position.copy(cRobot.position)
            robot.quaternion.copy(cRobot.quaternion)

            //cannonDebugger.update()

            renderer.render(scene, camera)
            requestAnimationFrame( animate )
        }
        animate()
    }
}

init()