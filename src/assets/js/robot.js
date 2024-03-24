import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

export let robot = new THREE.Group()
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
})

robot.position.y = 20
robot.rotation.set(0,Math.PI*5/6,0)