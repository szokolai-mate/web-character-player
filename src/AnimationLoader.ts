import * as THREE from 'three';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader';
import { VRMCore, VRMHumanBoneName } from '@pixiv/three-vrm';

export class AnimationLoader {
	private loader = new BVHLoader();

	constructor(){}

public async BHVforVRM( url: string, vrm: VRMCore): Promise<THREE.AnimationClip> {
    return this.loader.loadAsync( url ).then( ( result ) => {
		//TODO: refactor
        const skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
        skeletonHelper.name = "BVHtest";
		const clip = result.clip; 

		const tracks: THREE.KeyframeTrack[] = []; // KeyframeTracks compatible with VRM will be added here

		const restRotationInverse = new THREE.Quaternion();
		const parentRestWorldRotation = new THREE.Quaternion();
		const _quatA = new THREE.Quaternion();

		// Adjust with reference to hips height.
		const motionHipsHeight = result.skeleton.getBoneByName("hips")?.position.y;
		const vrmHipsY = vrm.humanoid?.getNormalizedBoneNode( 'hips' )?.position.y || 0;
		const vrmRootY = vrm.scene.position.y;
		const vrmHipsHeight = Math.abs( vrmHipsY - vrmRootY );//Math.abs( vrmHipsY - vrmRootY );
		const hipsPositionScale = vrmHipsHeight / (motionHipsHeight || 0);

		for (const track of clip.tracks) {

			// Convert each tracks for VRM use, and push to `tracks`
			const trackSplitted = track.name.split( '.' );
            const vrmBoneName = trackSplitted[ 0 ];
			const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode( vrmBoneName as VRMHumanBoneName )?.name;
            const bvhRigNode = result.skeleton.getBoneByName(vrmBoneName);

			if ( vrmNodeName != null ) {

				const propertyName = trackSplitted[ 1 ];

				// Store rotations of rest-pose.
				bvhRigNode?.getWorldQuaternion( restRotationInverse ).invert();
                if (bvhRigNode?.parent){
				    bvhRigNode?.parent.getWorldQuaternion( parentRestWorldRotation );
				}

				if ( track instanceof THREE.QuaternionKeyframeTrack ) {

					// Retarget rotation of bvhRig to NormalizedBone.
					for ( let i = 0; i < track.values.length; i += 4 ) {

						const flatQuaternion = track.values.slice( i, i + 4 );

						_quatA.fromArray( flatQuaternion );

						// Parent's World Rotation at Rest * Track Rotation * Inverse of World Rotation at Rest
						_quatA
							.premultiply( parentRestWorldRotation )
							.multiply( restRotationInverse );

						_quatA.toArray( flatQuaternion );

						flatQuaternion.forEach( ( v, index ) => {

							track.values[ index + i ] = v;

						} );

					}

					tracks.push(
						new THREE.QuaternionKeyframeTrack(
							`${vrmNodeName}.${propertyName}`,
							track.times,
							track.values.map( ( v, i ) => ( vrm.meta?.metaVersion === '0' && i % 2 === 0 ? - v : v ) ),
						),
					);

				} else if ( track instanceof THREE.VectorKeyframeTrack ) {
					const value = track.values.map( ( v, i ) => ( vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? - v : v ) * hipsPositionScale );
					tracks.push( new THREE.VectorKeyframeTrack( `${vrmNodeName}.${propertyName}`, track.times, value ) );
				}
			}
		}
		return new THREE.AnimationClip( url, clip.duration, tracks );
	});
	}
}