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

    private readonly charLengthMap = new Map<string, number>();
    private longestCharWidth = 0;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.update(time);

        const { fontSize, paddingX, paddingY } = DrawableScoreCounter;

        // For score counter, we need to setup in a way that the position stays as is, depending on the
        // longest width of the number character. This is done to prevent motion sickness of the user.
        this.setupContext(ctx, new Vector2(0), fontSize);

        if (this.charLengthMap.size === 0) {
            this.updateLongestCharWidth(ctx);
        }

        // Reapply context with respect to new origin.
        ctx.restore();

        const value = this.currentValue.toString().padStart(8, "0");

        this.setupContext(
            ctx,
            new Vector2(
                ctx.canvas.width -
                    value.length * this.longestCharWidth -
                    paddingX,
                paddingY,
            ),
            fontSize,
        );

        for (const char of value) {
            const width = this.charLengthMap.get(char) ?? this.longestCharWidth;

            // Center the character.
            ctx.fillText(char, (this.longestCharWidth - width) / 2, 0);
            ctx.translate(this.longestCharWidth, 0);
        }

        ctx.restore();
    }

    protected override getEventValue(event: SpectatorScoreEvent): number {
        return event.score;
    }

    private updateLongestCharWidth(ctx: CanvasRenderingContext2D): void {
        this.longestCharWidth = 0;

        for (let i = 0; i < 10; ++i) {
            const { width } = ctx.measureText(i.toString());

            this.charLengthMap.set(i.toString(), width);
            this.longestCharWidth = Math.max(width, this.longestCharWidth);
        }
    }
}
