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
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        let combo = event.combo;
        if (syncedEvent.time > event.time) {
            combo = syncedEvent.combo;
        }

        const { zeroCoordinate } = DrawableBeatmap;

        this.setupContext(ctx, 70);

        ctx.textAlign = "left";
        ctx.fillText(
            `${combo}x`,
            DrawableComboCounter.paddingX - zeroCoordinate.x,
            Playfield.baseSize.y +
                zeroCoordinate.y -
                DrawableComboCounter.paddingY
        );
        ctx.restore();
    }
}
