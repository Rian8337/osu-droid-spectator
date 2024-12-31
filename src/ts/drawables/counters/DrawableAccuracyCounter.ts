import { Vector2 } from "@rian8337/osu-base";
import { SpectatorAccuracyEvent } from "../../spectator/events/SpectatorAccuracyEvent";
import { DrawableScoreCounter } from "./DrawableScoreCounter";
import { DrawableStatisticsCounter } from "./DrawableStatisticsCounter";

/**
 * Represents an accuracy counter.
 */
export class DrawableAccuracyCounter extends DrawableStatisticsCounter<SpectatorAccuracyEvent> {
    private static readonly fontSize = 40;
    private static readonly paddingX = DrawableScoreCounter.paddingX;
    private static readonly paddingY =
        DrawableScoreCounter.paddingY + this.fontSize + 5;

    protected override readonly allowFractional = true;
    protected override readonly rollingDuration = 375;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.update(time);

        const { fontSize, paddingX, paddingY } = DrawableAccuracyCounter;

        this.setupContext(ctx, new Vector2(ctx.canvas.width, 0), fontSize);

        ctx.textAlign = "right";
        ctx.fillText(
            `${(this.currentValue * 100).toFixed(2)}%`,
            -paddingX,
            paddingY,
        );
        ctx.restore();
    }

    protected override getEventValue(event: SpectatorAccuracyEvent): number {
        return event.accuracy;
    }
}
