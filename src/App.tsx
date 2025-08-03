import './style.css';
import * as THREE from 'three';
import { ModelLoader } from './loaders/ModelLoader';
import { OrbitControls } from 'three-stdlib';
import { VRMCharacter } from './classes/VRMCharacter';
import { VRMCore } from '@pixiv/three-vrm';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, Html } from '@react-three/drei';
import MainScene from './scenes/MainScene';

// TODO: stuff to see in old extension
// hitboxes
// renderer and camera settings
// controls seems custom?
// frustum culling??
// connect both text talk and audio talk
// possibly streaming talk, ie dont just start at the end of the message
// 3d background?
// connecting to the expression classification
// TODO: improvements
// check is VRM 1.0 expression exports can affect materials and uv or not
// document
// good interface for mixing expressions and animations, with parameters
// -> i will need React
// web workers for loading?
// migrate to React Three Fiber, meshes, animation, everything
// multi-character management (load, cleanup etc)
// AnimationUtils.subclip and other good stuff in Three animation calsses (like fade)
// Use errorboundry for suspense
// Look through Drei, it has a lot of good stuff
// Extension is now not loading due to Fiber, need to inject, see React Extension template

export default function App() {
    return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 2, 2], fov: 75 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#242424');
        }}>
        <Suspense fallback={null}>
            <MainScene color='blue' urls={['assets/HatsuneMikuNT.vrm', 'assets/Untitled imp.vrm']}/>
        </Suspense>
        <Html center>
            <Loader />
        </Html>
      </Canvas>
    </div>
  );
}

console.log("#################### MY EXTENSION LOADED! ####################");
/*
// Initialize model loader
const modelLoader = new ModelLoader();
const characters: VRMCharacter[] = [];
//tmp
let dX = 0;
for (const filename of ['assets/HatsuneMikuNT.vrm', 'assets/Untitled imp.vrm', 'assets/Untitled impv1.vrm']) {
    modelLoader.load(filename)
        .then(model => {
            const character = new VRMCharacter(model[0][0], model[1].vrm as VRMCore);
            characters.push(character);
            character.scene.position.x += dX;
            dX += 2; // Increment x position for next model
            character.playAnimation('assets/animation/action_run.bvh');
            character.playAnimation('assets/animation/exercise_jumping_jacks.bvh');
            character.setUpInfiniteTalk();
            character.tweenExpression('happy', 0.5, 5000);
            character.setLookAt(camera);
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

const clock = new THREE.Clock();
clock.start();

// Animation loop
function animate(time: number) {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    for (const character of characters) {
        character.update(deltaTime);
    }
}
*/