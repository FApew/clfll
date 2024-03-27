import * as THREE from "three"
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

export let robot = new THREE.Group()
loader.load("../src/assets/model/0.glb", (gltf) => {
    let obj = gltf.scene;
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
})

robot.position.set(-80, 50, 40)
robot.rotation.set(0,Math.PI*-1/4,0)

export let chasBody = new CANNON.Body({
    mass: 5,
    position: new CANNON.Vec3(robot.position.x,robot.position.y,robot.position.z),
    rotation: new CANNON.Quaternion().setFromEuler(Math.PI/2,234,0),
    shape: new CANNON.Box( new CANNON.Vec3(10, 5.3, 9.225))
})

export const cRobot = new CANNON.RigidVehicle({
    chassisBody: chasBody
})
let mat = new CANNON.Material("wheel")
mat.friction = 0

let sh = new CANNON.Sphere(2.8)//CANNON.Cylinder(2.8, 2.8, 1.5, 16)
export let wheel1 = new CANNON.Body({
    mass: 1,
    material: mat
})

wheel1.addShape(sh, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion().setFromEuler(0, 0, Math.PI/2))
wheel1.angularDamping = .4

export let wheel2 = new CANNON.Body({
    mass: 1,
    material: mat
})
wheel2.addShape(sh, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion().setFromEuler(0, 0, Math.PI/2))
wheel2.angularDamping = .4

sh = new CANNON.Sphere(0.85)//CANNON.Cylinder(0.85, 0.85, 0.72, 16)
mat = new CANNON.Material("wheel")
mat.friction = 0

let wheel3 = new CANNON.Body({
    mass: .5,
    material: mat
})
wheel3.addShape(sh, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion().setFromEuler(0, 0, Math.PI/2))
wheel3.angularDamping = 0

let wheel4 = new CANNON.Body({
    mass: .5,
    material: mat
})
wheel4.addShape(sh, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion().setFromEuler(0, 0, Math.PI/2))
wheel4.angularDamping = 0

cRobot.addWheel({
    body: wheel1,
    position: new CANNON.Vec3(8.075, -2.7, 4.775),
    axis: new CANNON.Vec3(1,0,0),
    direction: new CANNON.Vec3(0,0,1),
})

cRobot.addWheel({
    body: wheel2,
    position: new CANNON.Vec3(-7.975, -2.7, 4.775),
    axis: new CANNON.Vec3(1,0,0),
    direction: new CANNON.Vec3(0,0,1),
})

cRobot.addWheel({
    body: wheel3,
    position: new CANNON.Vec3(6.375, -4.75, -5.625),
    axis: new CANNON.Vec3(1,0,0),
    direction: new CANNON.Vec3(0,0,1),
})

cRobot.addWheel({
    body: wheel4,
    position: new CANNON.Vec3(-5.625, -4.75, -5.625),
    axis: new CANNON.Vec3(1,0,0),
    direction: new CANNON.Vec3(0,0,1),
})