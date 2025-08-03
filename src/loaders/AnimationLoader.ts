import * as THREE from 'three';
import { BVHLoader } from 'three-stdlib';
import { VRMCore, VRMHumanBoneName } from '@pixiv/three-vrm';

export class AnimationLoader {
    private loader = new BVHLoader();

    constructor() { }

    // adapted from https://github.com/SillyTavern/Extension-VRM/blob/a9d4801812cdd5ae7a7ebd5e9ac3efcf4c7b8dfc/animationLoader.js
    public async BHVforVRM(url: string, vrm: VRMCore): Promise<THREE.AnimationClip> {
        return this.loader.loadAsync(url).then((result) => {
            const tracks: THREE.KeyframeTrack[] = []; // KeyframeTracks compatible with VRM will be added here
            // Adjust with reference to hips height.
            const motionHipsHeight = result.skeleton.getBoneByName('hips')?.position.y;
            const vrmHipsY = vrm.humanoid.getNormalizedBoneNode('hips')?.position.y || 0.0;
            const vrmRootY = vrm.scene.position.y;
            const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
            const hipsPositionScale = vrmHipsHeight / (motionHipsHeight || 1.0);
            const restRotationInverse = new THREE.Quaternion();

            for (const track of result.clip.tracks) {
                const splitTrackName = track.name.split('.', 3);
                const vrmBoneNameRaw = splitTrackName[1];
                const propertyName = splitTrackName[2];
                const vrmBoneName = vrmBoneNameRaw.split('[')[1].split(']')[0];
                const vrmNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName as VRMHumanBoneName);
                if (!vrmNode?.name || !(vrmNode?.name)) continue;
                const bvhBone = result.skeleton.getBoneByName(vrmBoneName);
                if (!bvhBone) continue;

                // Calculate rest rotations
                bvhBone.getWorldQuaternion(restRotationInverse).invert();
                const parentWorldRotation = bvhBone.parent
                    ? AnimationLoader.getWorldQuaternion(bvhBone.parent)
                    : new THREE.Quaternion(); // Identity if no parent

                // Process track based on type
                if (track instanceof THREE.QuaternionKeyframeTrack) {
                    tracks.push(
                        AnimationLoader.createRetargetedQuaternionTrack(
                            vrmNode.name,
                            propertyName,
                            track,
                            parentWorldRotation,
                            restRotationInverse,
                            vrm.meta?.metaVersion,
                        ),
                    );
                } else if (track instanceof THREE.VectorKeyframeTrack) {
                    tracks.push(
                        AnimationLoader.createRetargetedVectorTrack(
                            vrmNode.name,
                            propertyName,
                            track,
                            hipsPositionScale,
                            vrm.meta?.metaVersion,
                        ),
                    );
                }
            }
            return new THREE.AnimationClip(url, result.clip.duration, tracks);
        });
    }

    private static getWorldQuaternion(node: THREE.Object3D): THREE.Quaternion {
        const quat = new THREE.Quaternion();
        return node.getWorldQuaternion(quat);
    }

    private static createRetargetedQuaternionTrack(
        nodeName: string,
        property: string,
        track: THREE.QuaternionKeyframeTrack,
        parentRestRotation: THREE.Quaternion,
        boneRestRotationInverse: THREE.Quaternion,
        vrmVersion?: string,
    ): THREE.QuaternionKeyframeTrack {
        const { times, values } = track;
        const retargetedValues = new Array(values.length);

        for (let i = 0; i < values.length; i += 4) {
            const quaternion = new THREE.Quaternion().fromArray(values, i)
                .premultiply(parentRestRotation)
                .multiply(boneRestRotationInverse);

            quaternion.toArray(retargetedValues, i);
        }

        // VRM v0 coordinate adjustment
        const adjustedValues = vrmVersion === '0'
            ? retargetedValues.map((v, idx) => idx % 2 === 0 ? -v : v)
            : retargetedValues;

        return new THREE.QuaternionKeyframeTrack(
            `${nodeName}.${property}`,
            times,
            adjustedValues,
        );
    }

    private static createRetargetedVectorTrack(
        nodeName: string,
        property: string,
        track: THREE.VectorKeyframeTrack,
        scale: number,
        vrmVersion?: string,
    ): THREE.VectorKeyframeTrack {
        const adjustedValues = track.values.map((value, index) => {
            const scaledValue = value * scale;
            // Flip x/z for VRM v0
            return vrmVersion === '0' && index % 3 !== 1
                ? -scaledValue
                : scaledValue;
        });

        return new THREE.VectorKeyframeTrack(
            `${nodeName}.${property}`,
            track.times,
            adjustedValues,
        );
    }
}
