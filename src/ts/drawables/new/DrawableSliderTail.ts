import { SliderTail } from "@rian8337/osu-base";
import { DrawableNestedHitObject } from "./DrawableNestedHitObject";
import { DrawableCirclePiece } from "./DrawableCirclePiece";
import { ArmedState } from "./ArmedState";

/**
 * Represents a slider tail.
 */
export class DrawableSliderTail extends DrawableNestedHitObject<SliderTail> {
    private readonly circlePiece = new DrawableCirclePiece();

    constructor() {
        super();

        this.add(this.circlePiece);
    }

    protected override applyHitObjectInternal(hitObject: SliderTail) {
        super.applyHitObjectInternal(hitObject);

        this.circlePiece.radius = hitObject.radius;
    }

    protected override updateInitialTransforms(transformStartTime: number) {
        super.updateInitialTransforms(transformStartTime);

        if (!this.baseObject) {
            return;
        }

        this.circlePiece
            .beginAbsoluteSequence(transformStartTime)
            .fadeInFromZero(this.baseObject.timeFadeIn);
    }

    protected override updateHitStateTransforms(
        transformStartTime: number,
        newState: ArmedState,
    ) {
        super.updateHitStateTransforms(transformStartTime, newState);

        const { baseObject: hitObject } = this;

        if (!hitObject) {
            return;
        }

        const sequence = this.beginAbsoluteSequence(transformStartTime);

        switch (newState) {
            case ArmedState.idle:
                sequence.delay(hitObject.timePreempt).fadeOut(500);
                break;

            case ArmedState.hit:
                sequence.fadeOut(100);
                break;

            case ArmedState.miss:
                sequence.delay(800).fadeOut();
                break;
        }
    }
}
