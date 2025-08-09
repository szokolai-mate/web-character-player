import * as THREE from 'three';
// TODO: implement FBX support
//import { FBXLoader } from 'three-stdlib';
// TODO: not sure if this MMDLoader has full functionality, like morph parsing
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
// TODO: this import causes type mismatch
//import { GLTFLoader } from 'three-stdlib';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

class ModelLoader {
    private static readonly LOGPREFIX = '[ModelLoader] ';

    private loader: GLTFLoader;
    private cache = new Map<string, Promise<[THREE.Object3D[], Record<string, unknown>]>>();

    constructor() {
        this.loader = new GLTFLoader();
        this.loader.register((parser) => {
            return new VRMLoaderPlugin(parser);
        });
    }

    public async load(url: string, type: string = 'GLTF'): Promise<[THREE.Object3D[], Record<string, unknown>]> {
        if (this.cache.has(url)) {
            console.log(ModelLoader.LOGPREFIX, `Returning cached model for ${url}`);
            return this.cache.get(url)!;
        }
        const promise = new Promise<[THREE.Object3D[], Record<string, unknown>]>((resolve, reject) => {
            if (type == 'GLTF') {
                this.loader.load(
                    url,
                    (model) => {
                        VRMUtils.rotateVRM0(model.userData.vrm);
                        // TODO: these "fixes" mention morph, might lead to problems later
                        // calling these functions greatly improves the performance
                        VRMUtils.combineMorphs( model.userData.vrm );
                        for (const scene of model.scenes) {
                            VRMUtils.removeUnnecessaryVertices( scene );
                            VRMUtils.combineSkeletons( scene );
                        }
                        resolve([model.scenes, model.userData]);
                    },
                    ModelLoader.progressFunctor,
                    ModelLoader.errorFunctor,
                );
            }
            else if (type == 'MMD') {
                const loader = new MMDLoader();
                loader.load(
                    url,
                    (model) => {
                        console.log(model);
                        // Critical material fixes
                        model.traverse(child => {
                            if (child instanceof THREE.Mesh) {
                                const materials = Array.isArray(child.material)
                                    ? child.material
                                    : [child.material];

                                materials.forEach(material => {
                                    // WORKAROUND: deprecated MMDLoader can cause washed out colors
                                    // https://github.com/mrdoob/three.js/issues/28336
                                    // Make textures show under lighting
                                    if (material.emissive) {
                                        material.emissive.setHex(0x000000);
                                    }
                                    material.needsUpdate = true;
                                });
                            }
                        });
                        resolve([[model], {}]);
                    },
                    ModelLoader.progressFunctor,
                    ModelLoader.errorFunctor,
                );
            }
        });
        this.cache.set(url, promise);
        return promise;
    }

    private static progressFunctor(progress: ProgressEvent): void {
        console.info(ModelLoader.LOGPREFIX + `Loading: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
    }

    private static errorFunctor(error: unknown) {
        console.error(ModelLoader.LOGPREFIX + ' Error loading model:', error);
    }
}

// Singleton: Export a single instance to share the cache across the app
export const modelLoader = new ModelLoader();
