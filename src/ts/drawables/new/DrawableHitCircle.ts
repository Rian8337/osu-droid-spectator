import {
    Anchor,
    Easing,
    Circle as HitCircle,
    RGBColor,
} from "@rian8337/osu-base";
import { DrawableHitObject } from "./DrawableHitObject";
import { DrawableCirclePiece } from "./DrawableCirclePiece";
import { DrawableApproachCircle } from "./DrawableApproachCircle";
import { Text } from "../../framework/drawables/Text";
import { SpectatorObjectData } from "../../spectator/rawdata/SpectatorObjectData";
import { ArmedState } from "./ArmedState";
import { HitResult } from "../../spectator/structures/HitResult";

/**
 * Represents a hitcircle that can be drawn.
 */
export class DrawableHitCircle extends DrawableHitObject<HitCircle> {
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
        if (!this.baseObject?.hitWindow) {
            return;
        }

        this.hitStateUpdateTime = this.baseObject.endTime;

        if (data.result === HitResult.miss) {
            this.hitStateUpdateTime += Math.min(
                data.accuracy,
                this.baseObject.hitWindow.mehWindow,
            );

            this.updateState(ArmedState.miss, true);
        } else {
            this.hitStateUpdateTime += data.accuracy;

            this.updateState(ArmedState.hit, true);
        }
    }

    protected override applyHitObjectInternal(hitObject: HitCircle) {
        super.applyHitObjectInternal(hitObject);

        this.circlePiece.radius = hitObject.radius;
        this.approachCircle.radius = hitObject.radius;

        this.numberText.text = hitObject.comboIndex + 1;
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
