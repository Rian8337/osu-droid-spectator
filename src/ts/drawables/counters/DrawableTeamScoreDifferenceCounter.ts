import { DrawableRollingCounter } from "./DrawableRollingCounter";
import { DrawableTeamScoreCounter } from "./DrawableTeamScoreCounter";

/**
 * A counter for team score difference.
 */
export class DrawableTeamScoreDifferenceCounter extends DrawableRollingCounter {
    private readonly redCounter: DrawableTeamScoreCounter;
    private readonly blueCounter: DrawableTeamScoreCounter;

    private readonly charLengthMap = new Map<string, number>();
    private longestCharWidth = 0;

    private lastCanvasWidth = 0;
    private lastCanvasHeight = 0;

    constructor(
        redCounter: DrawableTeamScoreCounter,
        blueCounter: DrawableTeamScoreCounter,
    ) {
        super();

        this.redCounter = redCounter;
        this.blueCounter = blueCounter;
    }

    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        this.update(time);

        if (this.currentValue === 0) {
            return;
        }

        const { canvas } = ctx;

        // We are not using addEventListener here to prevent instances of this class
        // from not being garbage collected due to reference in the event listener.
        if (
            this.lastCanvasWidth !== canvas.width ||
            this.lastCanvasHeight !== canvas.height
        ) {
            this.charLengthMap.clear();

            this.lastCanvasWidth = canvas.width;
            this.lastCanvasHeight = canvas.height;
        }

        ctx.save();
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `bold ${(canvas.height / 5).toString()}px Torus, sans-serif`;
        } catch {
            // Ignore error
        }

        if (this.charLengthMap.size === 0) {
            this.updateLongestCharWidth(ctx);
        }

        const value = Math.abs(this.currentValue).toLocaleString("en-US");

        if (this.currentValue > 0) {
            ctx.translate(
                canvas.width / 2 -
                    canvas.width / 50 -
                    // Commas do not obey longest character width.
                    (value.replace(",", "").length * this.longestCharWidth +
                        (this.charLengthMap.get(",") ?? this.longestCharWidth)),
                canvas.height / 5,
            );
        } else {
            ctx.translate(
                canvas.width / 2 + canvas.width / 50,
                canvas.height / 5,
            );
        }

        for (const char of value) {
            const width = this.charLengthMap.get(char) ?? this.longestCharWidth;

            if (char === ",") {
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

    protected override getTargetValue(): number {
        return this.redCounter.currentValue - this.blueCounter.currentValue;
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

        loadChar(",");
    }
}
