import { HitObject } from "../HitObject";
import { Vector2 } from "../../../mathutil/Vector2";

/**
 * Represents a repeat point in a slider.
 */
export class SliderRepeat extends HitObject {
    /**
     * The index of the repeat point.
     */
    readonly repeatIndex: number;

    /**
     * The duration of the repeat point.
     */
    readonly spanDuration: number;

    constructor(values: {
        position: Vector2;
        startTime: number;
        repeatIndex: number;
        spanDuration: number;
    }) {
        super(values);
        this.repeatIndex = values.repeatIndex;
        this.spanDuration = values.spanDuration;
    }

    override toString(): string {
        return `Position: [${this.position.x}, ${this.position.y}], repeat index: ${this.repeatIndex}, span duration: ${this.spanDuration}`;
    }
}
