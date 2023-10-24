import { Vector2 } from "../../osu-base";
import { SpectatorScoreEvent } from "../../spectator/events/SpectatorScoreEvent";
import { SpectatorSyncedScoreEvent } from "../../spectator/events/SpectatorSyncedScoreEvent";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a score counter.
 */
export class DrawableScoreCounter extends DrawableCounter<
    SpectatorScoreEvent,
    SpectatorSyncedScoreEvent
> {
    private static readonly fontSize = 60;
    static readonly paddingX = 5;
    static readonly paddingY = this.fontSize;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { fontSize, paddingX, paddingY } = DrawableScoreCounter;

        this.setupContext(ctx, new Vector2(ctx.canvas.width, 0), fontSize);

        ctx.textAlign = "right";
        ctx.fillText(
            this.getValueAt(time).toString().padStart(8, "0"),
            -paddingX,
            paddingY,
        );
        ctx.restore();
    }

    protected override getValueAt(time: number): number {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        return (syncedEvent.time > event.time ? syncedEvent : event).score;
    }
}
