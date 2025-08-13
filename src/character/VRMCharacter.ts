import * as THREE from 'three'
import { Character } from './Character';
import { Tween, Easing } from '@tweenjs/tween.js';
import { VRMCore } from '@pixiv/three-vrm';

export class VRMCharacter extends Character {
    protected vrm: VRMCore;
    // TODO: must be determined by setting or active expressions
    protected minBlink: number = 0.0;
    private idleTime = 0.0;
    private saccadeOffsetQuat  = new THREE.Quaternion();
    private smoothedProxyQuat = new THREE.Quaternion();
    private microSaccadeTimer = 0.0;
    private macroSaccadeTimer = 0.0;
    private headSlerpFactor = 0.25;

    constructor(scene: THREE.Object3D, vrm: VRMCore) {
        super(scene);
        this.vrm = vrm;
        this.setUpMouthTweens();
        this.setUpBlinking();
        this.unTPose();
        const head = this.vrm.humanoid?.getNormalizedBoneNode('head');
        if (head) {
            this.smoothedProxyQuat.copy(head.quaternion);
        }
    }

    public override update(dT: number): void {
        super.update(dT);
        this.vrm.update(dT);
        this.updateHeadLookAt();
        this.idleTime += dT;
        this.microSaccadeTimer -= dT;
        this.macroSaccadeTimer -= dT;
    }

