import { useRef, use, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { VRMCharacter } from '../character/VRMCharacter';
import { VRMCore } from '@pixiv/three-vrm';
import { useCharacterStore } from '../store';
import { modelLoader } from '../loaders/ModelLoader';
import { useShallow } from 'zustand/shallow';

interface CustomModelProps {
    id: number;
}

export default function CharacterModel({ id }: CustomModelProps) {
    // Get the whole character object.
    const characterState = useCharacterStore.getState().characters.find((c) => c.id === id);
    if (!characterState) return null;
    const url = characterState.url;
    // Load the model using the cache-enabled loader and wait for promise.
    // Memoize the promise itself to prevent re-suspending on re-renders.
    const modelPromise = useMemo(() => modelLoader.load(url), [url]);
    const model = use(modelPromise);
    const ref = useRef<THREE.Object3D>(null);
    const { camera } = useThree();
    // Subscribe to own settings and will re-render if they change.
    const settings = useCharacterStore(
        useShallow((state) => state.characters.find((c) => c.id === id)?.settings),
    );
    // Memoize the VRMCharacter instance so it's only created once per model.
    // This prevents the "flicker" and state reset.
    const character = useMemo(() =>
        new VRMCharacter(model[0][0], model[1].vrm as VRMCore),
    [model],
    );

    useFrame((state, delta) => {
        character.update(delta);
        if (settings && ref.current) {
            const { position, scale, visible } = settings;
            ref.current.position.set(position[0], position[1], position[2]);
            ref.current.scale.setScalar(scale);
            ref.current.visible = visible;
        }
    });

    // setup newly created character
    useMemo(() => {
        //TMP
        character.setLookAt(camera);
        character.setUpInfiniteTalk();
        character.tweenExpression('happy', 0.5, 5000);
        // character.playAnimation('assets/animation/exercise_jumping_jacks.bvh');
        // character.playAnimation('assets/animation/action_run.bvh');
    }, [character, camera]); // Dependency on the memoized character instance

    return <primitive object={ character.scene } ref = { ref } />;
}
