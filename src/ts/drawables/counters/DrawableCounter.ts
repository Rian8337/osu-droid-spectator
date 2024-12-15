import { Vector2 } from "@rian8337/osu-base";

/**
 * Represents a counter that can be drawn.
 */
export abstract class DrawableCounter {
    /**
     * Draws the counter in the canvas.
     *
     * @param ctx The canvas context.
     * @param time The current clock time.
     */
    abstract draw(ctx: CanvasRenderingContext2D, time: number): void;

    /**
     * Sets a canvas context up for drawing a counter.
     *
     * @param ctx The canvas context.
     * @param origin The origin of the counter.
     * @param fontSize The font size.
     */
    protected setupContext(
        ctx: CanvasRenderingContext2D,
        origin: Vector2,
        fontSize: number,
        sizeScale = new Vector2(1),
    ): void {
        ctx.save();
        ctx.translate(origin.x, origin.y);

        // Only use Y scale so that the text is not stretched.
        ctx.scale(sizeScale.y, sizeScale.y);

        try {
            // This code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${fontSize.toString()}px Trebuchet MS, sans-serif`;
        } catch {
            // Ignore error
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
    }
}
