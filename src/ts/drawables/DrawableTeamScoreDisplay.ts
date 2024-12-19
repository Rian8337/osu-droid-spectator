import { MathUtils } from "@rian8337/osu-base";
import { maxScore } from "../settings/BeatmapSettings";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { DrawableTeamScoreCounter } from "./counters/DrawableTeamScoreCounter";
import { DrawableTeamScoreDifferenceCounter } from "./counters/DrawableTeamScoreDifferenceCounter";

/**
 * Represents a display for displaying team score.
 */
export class DrawableTeamScoreDisplay {
    private readonly ctx: CanvasRenderingContext2D;

    private readonly redTeamCounter = new DrawableTeamScoreCounter(
        MultiplayerTeam.red,
    );

    private readonly blueTeamCounter = new DrawableTeamScoreCounter(
        MultiplayerTeam.blue,
    );

    private readonly scoreDifferenceCounter =
        new DrawableTeamScoreDifferenceCounter(
            this.redTeamCounter,
            this.blueTeamCounter,
        );

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    /**
     * Draws this display to the screen.
     *
     * @param time The time to draw the display at.
     */
    draw(time: number) {
        this.drawCounters(time);
        this.scoreDifferenceCounter.draw(this.ctx, time);
        this.drawScoreDifferenceLine();
    }

    private drawCounters(time: number) {
        this.redTeamCounter.calculateTeamScore(time);
        this.blueTeamCounter.calculateTeamScore(time);

        this.redTeamCounter.bold =
            this.redTeamCounter.currentValue >
            this.blueTeamCounter.currentValue;
        this.blueTeamCounter.bold =
            this.blueTeamCounter.currentValue >
            this.redTeamCounter.currentValue;

        this.redTeamCounter.draw(this.ctx, time);
        this.blueTeamCounter.draw(this.ctx, time);
    }

    private drawScoreDifferenceLine() {
        const { canvas } = this.ctx;

        this.ctx.save();

        const scoreDiff =
            this.blueTeamCounter.currentValue -
            this.redTeamCounter.currentValue;

        const lineLength = canvas.width / 2.5;

        // Cap score difference line at 50% maximum score.
        const lineLengthMultiplier = MathUtils.clamp(
            scoreDiff / (maxScore * 0.5) || 0,
            -1,
            1,
        );

        const gradient = this.ctx.createLinearGradient(
            0,
            0,
            Math.sign(scoreDiff) * lineLength,
            0,
        );

        gradient.addColorStop(0, "#00ff44");
        gradient.addColorStop(0.5, "#ffff00");
        gradient.addColorStop(1, "#ff0000");

        this.ctx.lineWidth = canvas.height / 15;
        this.ctx.strokeStyle = gradient;

        this.ctx.translate(canvas.width / 2, this.ctx.lineWidth / 2);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(lineLength * lineLengthMultiplier, 0);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.restore();
    }
}
