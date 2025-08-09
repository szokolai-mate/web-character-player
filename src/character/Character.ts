import { randInt, randFloat } from 'three/src/math/MathUtils.js';
import { AnimationLoader } from '../loaders/AnimationLoader';
import { Group as TweenGroup, Tween, Easing } from '@tweenjs/tween.js';
import { AnimationClip, AnimationMixer } from 'three';

export class Character {
    public scene: THREE.Object3D;
    protected animationMixer: AnimationMixer;
    protected loadedAnimations: AnimationClip[] = [];
    protected animationLoader: AnimationLoader = new AnimationLoader();
    protected tweens: TweenGroup = new TweenGroup();
    protected mouthTweens: TweenGroup =  new TweenGroup();
    protected mouthTweenMap: Map<string, Tween> = new Map<string, Tween>();

    constructor(scene: THREE.Object3D) {
        this.scene = scene;
        this.animationMixer = new AnimationMixer(this.scene);
        // TODO: clips = scene.animations, scene could contain animations
    }

    public update(dT: number): void {
        this.animationMixer.update(dT);
        this.tweens.update();
        this.mouthTweens.update();
    }

    public onBlinkDown(curr: Tween, next: Tween) {
        curr.duration(randInt(50, 250));
        next.delay(randInt(20, 200)).startFromCurrentValues();
    }

    public onBlinkUp(curr: Tween, next: Tween) {
        curr.duration(randInt(100, 350));
        next.delay(randInt(200, 1800)).startFromCurrentValues();
    }

    //TODO: timescale and weight of animation could be useful for user finetuning
    //Note: negative timescale plays it backwards
    //Note: clamp will pause on the last frame
    //Note: multiple animations can play at the same time and they will be mixed
    public async playAnimation(url: string): Promise<void> {
        const clip = AnimationClip.findByName(this.loadedAnimations, url);
        if (clip) {
            this.animationMixer.clipAction(clip).play();
        }
        // lazy loading
        //TODO error
        else {
            await this.loadAnimation(url);
            this.playAnimation(url);
        }
    }

    //tmp
    public cancelAnimations(): void {
        //TODO cancel current animation(s) => need current state and calculate delta
        this.animationMixer.stopAllAction();
    }

    protected async loadAnimation(url: string) {
        //TODO: this class should be an interface
    }

    //tmp
    public setUpInfiniteTalk(): void {
        const possibleExpressions = [...this.mouthTweenMap.keys()];
        // choose random expression
        const expression = possibleExpressions[randInt(0, possibleExpressions.length - 1)];
        // neutralize other expressions
        for (const expName of possibleExpressions) {
            if (expName == expression) continue;
            const t = this.mouthTweenMap.get(expName);
            if (t) {
                t.stop();
                t.to({ weight: 0.0 })
                    .easing(Easing.Quintic.Out)
                    .duration(100)
                    .startFromCurrentValues();
            }
        }
        // set chosen dominant expression
        const t = this.mouthTweenMap.get(expression);
        if (t){
            t.stop();
            t.to({ weight: randFloat(0.0, 1.0) })
                .easing(Easing.Sinusoidal.InOut)
                .duration(150)
                .startFromCurrentValues();
        }
        // loop
        setTimeout(() => {this.setUpInfiniteTalk();}, 180);
    }
}
