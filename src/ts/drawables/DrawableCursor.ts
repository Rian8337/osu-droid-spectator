import {
    IModApplicableToDroid,
    MathUtils,
    Mod,
    ModHardRock,
    Playfield,
    Vector2,
} from "../osu-base";
import { SpectatorCursorEvent } from "../spectator/events/SpectatorCursorEvent";
import { MovementType } from "../spectator/structures/MovementType";
import { SpectatorEventManager } from "../spectator/managers/SpectatorEventManager";
import { DrawableBeatmap } from "./DrawableBeatmap";

/**
 * Represents a cursor that can be drawn.
 */
export class DrawableCursor {
    /**
     * The event manager of this drawable cursor.
     */
    readonly manager: SpectatorEventManager<SpectatorCursorEvent>;

    private readonly isHardRock: boolean;

    constructor(
        manager: SpectatorEventManager<SpectatorCursorEvent>,
        mods: (Mod & IModApplicableToDroid)[]
    ) {
        this.manager = manager;
        this.isHardRock = mods.some((m) => m instanceof ModHardRock);
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

        let { position } = cursor;

        if (this.isHardRock) {
            position = new Vector2(
                position.x,
                Playfield.baseSize.y - position.y
            );
        }

        const { zeroCoordinate } = DrawableBeatmap;
        const x = MathUtils.clamp(
            position.x,
            -zeroCoordinate.x,
            ctx.canvas.width
        );
        const y = MathUtils.clamp(
            position.y,
            -zeroCoordinate.y,
            ctx.canvas.height
        );

        const radius = 15;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, "#9e3fe8");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, -Math.PI, Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}
