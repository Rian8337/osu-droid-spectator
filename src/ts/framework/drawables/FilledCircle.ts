import { Circle } from "./Circle";

/**
 * Represents a circle that is filled.
 */
export class FilledCircle extends Circle {
    protected override onDraw() {
        this.ctx?.fill();
    }
}
