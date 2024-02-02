import { Vector2 } from "../../osu-base";
import { SpectatorComboEvent } from "../../spectator/events/SpectatorComboEvent";
import { DrawableSyncedCounter } from "./DrawableSyncedCounter";

/**
 * Represents a combo counter.
 */
export class DrawableComboCounter extends DrawableSyncedCounter<SpectatorComboEvent> {
    private static readonly paddingX = 5;
    private static readonly paddingY = 30;
    private static readonly fontSize = 70;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { fontSize, paddingX, paddingY } = DrawableComboCounter;

        this.setupContext(ctx, new Vector2(0, ctx.canvas.height), fontSize);

        ctx.textAlign = "left";
        ctx.fillText(`${this.getEventAt(time).combo}x`, paddingX, -paddingY);
        ctx.restore();
    }
}
