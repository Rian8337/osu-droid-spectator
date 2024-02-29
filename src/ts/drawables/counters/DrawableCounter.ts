import { Vector2 } from "@rian8337/osu-base";

/**
 * Represents a counter that can be drawn.
 */
export abstract class DrawableCounter {
    /**
     * The size scale of the underlying preview.
     */
    protected readonly sizeScale: Vector2;

    constructor(sizeScale: Vector2) {
        this.sizeScale = sizeScale;
    }

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
     * @param fontSize The font size.
     */
    protected setupContext(
        ctx: CanvasRenderingContext2D,
        zeroPosition: Vector2,
        fontSize: number,
    ): void {
        ctx.save();
        ctx.translate(zeroPosition.x, zeroPosition.y);

        // Only use Y scale so that the text is not stretched.
        ctx.scale(this.sizeScale.y, this.sizeScale.y);

        try {
            // This code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${fontSize}px Trebuchet MS, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
    }
}
