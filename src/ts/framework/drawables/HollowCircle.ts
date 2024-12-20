import { Circle } from "./Circle";

/**
 * Represents a circle that is hollow.
 */
export class HollowCircle extends Circle {
    private _borderThickness = 1;

    /**
     * The thickness of the border of this `HollowCircle`.
     *
     * The border is *included* as a part of the radius. That is, if the radius of the circle is `r`,
     * and the border thickness is `t`, the actual radius of the circle that will be drawn will be `r - t/2`.
     */
    get borderThickness(): number {
        return this._borderThickness;
    }

    set borderThickness(value: number) {
        this._borderThickness = value;
    }

    protected override get drawRadius(): number {
        return super.drawRadius - this.borderThickness / 2;
    }

    protected override onDraw() {
        this.ctx?.stroke();
    }

    protected override applyCanvasConfigurations() {
        super.applyCanvasConfigurations();

        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.lineWidth = this.borderThickness;
    }
}
