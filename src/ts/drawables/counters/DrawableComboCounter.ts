import { Playfield } from "../../osu-base";
import { SpectatorComboEvent } from "../../spectator/events/SpectatorComboEvent";
import { SpectatorSyncedComboEvent } from "../../spectator/events/SpectatorSyncedComboEvent";
import { DrawableBeatmap } from "../DrawableBeatmap";
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

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { zeroCoordinate } = DrawableBeatmap;

        this.setupContext(ctx, 70);

        ctx.textAlign = "left";
        ctx.fillText(
            `${this.getValueAt(time)}x`,
            DrawableComboCounter.paddingX - zeroCoordinate.x,
            Playfield.baseSize.y +
                zeroCoordinate.y -
                DrawableComboCounter.paddingY,
        );
        ctx.restore();
    }

    protected override getValueAt(time: number): number {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        return (syncedEvent.time > event.time ? syncedEvent : event).combo;
    }
}
