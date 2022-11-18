import { SpectatorCountableEvent } from "../../spectator/events/SpectatorCountableEvent";
import { SpectatorEventManager } from "../../spectator/SpectatorEventManager";

/**
 * Represents a counter that can be drawn.
 */
export abstract class DrawableCounter<T extends SpectatorCountableEvent> {
    /**
     * The event manager of this drawable counter.
     */
    readonly manager: SpectatorEventManager<T>;

    constructor(manager: SpectatorEventManager<T>) {
        this.manager = manager;
    }

    /**
     * Draws the counter in the canvas.
     *
     * @param ctx The canvas context.
     * @param time The curent clock time.
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
        fontSize: number
    ): void {
        ctx.save();

        try {
            // This code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${fontSize}px "Comic Sans MS", cursive, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
    }
}
