import { Vector2 } from "@rian8337/osu-base";
import { SpectatorAccuracyEvent } from "../../spectator/events/SpectatorAccuracyEvent";
import { DrawableScoreCounter } from "./DrawableScoreCounter";
import { DrawableSyncedCounter } from "./DrawableSyncedCounter";

/**
 * Represents an accuracy counter.
 */
export class DrawableAccuracyCounter extends DrawableSyncedCounter<SpectatorAccuracyEvent> {
    private static readonly fontSize = 40;
    private static readonly paddingX = DrawableScoreCounter.paddingX;
    private static readonly paddingY =
        DrawableScoreCounter.paddingY + this.fontSize + 5;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { fontSize, paddingX, paddingY } = DrawableAccuracyCounter;

        this.setupContext(ctx, new Vector2(ctx.canvas.width, 0), fontSize);

        ctx.textAlign = "right";
        ctx.fillText(
            `${(this.getEventAt(time).accuracy * 100).toFixed(2)}%`,
            -paddingX,
            paddingY,
        );
        ctx.restore();
    }
}
