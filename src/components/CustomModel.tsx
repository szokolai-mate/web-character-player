import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useModelLoader } from '../hooks/useModelLoader';

interface CustomModelProps {
    url: string;
    position?: [number, number, number];
    scale?: [number, number, number];
}

export function CustomModel({ url, position = [0, 0, 0], scale = [1, 1, 1] }: CustomModelProps) {
    const model = useModelLoader(url);
    const ref = useRef<THREE.Object3D>(null);

    useFrame(() => {
        // Animation logic if needed
        if (ref.current) {
        }
    });

    return <primitive object={ model[0][0] } ref = { ref } position = { position } scale = { scale } />;
}