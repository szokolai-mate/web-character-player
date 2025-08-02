import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRMCharacter } from './VRMCharacter';

// Set up scene
const scene = new THREE.Scene();
// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(10, 15, 10);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(0, 10, -10);
scene.add(fillLight);

// Helpers (optional)
const gridHelper = new THREE.GridHelper(30, 30, 0x303030, 0x303030);
scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);
document.body.appendChild(renderer.domElement);

// Initialize model loader
const modelLoader = new ModelLoader();
let characters: VRMCharacter[] = [];
//tmp
var dX = 0;

for (const filename of ['HatsuneMikuNT.vrm', 'Untitled imp.vrm']) {
  modelLoader.load(filename)
      .then(model => {
        const character = new VRMCharacter(model[0][0], model[1].vrm);
        characters.push(character);
        character.scene.position.x += dX;
        dX += 2; // Increment x position for next model
        character.playAnimation("animation/exercise_jumping_jacks.bvh");
        character.setUpInfiniteTalk();
        character.tweenExpression("happy", 1.0, 15000);
        scene.add(character.scene);
      })
      .catch(error => {
          console.error('Error loading model:', error);
          // Fallback to default cube
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          scene.add(new THREE.Mesh(geometry, material));
      });
}

camera.position.z = -2;
camera.position.y = 2;
let clock = new THREE.Clock();
clock.start();

// Animation loop
function animate(time: number) {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  for (const character of characters) {
    character.update(deltaTime);
  }
  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
requestAnimationFrame(animate);