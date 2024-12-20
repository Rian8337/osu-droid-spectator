import { Anchor, Easing, RGBColor, SliderHead } from "@rian8337/osu-base";
import { DrawableNestedHitObject } from "./DrawableNestedHitObject";
import { SpectatorObjectData } from "../../spectator/rawdata/SpectatorObjectData";
import { HitResult } from "../../spectator/structures/HitResult";
import { ArmedState } from "./ArmedState";
import { DrawableApproachCircle } from "./DrawableApproachCircle";
import { DrawableCirclePiece } from "./DrawableCirclePiece";
import { Text } from "../../framework/drawables/Text";

/**
 * Represents a slider's head.
 */
export class DrawableSliderHead extends DrawableNestedHitObject<SliderHead> {
    private readonly circlePiece = new DrawableCirclePiece();
    private readonly approachCircle = new DrawableApproachCircle();
    private readonly numberText = new Text();

    constructor() {
        super();

        this.numberText.bold = true;
        this.numberText.anchor = Anchor.center;
        this.numberText.origin = Anchor.center;
        this.numberText.color = new RGBColor(255, 255, 255);

        // TODO: combo index
        this.numberText.text = "2";

        this.addAll(this.circlePiece, this.numberText, this.approachCircle);
    }

    override applySpectatorData(data: SpectatorObjectData) {
        const { baseObject, parentHitObject } = this;

        if (!parentHitObject?.baseObject || !baseObject?.hitWindow) {
            return;
        }

        this.hitStateUpdateTime = baseObject.endTime;

        if (data.result === HitResult.miss) {
            this.hitStateUpdateTime += Math.min(
                data.accuracy,
                baseObject.hitWindow.mehWindow,
                parentHitObject.baseObject.duration,
            );

            this.updateState(ArmedState.miss, true);
        } else {
            this.hitStateUpdateTime += data.accuracy;

            this.updateState(ArmedState.hit, true);
        }
    }

    protected override applyHitObjectInternal(hitObject: SliderHead) {
        super.applyHitObjectInternal(hitObject);

        this.circlePiece.radius = hitObject.radius;
        this.approachCircle.radius = hitObject.radius;

        // TODO: combo index
        this.numberText.text = "2";
        this.numberText.fontSize = hitObject.radius / 16;
    }

    protected override updateInitialTransforms(transformStartTime: number) {
        super.updateInitialTransforms(transformStartTime);

        const { baseObject: circle } = this;

        if (!circle) {
            return;
        }

        this.circlePiece
            .beginAbsoluteSequence(transformStartTime)
            .fadeInFromZero(circle.timeFadeIn);

        this.approachCircle
            .beginAbsoluteSequence(transformStartTime)
            .fadeTo(0.9, Math.min(circle.timeFadeIn * 2, circle.timePreempt))
            .scaleTo(1, circle.timePreempt);
    }

    protected override updateStartTimeTransforms(transformStartTime: number) {
        // Always fade out at the circle's start time (to match user expectations).
        this.approachCircle
            .beginAbsoluteSequence(transformStartTime)
            .fadeOut(50);
    }
    protected override updateHitStateTransforms(
        transformStartTime: number,
        newState: ArmedState,
    ) {
        const fadeOutDuration = 240;

        this.circlePiece
            .beginAbsoluteSequence(transformStartTime)
            .scaleTo(1.4, fadeOutDuration, Easing.outQuad)
            .fadeOut(fadeOutDuration);

        this.numberText
            .beginAbsoluteSequence(transformStartTime)
            .fadeOut(fadeOutDuration / 4);

        switch (newState) {
            case ArmedState.hit:
                this.approachCircle
                    .beginAbsoluteSequence(transformStartTime)
                    .fadeOut(50);
                break;

            case ArmedState.miss:
                this.beginAbsoluteSequence(transformStartTime).fadeOut(100);
                break;
        }
    }

    protected override reset() {
        super.reset();

        this.approachCircle.clearTransforms();
        this.circlePiece.clearTransforms();
        this.numberText.clearTransforms();

        this.approachCircle.alpha = 0;
        this.approachCircle.scale = 3;
    }
}
