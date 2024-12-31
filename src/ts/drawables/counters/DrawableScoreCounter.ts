import { Vector2 } from "@rian8337/osu-base";
import { SpectatorScoreEvent } from "../../spectator/events/SpectatorScoreEvent";
import { DrawableStatisticsCounter } from "./DrawableStatisticsCounter";

/**
 * Represents a score counter.
 */
export class DrawableScoreCounter extends DrawableStatisticsCounter<SpectatorScoreEvent> {
    private static readonly fontSize = 60;
    static readonly paddingX = 5;
    static readonly paddingY = this.fontSize;

    protected override readonly rollingDuration = 1000;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.update(time);

        const { fontSize, paddingX, paddingY } = DrawableScoreCounter;

        this.setupContext(ctx, new Vector2(ctx.canvas.width, 0), fontSize);

        ctx.textAlign = "right";
        ctx.fillText(
            this.currentValue.toString().padStart(8, "0"),
            -paddingX,
            paddingY,
        );
        ctx.restore();
    }

    protected override getEventValue(event: SpectatorScoreEvent): number {
        return event.score;
    }
}
