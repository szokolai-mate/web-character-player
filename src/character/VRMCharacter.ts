import * as THREE from 'three'
import { Character } from './Character';
import { Tween, Easing } from '@tweenjs/tween.js';
import { VRMCore } from '@pixiv/three-vrm';

export class VRMCharacter extends Character {
    protected vrm: VRMCore;
    // TODO: must be determined by setting or active expressions
    protected minBlink: number = 0.0;
    private smoothedTargetQuat = new THREE.Quaternion();

    constructor(scene: THREE.Object3D, vrm: VRMCore) {
        super(scene);
        this.vrm = vrm;
        this.setUpMouthTweens();
        this.setUpBlinking();
        this.unTPose();
        const head = this.vrm.humanoid?.getNormalizedBoneNode('head');
        if (head) {
            this.smoothedTargetQuat.copy(head.quaternion);
        }
    }

    public override update(dT: number): void {
        super.update(dT);
        this.vrm.update(dT);
        this.updateHeadLookAt();
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

        const targetWorldPos = new THREE.Vector3();
        target.getWorldPosition(targetWorldPos);

        const headWorldPos = new THREE.Vector3();
        head.getWorldPosition(headWorldPos);

        const lookAtMatrix = new THREE.Matrix4().lookAt(targetWorldPos, headWorldPos, new THREE.Vector3(0, 1, 0));
        const targetWorldQuat = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);

        const parentWorldQuat = new THREE.Quaternion();
        head.parent.getWorldQuaternion(parentWorldQuat);
        const parentWorldQuatInv = parentWorldQuat.clone().invert();

        const targetLocalQuat = parentWorldQuatInv.multiply(targetWorldQuat);

        // VRM 0.0 models have a different coordinate system.
        // We need to apply a 180-degree rotation on the Y-axis.
        if (this.vrm.meta?.metaVersion !== '1') {
            const y180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
            targetLocalQuat.multiply(y180);
        }
        // 1. Smoothly move the proxy target towards the actual target rotation.
        // A smaller factor here makes the movement feel more "weighted".
        const proxySlerpFactor = 0.1;
        this.smoothedTargetQuat.slerp(targetLocalQuat, proxySlerpFactor);
        // 2. Slerp the head's actual quaternion towards the smoothed proxy target.
        // A larger factor here makes the head track the proxy more tightly.
        const headSlerpFactor = 0.25;
        head.quaternion.slerp(this.smoothedTargetQuat, headSlerpFactor);
        
        const euler = new THREE.Euler().setFromQuaternion(head.quaternion, 'YXZ');
        euler.x = Math.max(Math.PI * -0.25, Math.min(Math.PI * 0.15, euler.x));
        euler.y = Math.max(Math.PI * -0.4, Math.min(Math.PI * 0.4, euler.y));
        euler.z = 0;
        head.quaternion.setFromEuler(euler);
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
