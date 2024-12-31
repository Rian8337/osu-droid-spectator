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

    private readonly charLengthMap = new Map<string, number>();
    private longestCharWidth = 0;

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.update(time);

        const { fontSize, paddingX, paddingY } = DrawableAccuracyCounter;

        // For accuracy counter, we need to setup in a way that the position stays as is, depending on the
        // longest width of the number character. This is done to prevent motion sickness of the user.
        this.setupContext(ctx, new Vector2(0), fontSize);

        if (this.charLengthMap.size === 0) {
            this.updateLongestCharWidth(ctx);
        }

        // Reapply context with respect to new origin.
        ctx.restore();

        const value = `${(this.currentValue * 100).toFixed(2)}%`;

        this.setupContext(
            ctx,
            new Vector2(
                ctx.canvas.width -
                    // Dots and percentage signs do not obey longest character width.
                    value.replace(/.%/, "").length * this.longestCharWidth -
                    (this.charLengthMap.get(".") ?? this.longestCharWidth) -
                    (this.charLengthMap.get("%") ?? this.longestCharWidth) -
                    paddingX,
                paddingY,
            ),
            fontSize,
        );

        for (const char of value) {
            const width = this.charLengthMap.get(char) ?? this.longestCharWidth;

            if (char === "." || char === "%") {
                ctx.fillText(char, 0, 0);
                ctx.translate(width, 0);
            } else {
                // Center the character.
                ctx.fillText(char, (this.longestCharWidth - width) / 2, 0);
                ctx.translate(this.longestCharWidth, 0);
            }
        }

        ctx.restore();
    }

    protected override getEventValue(event: SpectatorAccuracyEvent): number {
        return event.accuracy;
    }

    private updateLongestCharWidth(ctx: CanvasRenderingContext2D): void {
        const loadChar = (char: string) => {
            const { width } = ctx.measureText(char);

            this.charLengthMap.set(char, width);
            this.longestCharWidth = Math.max(width, this.longestCharWidth);
        };

        this.longestCharWidth = 0;

        for (let i = 0; i < 10; ++i) {
            loadChar(i.toString());
        }

        loadChar(".");
        loadChar("%");
    }
}
