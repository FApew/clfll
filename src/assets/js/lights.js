import * as THREE from "three"

export const dirLight = new THREE.DirectionalLight( 0xffffff, 3)
dirLight.color.setHSL( 0.1, 1, 0.95)
dirLight.position.set( -10, 45, 2.3)
dirLight.castShadow = true
let shadow = dirLight.shadow.camera
let fSize = 110      
shadow.top = fSize*2
shadow.right = fSize*2
shadow.bottom = -fSize
shadow.left = -fSize*3
let sSize = 1024
dirLight.shadow.mapSize.width = sSize
dirLight.shadow.mapSize.height = sSize
dirLight.shadow.camera.bias = -0.005
dirLight.shadow.bias = -0.005

export const hemiLight = new THREE.HemisphereLight( 0xe1e1e1, 0xc5c5c5, 1.8)
hemiLight.position.set( 0, 50, 0)
