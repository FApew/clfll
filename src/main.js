import * as THREE from "three"
import WebGL from 'three/addons/capabilities/WebGL.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById("main")

const scene = new THREE.Scene()
const loader = new GLTFLoader()

function init() {
    if (WebGL.isWebGLAvailable()) {
        let vel = {w: 0, a: 0, s: 0, d: 0}

        const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000)
        camera.position.set(0, 50, 100)

        const renderer = new THREE.WebGLRenderer({ antialias: true})
        renderer.setSize( container.clientWidth, container.clientHeight)
        container.appendChild(renderer.domElement)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        const controls = new OrbitControls( camera, renderer.domElement)
        controls.enableRotate = false
        controls.screenSpacePanning = false;
        controls.enableZoom = false

        const dirLight = new THREE.DirectionalLight( 0xffffff, 3)
        dirLight.color.setHSL( 0.1, 1, 0.95)
        dirLight.position.set( -.3, 1.5, .1)
        dirLight.position.multiplyScalar(30)
        dirLight.castShadow = true
        let shadow = dirLight.shadow.camera
        let fSize = 90
        shadow.top = fSize*2
        shadow.right = fSize*2
        shadow.bottom = -fSize
        shadow.left = -fSize*2
        let sSize = 1024
        dirLight.shadow.mapSize.width = sSize
        dirLight.shadow.mapSize.height = sSize
        dirLight.shadow.camera.bias = -0.005
        dirLight.shadow.bias = -0.005

        const dirBox = new THREE.Group()
        dirBox.add(dirLight)
        scene.add(dirBox)
        scene.add(dirLight.target)

        const hemiLight = new THREE.HemisphereLight( 0xe1e1e1, 0xc5c5c5, 1.8)
        hemiLight.position.set( 0, 50, 0)
        scene.add(hemiLight)

        const plane = new THREE.Mesh(
            new THREE.BoxGeometry(16000, 0.01, 16000),
            new THREE.MeshStandardMaterial({ color: 0x29c1e7 })
        )
        plane.receiveShadow = true
        scene.add(plane)

        const helper = new THREE.CameraHelper( dirLight.shadow.camera );
        //scene.add( helper )

        const pole = new THREE.Mesh(
            new THREE.BoxGeometry(5, 50, 5),
            new THREE.MeshStandardMaterial({color: 0x131313})
        )
        pole.position.x = 30
        pole.position.y=25
        pole.castShadow = true
        scene.add(pole)

        let robot = new THREE.Group()
        loader.load("../src/assets/model/0.glb", (gltf) => {
            let obj = gltf.scene;
            obj.position.set(0, 0, 0);
            obj.scale.set(1, 1, 1);
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
            robot.add(obj)
            robot.rotation.set(0,Math.PI*5/6,0)
            scene.add(robot);
        })
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

        let startPos = camera.position.clone()
        function animate() {
            dirBox.position.set(camera.position.x - startPos.x, camera.position.y - startPos.y, camera.position.z - startPos.z);
            dirLight.target.position.set(camera.position.x - startPos.x, camera.position.y - startPos.y, camera.position.z - startPos.z)

            if (vel.d) {
                robot.rotation.y-=Math.PI / 64
            }
            if (vel.a) {
                robot.rotation.y+=Math.PI / 64
            }
            if (vel.w) {
                robot.position.x+=-0.5*Math.sin(robot.rotation.y)
                robot.position.z+=-0.5*Math.cos(robot.rotation.y)
            }
            if (vel.s) {
                robot.position.x+=0.5*Math.sin(robot.rotation.y)
                robot.position.z+=0.5*Math.cos(robot.rotation.y)
            }
            

            if ((vel.w || vel.a) || (vel.s || vel.d)) {
                camera.position.set(robot.position.x, 50, robot.position.z+100)
                camera.lookAt(robot.position)
            } else {
                controls.update()
                camera.rotation.set(-0.4636,0,0)
            }

            

            requestAnimationFrame( animate );
            renderer.render( scene, camera );
        }
        animate()
    }
}

init()