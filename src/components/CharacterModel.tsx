import { useRef, use } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { VRMCharacter } from '../classes/VRMCharacter';
import { VRMCore } from '@pixiv/three-vrm';

interface CustomModelProps {
    modelPromise: Promise<[THREE.Object3D[], Record<string, unknown>]>;
    position?: [number, number, number];
    scale?: [number, number, number];
    // TODO: I may need to separate this display component and control
}

export function CharacterModel({ modelPromise, position = [0, 0, 0], scale = [1, 1, 1] }: CustomModelProps) {
    const model = use(modelPromise);
    const ref = useRef<THREE.Object3D>(null);
    const character = new VRMCharacter(model[0][0], model[1].vrm as VRMCore);
    //TMP
    const camera = useThree().camera;
    character.setLookAt(camera);
    character.setUpInfiniteTalk();
    character.tweenExpression('happy', 0.5, 5000);
    character.playAnimation('assets/animation/action_run.bvh');
    character.playAnimation('assets/animation/exercise_jumping_jacks.bvh');

    useFrame((state, delta) => {
        character.update(delta);
    });

    return <primitive object={ character.scene } ref = { ref } position = { position } scale = { scale } />;
}
