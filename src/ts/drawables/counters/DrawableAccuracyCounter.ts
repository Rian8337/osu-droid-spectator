import { Playfield } from "../../osu-base";
import { SpectatorAccuracyEvent } from "../../spectator/events/SpectatorAccuracyEvent";
import { SpectatorSyncedAccuracyEvent } from "../../spectator/events/SpectatorSyncedAccuracyEvent";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCounter } from "./DrawableCounter";
import { DrawableScoreCounter } from "./DrawableScoreCounter";

/**
 * Represents an accuracy counter.
 */
export class DrawableAccuracyCounter extends DrawableCounter<
    SpectatorAccuracyEvent,
    SpectatorSyncedAccuracyEvent
> {
    private static readonly paddingX = DrawableScoreCounter.paddingX;
    private static readonly paddingY = DrawableScoreCounter.paddingY * 2 + 10;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { zeroCoordinate } = DrawableBeatmap;

        this.setupContext(ctx, 40);

        ctx.textAlign = "right";
        ctx.fillText(
            `${(this.getValueAt(time) * 100).toFixed(2)}%`,
            Playfield.baseSize.x +
                zeroCoordinate.x -
                DrawableAccuracyCounter.paddingX,
            DrawableAccuracyCounter.paddingY - zeroCoordinate.y,
        );
        ctx.restore();
    }

    protected override getValueAt(time: number): number {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        return (syncedEvent.time > event.time ? syncedEvent : event).accuracy;
    }
}
