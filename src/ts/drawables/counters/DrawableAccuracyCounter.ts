import { Vector2 } from "../../osu-base";
import { SpectatorAccuracyEvent } from "../../spectator/events/SpectatorAccuracyEvent";
import { SpectatorSyncedAccuracyEvent } from "../../spectator/events/SpectatorSyncedAccuracyEvent";
import { DrawableCounter } from "./DrawableCounter";
import { DrawableScoreCounter } from "./DrawableScoreCounter";

/**
 * Represents an accuracy counter.
 */
export class DrawableAccuracyCounter extends DrawableCounter<
    SpectatorAccuracyEvent,
    SpectatorSyncedAccuracyEvent
> {
    private static readonly fontSize = 40;
    private static readonly paddingX = DrawableScoreCounter.paddingX;
    private static readonly paddingY =
        DrawableScoreCounter.paddingY + this.fontSize + 5;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { fontSize, paddingX, paddingY } = DrawableAccuracyCounter;

        this.setupContext(ctx, new Vector2(ctx.canvas.width, 0), fontSize);

        ctx.textAlign = "right";
        ctx.fillText(
            `${(this.getValueAt(time) * 100).toFixed(2)}%`,
            -paddingX,
            paddingY,
        );
        ctx.restore();
    }

    protected override getValueAt(time: number): number {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        return (syncedEvent.time > event.time ? syncedEvent : event).accuracy;
    }
}
