//TODO: refactor
import { useState } from 'react';
import * as THREE from 'three';
import { ModelLoader } from '../loaders/ModelLoader';

// TODO: Create a cache to store loaded models?

// Create a cache to store loaded models
const cache = new Map<string, [THREE.Object3D[], Record<string, unknown>]>();


export function useModelLoader(url: string): [THREE.Object3D[], Record<string, unknown>] {
    const [model, setModel] = useState<[THREE.Object3D[], Record<string, unknown>] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    // Check cache first
    const cachedModel = cache.get(url);
    if (cachedModel) return cachedModel;

    // Throw error for Suspense boundary if we're in loading state
    if (!model && !error) throw load(url, setModel, setError);
    if (error) throw error;
    if (model) {
        cache.set(url, model);
        return model;
    }

    // Should never reach here
    throw new Error('Unexpected loader state');
}

async function load(
    url: string,
    setModel: (model: [THREE.Object3D[], Record<string, unknown>]) => void,
    setError: (error: Error) => void
): Promise<void> {
    try {
        const loader = new ModelLoader();
        // Note: only GLTF for now
        const model = await loader.load(url);
        cache.set(url, model);
        setModel(model);
    } catch (err) {
        setError(err as Error);
    }
}