    private updateHeadLookAt(): void {
        const target = this.vrm.lookAt?.target;
        if (!target || !this.vrm.humanoid) {
            return;
        }

        const head = this.vrm.humanoid.getNormalizedBoneNode('head');
        if (!head || !head.parent) {
            return;
        }
        // Define the full bone chain and their contribution factors.
        const bodyBones = [
            { bone: this.vrm.humanoid.getNormalizedBoneNode('hips'), factor: 0.2 },
            { bone: this.vrm.humanoid.getNormalizedBoneNode('spine'), factor: 0.3 },
            { bone: this.vrm.humanoid.getNormalizedBoneNode('chest'), factor: 0.35 },
            { bone: this.vrm.humanoid.getNormalizedBoneNode('neck'), factor: 0.15 }
        ].filter(item => item.bone); // Filter out any bones the model might not have
        const targetLocalQuat = this.calculateTargetLocalQuat(target, head);
        const totalYaw = new THREE.Euler().setFromQuaternion(targetLocalQuat, 'YXZ').y;
        const comfortZone = Math.PI * 0.16; // Approx 30 degrees
        const bodySlerpFactor = 0.08;
        // Distribute the rotation across the bone chain.
        for (const { bone, factor } of bodyBones) {
            if (!bone) continue;
            if (Math.abs(totalYaw) > comfortZone) {
                // Each bone gets a small, independent rotation based on its factor. These will cascade and add up.
                const boneYaw = totalYaw * factor;
                const boneTargetRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, boneYaw, 0, 'YXZ'));
                bone.quaternion.slerp(boneTargetRot, bodySlerpFactor);
            } else {
                // Slerp back to neutral if the target is in the comfort zone.
                bone.quaternion.slerp(new THREE.Quaternion(), bodySlerpFactor);
            }
        }
        let randomEuler: THREE.Euler;
        // Check for a major readjustment (rarer, bigger movement)
        if (this.macroSaccadeTimer <= 0.0) {
            this.macroSaccadeTimer = 7.0 + Math.random() * 8.0;
            // A macro movement should delay the next micro movement
            this.microSaccadeTimer = 1.5 + Math.random() * 4.0;
            this.headSlerpFactor = 0.01 + Math.random() * 0.15;
            // Add a large random offset for a major gaze shift
            randomEuler = new THREE.Euler(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.5) * 0.05,
                'YXZ'
            );
            // Add a chance for a rare head tilt
            if (Math.random() < 0.3) {
                // dampen XY for tilt
                randomEuler.x *= 0.6;
                randomEuler.y *= 0.6;
                randomEuler.z = (Math.random() - 0.5) * 0.25;
                if (randomEuler.z < 0) {
                    randomEuler.z -= 0.12;
                }
                else {
                    randomEuler.z += 0.12;
                }
            }
            this.saccadeOffsetQuat.setFromEuler(randomEuler);
        }
        // Check for a minor adjustment (common, smaller movement)
        else if (this.microSaccadeTimer <= 0.0) {
            this.microSaccadeTimer = 1.0 + Math.random() * 2.0;
            this.headSlerpFactor = 0.4;
            randomEuler = new THREE.Euler(
                (Math.random() - 0.5) * 0.10,
                (Math.random() - 0.5) * 0.12,
                0,
                'YXZ'
            );
            this.saccadeOffsetQuat.setFromEuler(randomEuler);
        }
        // Apply our stored offset to create the final saccade target.
        const finalTargetQuat = targetLocalQuat.multiply(this.saccadeOffsetQuat);
        // Proxy smoothly chases the final target
        this.smoothedProxyQuat.slerp(finalTargetQuat, 0.1);
        // Head chases the proxy at the determined speed
        head.quaternion.slerp(this.smoothedProxyQuat, this.headSlerpFactor);
        // --- Final Layers and Constraints ---
        const euler = new THREE.Euler().setFromQuaternion(head.quaternion, 'YXZ');
        const noiseMagnitudeX = 0.002, noiseMagnitudeY = 0.003;
        const noiseSpeedX = 0.7, noiseSpeedY = 0.5;
        euler.x += Math.sin(this.idleTime * noiseSpeedX) * noiseMagnitudeX;
        euler.y += Math.sin(this.idleTime * noiseSpeedY) * noiseMagnitudeY;
        euler.x = Math.max(Math.PI * -0.25, Math.min(Math.PI * 0.15, euler.x));
        euler.y = Math.max(Math.PI * -0.4, Math.min(Math.PI * 0.4, euler.y));
        euler.z = Math.max(Math.PI * -0.07, Math.min(Math.PI * 0.07, euler.z));
        head.quaternion.setFromEuler(euler);
    }
    
    private calculateTargetLocalQuat(target: THREE.Object3D, head: THREE.Object3D): THREE.Quaternion {
        const targetWorldPos = new THREE.Vector3();
        target.getWorldPosition(targetWorldPos);

        const headWorldPos = new THREE.Vector3();
        head.getWorldPosition(headWorldPos);

        const lookAtMatrix = new THREE.Matrix4().lookAt(targetWorldPos, headWorldPos, new THREE.Vector3(0, 1, 0));
        const targetWorldQuat = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);

        const parentWorldQuat = new THREE.Quaternion();
        head.parent!.getWorldQuaternion(parentWorldQuat);
        const parentWorldQuatInv = parentWorldQuat.clone().invert();

        const targetLocalQuat = parentWorldQuatInv.multiply(targetWorldQuat);

        if (this.vrm.meta?.metaVersion !== '1') {
            const y180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
            targetLocalQuat.multiply(y180);
        }
        return targetLocalQuat;
    }

    /**
     * Sets the target to look at.
     * @param target - The target to look at. If null, tracking will be disabled.
     */
    public setLookAt(target: THREE.Object3D | null): void {
        if (this.vrm.lookAt) {
            this.vrm.lookAt.target = target;
        }
    }

    public unTPose(): void {
        const h = this.vrm.humanoid;
        const bone1 = h.getNormalizedBoneNode('rightUpperArm');
        const bone2 = h.getNormalizedBoneNode('rightLowerArm');
        const bone3 = h.getNormalizedBoneNode('leftUpperArm');
        const bone4 = h.getNormalizedBoneNode('leftLowerArm');
        if (bone1 && bone2 && bone3 && bone4) {
            if (this.vrm.meta?.metaVersion === '1') {
                bone1.rotation.z = -250;
                bone2.rotation.z = 0.2;
                bone3.rotation.z = 250;
                bone4.rotation.z = -0.2;
            }
            else {
                bone1.rotation.z = 250;
                bone2.rotation.z = -0.2;
                bone3.rotation.z = -250;
                bone4.rotation.z = 0.2;
            }
        }
    }

    public createExpressionTween(name: string, weight: number, time: number, curve: (a: number) => number = Easing.Sinusoidal.InOut): Tween | null {
        if (this.vrm.expressionManager) {
            const expression = this.vrm.expressionManager.getExpression(name);
            if (expression) {
                const t = new Tween(expression)
                    .to({ weight: weight }, time)
                    .easing(curve);
                return t;
            }
        }
        return null;
    }

    public tweenExpression(name: string, weight: number, time: number, curve: (a: number) => number = Easing.Sinusoidal.InOut): void {
        const t = this.createExpressionTween(name, weight, time, curve);
        if (t) {
            t.onComplete(() => {
                this.tweens.remove(t);
            });
            t.start();
            this.tweens.add(t);
        }
        //TODO error
    }

    public setExpression(name: string, weight: number): void {
        if (this.vrm.expressionManager) {
            const expression = this.vrm.expressionManager.getExpression(name);
            if (expression) {
                expression.weight = weight;
            }
        }
        //TODO error
    }

    public getAvailableExpressions() {
        if (this.vrm.expressionManager) {
            return this.vrm.expressionManager.expressionMap;
        }
        else return {};
    }

    protected override async loadAnimation(url: string) {
        //TODO error
        this.loadedAnimations.push(await this.animationLoader.BHVforVRM(url, this.vrm));
    }

    private setUpBlinking(): void {
        const blinkDown = this.createExpressionTween('blink', 1.0, 130, Easing.Quintic.In);
        const blinkUp = this.createExpressionTween('blink', this.minBlink, 220, Easing.Back.Out);
        if (blinkUp && blinkDown) {
            blinkDown.onComplete(() => {
                this.onBlinkDown(blinkDown, blinkUp);
            });
            blinkUp.onComplete(() => {
                this.onBlinkUp(blinkUp, blinkDown);
            });
            blinkDown.start();
            this.tweens.add(blinkDown, blinkUp);
        }
        // TODO: error
    }

    private setUpMouthTweens(): void {
        const manager = this.vrm.expressionManager;
        if (manager) {
            for (const expName of manager.mouthExpressionNames) {
                const t = this.createExpressionTween(expName, 0.0, 100, Easing.Quintic.Out);
                if (t) {
                    this.mouthTweens.add(t);
                    this.mouthTweenMap.set(expName, t);
                }
            }
        }
    }
}
