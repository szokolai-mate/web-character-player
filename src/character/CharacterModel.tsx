import { useRef, use } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { VRMCharacter } from '../character/VRMCharacter';
import { VRMCore } from '@pixiv/three-vrm';
import { CharacterSettings } from '../types';

interface CustomModelProps {
    modelPromise: Promise<[THREE.Object3D[], Record<string, unknown>]>;
    settings: CharacterSettings
    // TODO: I may need to separate this display component and control
}

export function CharacterModel({ modelPromise, settings }: CustomModelProps) {
    const model = use(modelPromise);
    const ref = useRef<THREE.Object3D>(null);
    // TODO: we should probably not construct characters here, I think the now introduced CharacterSettings is also weak
    const character = new VRMCharacter(model[0][0], model[1].vrm as VRMCore);
    //TMP
    const camera = useThree().camera;
    character.setLookAt(camera);
    character.setUpInfiniteTalk();
    character.tweenExpression('happy', 0.5, 5000);
    // character.playAnimation('assets/animation/action_run.bvh');
    // character.playAnimation('assets/animation/exercise_jumping_jacks.bvh');

    useFrame((state, delta) => {
        character.update(delta);
    });

    return <primitive object={ character.scene } ref = { ref } position = { settings.position } scale = { settings.scale }/>;
}
