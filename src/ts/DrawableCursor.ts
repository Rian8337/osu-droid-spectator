import { SpectatorCursorEvent } from "./spectator/events/SpectatorCursorEvent";
import { MovementType } from "./spectator/rawdata/MovementType";
import { SpectatorEventManager } from "./spectator/SpectatorEventManager";

/**
 * Represents a cursor that can be drawn.
 */
export class DrawableCursor {
    /**
     * The event manager of this drawable cursor.
     */
    readonly manager: SpectatorEventManager<SpectatorCursorEvent>;

    constructor(manager: SpectatorEventManager<SpectatorCursorEvent>) {
        this.manager = manager;
    }

    /**
     * Draws the cursor that is active at the given time.
     *
     * @param ctx The canvas context.
     * @param time The time to draw, in milliseconds.
     */
    draw(ctx: CanvasRenderingContext2D, time: number): void {
        const cursor = this.manager.eventAt(time);

        if (!cursor || cursor.id === MovementType.up) {
            return;
        }

        ctx.save();
        ctx.globalAlpha = 1;

        const radius = 15;
        const gradient = ctx.createRadialGradient(
            cursor.position.x,
            cursor.position.y,
            0,
            cursor.position.x,
            cursor.position.y,
            radius
        );

        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, "#9e3fe8");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            cursor.position.x,
            cursor.position.y,
            radius,
            -Math.PI,
            Math.PI
        );
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}
