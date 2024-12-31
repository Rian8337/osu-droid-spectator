import { DrawableRollingCounter } from "./DrawableRollingCounter";
import { DrawableTeamScoreCounter } from "./DrawableTeamScoreCounter";

/**
 * A counter for team score difference.
 */
export class DrawableTeamScoreDifferenceCounter extends DrawableRollingCounter {
    private readonly redCounter: DrawableTeamScoreCounter;
    private readonly blueCounter: DrawableTeamScoreCounter;

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

        ctx.save();
        const { canvas } = ctx;

        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `bold ${(canvas.height / 5).toString()}px Torus`;
        } catch {
            // Ignore error
        }

        if (this.redCounter.score > this.blueCounter.score) {
            ctx.textAlign = "right";
            ctx.translate(
                canvas.width / 2 - canvas.width / 25,
                canvas.height / 2 - canvas.height / 4,
            );
        } else {
            ctx.textAlign = "left";
            ctx.translate(
                canvas.width / 2 + canvas.width / 25,
                canvas.height / 2 - canvas.height / 4,
            );
        }

        const diff = Math.abs(this.currentValue);

        ctx.fillText(diff.toLocaleString("en-US"), 0, 0);
        ctx.restore();
    }

    protected override getTargetValue(): number {
        return this.redCounter.currentValue - this.blueCounter.currentValue;
    }
}
