import { Playfield } from "../../osu-base";
import { SpectatorScoreEvent } from "../../spectator/events/SpectatorScoreEvent";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a score counter.
 */
export class DrawableScoreCounter extends DrawableCounter<SpectatorScoreEvent> {
    static readonly paddingX = 5;
    static readonly paddingY = 35;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const score = this.manager.eventAt(time)?.score ?? 0;
        const zeroCoordinate = DrawableBeatmap.zeroCoordinate;

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
