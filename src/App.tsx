import './style.css';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, Html } from '@react-three/drei';
import MainScene from './scenes/MainScene';
import ControlPanel from './scenes/ControlPanel';

/* GOALS:
    - immersion
    - reactiveness
    - customisation
    - full feature of expressions and morphs
    - but as much auto-setup as possible
*/
// TODO: stuff to see in old extension
// hitboxes
// controls seems custom?
// connect both text talk and audio talk
// possibly streaming talk, ie dont just start at the end of the message
// 3d background?
// connecting to the expression classification
// TODO: improvements
// check is VRM 1.0 expression exports can affect materials and uv or not => YES, and even transparency is working!
// document
// mechanism to mix expressions and animations with parameters
// mechanism to define above mixes as new expressions/animations
// web workers for loading?
// migrate to React Three Fiber, meshes, animation, everything
// multi-character management (load, cleanup etc)
// AnimationUtils.subclip and other good stuff in Three animation calsses (like fade)
// Use errorboundry for suspense
// Look through Drei, it has a lot of good stuff
// Extension is now not loading due to Fiber, need to inject, see React Extension template
// multiple <Loader /> possible? how do they even work?
// smart cameras: keep on head, fit all characters etc

/* TODO: UI
 - step 1: talk and blink checkboxes
 - expressions with sliders
 - animations with sliders, multiple parameters
 - ...
*/


export default function App() {
    return (
        <main>
            <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <Canvas
                    camera={{ position: [0, 2, 2], fov: 75 }}
                    gl={{ antialias: true, alpha: true }}
                    onCreated={({ gl }) => {
                        gl.setClearColor('#242424');
                    }}>
                    <Suspense fallback={null}>
                        <MainScene/>
                    </Suspense>
                    <Html center>
                        <Loader />
                    </Html>
                </Canvas>
            </div>
            <ControlPanel/>
        </main>
    );
}

console.log('#################### MY EXTENSION LOADED! ####################');
