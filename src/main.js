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

const sphereRadius = 7

const speed = {rot: .5, mov:6}

function init() {
    if (WebGL.isWebGLAvailable()) {
        alert("wasd for move the robot");
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

        for (let i = 0; i < 1; i++) {
            loader.load(`../src/assets/model/${i+1}.glb`, (gltf) => {
                let obj = gltf.scene;
                obj.scale.set(1, 1, 1);
                obj.position.set(Pos[i].p.x, 0, Pos[i].p.z)
                obj.rotation.y = Pos[i].r,
                obj.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            child.material = new THREE.MeshStandardMaterial({ color: child.material.color, map: child.material.map })
                            child.material.side = THREE.DoubleSide
                        }
                        child.geometry.computeVertexNormals()
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                missions.add(obj)
            })

            const cMiss = new CANNON.Body({
                type: CANNON.Body.STATIC,
                shape: new CANNON.Box( new CANNON.Vec3(Pos[i].b.x, Pos[i].b.y, Pos[i].b.z))
            })
            cMiss.position.y = Pos[i].b.y/2
            world.addBody(cMiss)
        }

        


        scene.add(missions)
        missions.children.forEach((child) => {
            console.log(child.position)
        })

        const palla = new THREE.Mesh(
            new THREE.SphereGeometry(sphereRadius),
            new THREE.MeshStandardMaterial({color: 0xa17fff})
        )
        palla.position.x = 20
        palla.position.y = sphereRadius+5
        palla.position.z = 0
        palla.castShadow = true
        scene.add(palla)

        const cpalla = new CANNON.Body({
            shape: new CANNON.Sphere(sphereRadius),
            position: new CANNON.Vec3(palla.position.x, palla.position.y, palla.position.z),
            mass: sphereRadius*2
        })
        world.addBody(cpalla)

        scene.add(robot)

        const cRobot = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(10, 6, 9.225)),
            position: new CANNON.Vec3(robot.position.x,robot.position.y,robot.position.z),
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

        
        //reset button
        document.addEventListener("keypress", (e) => {
            let k = e.key

            if (k === "r")
            {
                cRobot.position.set(robot.position.x,robot.position.y+10,robot.position.z)
                cRobot.quaternion.setFromEuler(0,Math.PI*-1/4,0)
            }    
        }) 


        const startPos = camera.position.clone()

        const robotMaterial = new CANNON.Material()
        cRobot.material = robotMaterial
        cPlane.material = robotMaterial

        //const cannonDebugger = new CannonDebugger(scene, world, {})

        function animate() {
            dirBox.position.set(camera.position.x - startPos.x, camera.position.y - startPos.y, camera.position.z - startPos.z);
            dirLight.target.position.set(camera.position.x - startPos.x, camera.position.y - startPos.y, camera.position.z - startPos.z)

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

            palla.position.copy(cpalla.position)
            palla.quaternion.copy(cpalla.quaternion)
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