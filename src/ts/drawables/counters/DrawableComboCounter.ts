import { Vector2 } from "../../osu-base";
import { SpectatorComboEvent } from "../../spectator/events/SpectatorComboEvent";
import { SpectatorSyncedComboEvent } from "../../spectator/events/SpectatorSyncedComboEvent";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a combo counter.
 */
export class DrawableComboCounter extends DrawableCounter<
    SpectatorComboEvent,
    SpectatorSyncedComboEvent
> {
    private static readonly paddingX = 5;
    private static readonly paddingY = 30;
    private static readonly fontSize = 70;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { fontSize, paddingX, paddingY } = DrawableComboCounter;

        this.setupContext(ctx, new Vector2(0, ctx.canvas.height), fontSize);

        ctx.textAlign = "left";
        ctx.fillText(`${this.getValueAt(time)}x`, paddingX, -paddingY);
        ctx.restore();
    }

    protected override getValueAt(time: number): number {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        return (syncedEvent.time > event.time ? syncedEvent : event).combo;
    }
}
