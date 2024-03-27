import * as THREE from "three"
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Pos } from "./assets/js/data.js"
import { robot } from "./assets/js/robot.js"
import { dirLight, hemiLight } from "./assets/js/lights.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
//import CannonDebugger from "cannon-es-debugger"

const container = document.getElementById("main")

const scene = new THREE.Scene()

const mNumber = 4

const speed = {rot: .5, mov:6}

function init() {
    if (WebGL.isWebGLAvailable()) {
        let vel = {w: 0, a: 0, s: 0, d: 0, shift: 0}

        const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000)
        camera.position.set(-80, 56, 140)

        const renderer = new THREE.WebGLRenderer({ antialias: true})
        renderer.setSize( container.clientWidth, container.clientHeight)
        container.appendChild(renderer.domElement)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.clearColor("black");

        const controls = new OrbitControls( camera, renderer.domElement)
        controls.enableRotate = false
        controls.screenSpacePanning = false
        controls.enableZoom = false

        const dirBox = new THREE.Group()
        dirBox.add(dirLight)
        scene.add(dirBox)
        scene.add(dirLight.target)

        const helper = new THREE.CameraHelper(dirLight.shadow.camera)
        scene.add(helper)

        scene.add(hemiLight)

        const world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.806, 0)
        })
        let size = 200
        const plane = new THREE.Mesh(
            new THREE.BoxGeometry(size, 0.01, size/16*9),
            new THREE.MeshStandardMaterial({ 
                map: new THREE.TextureLoader().load("../src/assets/img/0.png"),
                flatShading: true
            })
        )
        plane.receiveShadow = true
        scene.add(plane)

        const cPlane = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane()
        })
        cPlane.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        world.addBody(cPlane)
        
        const missions = new THREE.Group()

        const loader = new GLTFLoader()

        let cMissArr = [], missArr = []

        for (let i = 0; i < mNumber; i++) {
            let Miss = new THREE.Group()
            loader.load(`../src/assets/model/${i+1}.glb`, (gltf) => {
                const obj = gltf.scene
                obj.traverse((child) => {
                    if (child.isMesh) {
                        const newMaterial = new THREE.MeshStandardMaterial({
                            color: child.material.color,
                            map: child.material.map,
                            side: THREE.DoubleSide
                        })
                        child.material = newMaterial
                        child.castShadow = true
                        child.receiveShadow = true
                        child.geometry.computeVertexNormals()
                    }
                })
                Miss.add(obj)
                Miss.position.set(Pos[i].p.x, Pos[i].b.y/2, Pos[i].p.z)
                Miss.rotation.y = Pos[i].r
                missArr[i] = Miss
                missions.add(Miss)

                const cMiss = new CANNON.Body({
                    type: Pos[i].s ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
                    shape: new CANNON.Box(new CANNON.Vec3(Pos[i].b.x, Pos[i].b.y, Pos[i].b.z)),
                    position: new CANNON.Vec3(Pos[i].p.x, Pos[i].b.y, Pos[i].p.z),
                    material: new CANNON.Material({friction: 0.1}),
                    mass: Pos[i].s ? 0 : .5
                })
                cMiss.quaternion.setFromEuler(0, Pos[i].r, 0)
            
                world.addBody(cMiss)
            
                cMissArr[i] = cMiss
            })
        }

        scene.add(missions)

        scene.add(robot)

        const cRobot = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(10, 6, 9.225)),
            position: new CANNON.Vec3(robot.position.x,robot.position.y,robot.position.z),
            mass: 2
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
            } else if (k === "Shift") {
                vel.shift = 1
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
            } else if (k === "Shift") {
                vel.shift = 0
            }
            
        })

        const startPos = camera.position.clone()

        const robotMaterial = new CANNON.Material()
        cRobot.material = robotMaterial
        cPlane.material = robotMaterial

        //const cannonDebugger = new CannonDebugger(scene, world, {})

        function animate() {
            dirBox.position.set(camera.position.x - startPos.x - 80, camera.position.y - startPos.y + 56, camera.position.z - startPos.z + 140);
            dirLight.target.position.set(camera.position.x - startPos.x - 80, camera.position.y - startPos.y + 56, camera.position.z - startPos.z + 140)

            if ((vel.w || vel.a) || (vel.s || vel.d)) {
                cRobot.material.friction = 0.1
                cPlane.material.friction = 0.1
            } else {
                cPlane.material.friction = 0.5
                cRobot.material.friction = 0.5
            }

            let k = 1

            if (vel.shift) {
                k *= 2
            }
            
            if (vel.d && !vel.shift) {
                cRobot.angularVelocity.y = -speed.rot
            } else if (vel.a && !vel.shift) {
                cRobot.angularVelocity.y = speed.rot
            } else {
                cRobot.angularVelocity.y = 0
            }

            let angle = robot.rotation.y
            if (Math.round(Math.abs(robot.rotation.x)*100)/100 != Math.round(Math.PI*100)/100) {
                angle = -robot.rotation.y
                k *= -1
            }
            
            if (vel.w) {
                cRobot.velocity.x = -speed.mov * Math.sin(angle)*k
                cRobot.velocity.z = speed.mov * Math.cos(angle)*k
            } else if (vel.s) {
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

            robot.position.copy(cRobot.position)
            robot.quaternion.copy(cRobot.quaternion)

            for (let i = 0; i < missions.children.length; i++) {
                try {
                    let obj = missArr[i], cObj = cMissArr[i]
                    obj.position.copy(cObj.position)
                    obj.quaternion.copy(cObj.quaternion)
                } catch (e) {}
            }
            
            //cannonDebugger.update()

            renderer.render(scene, camera)
            requestAnimationFrame( animate )
        }
        animate()
    }
}

init()