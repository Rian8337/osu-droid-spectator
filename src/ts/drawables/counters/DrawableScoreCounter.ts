import { Vector2 } from "@rian8337/osu-base";
import { SpectatorScoreEvent } from "../../spectator/events/SpectatorScoreEvent";
import { DrawableSyncedCounter } from "./DrawableSyncedCounter";

/**
 * Represents a score counter.
 */
export class DrawableScoreCounter extends DrawableSyncedCounter<SpectatorScoreEvent> {
    private static readonly fontSize = 60;
    static readonly paddingX = 5;
    static readonly paddingY = this.fontSize;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        const { fontSize, paddingX, paddingY } = DrawableScoreCounter;

        this.setupContext(ctx, new Vector2(ctx.canvas.width, 0), fontSize);

        ctx.textAlign = "right";
        ctx.fillText(
            this.getEventAt(time).score.toString().padStart(8, "0"),
            -paddingX,
            paddingY,
        );
        ctx.restore();
    }
}
