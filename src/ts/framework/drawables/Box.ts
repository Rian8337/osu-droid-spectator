import { Drawable } from "./Drawable";

/**
 * A box that can be drawn to the screen via an {@link HTMLCanvasElement}.
 */
export class Box extends Drawable {
    protected override onDraw() {
        const { ctx, drawSize } = this;

        if (!ctx) {
            return;
        }

        ctx.fillRect(0, 0, drawSize.x, drawSize.y);
    }
}
