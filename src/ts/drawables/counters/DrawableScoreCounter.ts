import { Playfield } from "../../osu-base";
import { SpectatorScoreEvent } from "../../spectator/events/SpectatorScoreEvent";
import { SpectatorSyncedScoreEvent } from "../../spectator/events/SpectatorSyncedScoreEvent";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a score counter.
 */
export class DrawableScoreCounter extends DrawableCounter<
    SpectatorScoreEvent,
    SpectatorSyncedScoreEvent
> {
    static readonly paddingX = 5;
    static readonly paddingY = 35;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const event = this.manager.eventAtOrDefault(time);
        const syncedEvent = this.syncedManager.eventAtOrDefault(time);

        let score = event.score;
        if (syncedEvent.time > event.time) {
            score = syncedEvent.score;
        }

        const { zeroCoordinate } = DrawableBeatmap;

        this.setupContext(ctx, 60);

        ctx.textAlign = "right";
        ctx.fillText(
            score.toString().padStart(8, "0"),
            Playfield.baseSize.x +
                zeroCoordinate.x -
                DrawableScoreCounter.paddingX,
            DrawableScoreCounter.paddingY - zeroCoordinate.y
        );
        ctx.restore();
    }
}
