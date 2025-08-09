import { useMemo } from 'react';
import { useRef, use } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { VRMCharacter } from '../character/VRMCharacter';
import { VRMCore } from '@pixiv/three-vrm';
import { useCharacterStore } from '../store';
import { modelLoader } from '../loaders/ModelLoader';

interface CustomModelProps {
    id: number;
}

export default function CharacterModel({ id }: CustomModelProps) {
    // Get the static URL once on initial render. This will not cause re-renders.
    const url = useCharacterStore.getState().characters.find(c => c.id === id)!.url;
    // Load the model using the cache-enabled loader.
    const model = use(modelLoader.load(url));
    const ref = useRef<THREE.Object3D>(null);
    // Memoize the VRMCharacter instance so it's only created once per model.
    // This prevents the "flicker" and state reset.
    const character = useMemo(() =>
        // TODO: we should probably not construct characters here, probably put them in store?
        new VRMCharacter(model[0][0], model[1].vrm as VRMCore),
    [model],
    );

    useFrame((state, delta) => {
        // Get the latest state directly from the store on every frame.
        // This does NOT trigger a re-render.
        const characterState = useCharacterStore.getState().characters.find((c) => c.id === id);
        const position = characterState?.settings.position;
        const scale = characterState?.settings.scale;
        if (position && scale) {
            ref.current?.position.set(position[0], position[1], position[2]);
            ref.current?.scale.setScalar(scale);
        }
        character.update(delta);
    });

    // setup newly created character
    useMemo(() => {
        //TMP
        const camera = useThree().camera;
        character.setLookAt(camera);
        character.setUpInfiniteTalk();
        character.tweenExpression('happy', 0.5, 5000);
        // character.playAnimation('assets/animation/exercise_jumping_jacks.bvh');
        // character.playAnimation('assets/animation/action_run.bvh');
    }, [character]); // Dependency on the memoized character instance

    return <primitive object={ character.scene } ref = { ref } />;
}
