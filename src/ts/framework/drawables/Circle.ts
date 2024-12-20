import { DrawableWithPath } from "./DrawableWithPath";

/**
 * Represents a circle that can be drawn to the screen.
 */
export abstract class Circle extends DrawableWithPath {
    private _radius = 0;

    /**
     * The radius of this `Circle`.
     */
    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        this._radius = value;

        this.size = value * 2;
    }

    /**
     * The radius to draw this `Circle` at.
     *
     * Can be used to account for offsets (i.e. line width).
     */
    protected get drawRadius(): number {
        return this.radius;
    }

    protected override preparePath() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.beginPath();
        ctx.arc(this.radius, this.radius, this.drawRadius, 0, Math.PI * 2);
    }
}
