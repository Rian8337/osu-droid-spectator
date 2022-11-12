import { Playfield } from "../../osu-base";
import { SpectatorAccuracyEvent } from "../../spectator/events/SpectatorAccuracyEvent";
import { DrawableBeatmap } from "../DrawableBeatmap";
import { DrawableCounter } from "./DrawableCounter";
import { DrawableScoreCounter } from "./DrawableScoreCounter";

/**
 * Represents an accuracy counter.
 */
export class DrawableAccuracyCounter extends DrawableCounter<SpectatorAccuracyEvent> {
    private static readonly paddingX = DrawableScoreCounter.paddingX;
    private static readonly paddingY = DrawableScoreCounter.paddingY * 1.5 + 10;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const accuracy = this.manager.eventAt(time)?.accuracy ?? 1;
        const zeroCoordinate = DrawableBeatmap.zeroCoordinate;

        this.setupContext(ctx, 40);

        ctx.textAlign = "right";
        ctx.fillText(
            `${(accuracy * 100).toFixed(2)}%`,
            Playfield.baseSize.x +
                zeroCoordinate.x -
                DrawableAccuracyCounter.paddingX,
            DrawableAccuracyCounter.paddingY - zeroCoordinate.y
        );
        ctx.restore();
    }
}
