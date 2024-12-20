import { Anchor, RGBColor, Slider } from "@rian8337/osu-base";
import { HollowCircle } from "../../framework/drawables/HollowCircle";

/**
 * Represents the follow circle of a slider.
 */
export class DrawableFollowCircle extends HollowCircle {
    slider: Slider | null = null;

    constructor() {
        super();

        this.origin = Anchor.center;
        this.color = new RGBColor(255, 255, 255);
    }

    /**
     * Updates this `DrawableFollowCircle`.
     *
     * @param completionProgress The completion progress of the slider.
     */
    updateProgress(completionProgress: number) {
        if (!this.slider) {
            return;
        }

        this.position = this.slider.curvePositionAt(completionProgress);

        // 0.1 / slider.distance is the additional progress needed to ensure the diff length is 0.1
        const diff = this.position.subtract(
            this.slider.curvePositionAt(
                Math.min(1, completionProgress + 0.1 / this.slider.distance),
            ),
        );

        // Ensure the value is substantially high enough to allow for atan2 to get a valid angle.
        // Needed for when near completion, or in case of a very short slider.
        if (diff.length < 0.01) {
            return;
        }

        this.rotation = -Math.PI / 4 - Math.atan2(diff.x, diff.y);
    }
}
