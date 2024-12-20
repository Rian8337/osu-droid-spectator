import { SliderNestedHitObject } from "@rian8337/osu-base";
import { DrawableHitObject } from "./DrawableHitObject";
import { SpectatorObjectData } from "../../spectator/rawdata/SpectatorObjectData";
import { ArmedState } from "./ArmedState";
import type { DrawableSlider } from "./DrawableSlider";

/**
 * Represents a nested hit object that can be drawn.
 */
export abstract class DrawableNestedHitObject<
    THitObject extends SliderNestedHitObject = SliderNestedHitObject,
> extends DrawableHitObject<THitObject> {
    /**
     * The parenting `DrawableHitObject`, if any.
     */
    parentHitObject: DrawableSlider | null = null;

    override applySpectatorData(data: SpectatorObjectData) {
        if (!this.baseObject || !this.parentHitObject?.baseObject) {
            return;
        }

        const slider = this.parentHitObject.baseObject;
        const index = slider.nestedHitObjects.indexOf(this.baseObject) - 1;

        if (index < 0) {
            return;
        }

        this.hitStateUpdateTime = this.baseObject.startTime;

        this.updateState(
            data.tickset[index] ? ArmedState.hit : ArmedState.miss,
            true,
        );
    }

    protected override applyHitObjectInternal(hitObject: THitObject) {
        super.applyHitObjectInternal(hitObject);

        if (!this.parentHitObject?.baseObject) {
            return;
        }

        // The position of nested hitobjects are relative to the parent hitobject.
        this.position = hitObject.position.subtract(
            this.parentHitObject.baseObject.position,
        );
    }
}
