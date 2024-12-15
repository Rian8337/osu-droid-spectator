import { MathUtils } from "@rian8337/osu-base";
import { Preview } from "../Preview";
import { maxScore } from "../settings/BeatmapSettings";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { DrawableTeamScoreCounter } from "./counters/DrawableTeamScoreCounter";
import { DrawableTeamScoreDifferenceCounter } from "./counters/DrawableTeamScoreDifferenceCounter";

/**
 * Represents a display for displaying team score.
 */
export class DrawableTeamScoreDisplay {
    private readonly screen: HTMLCanvasElement;

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

    private get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    constructor() {
        this.screen = document.createElement("canvas");

        const container = $("#container")[0];
        container.appendChild(this.screen);

        this.draw(0);
    }

    /**
     * Draws this display to the screen.
     *
     * @param time The time to draw the display at.
     */
    draw(time: number) {
        this.applyCanvasConfig();
        this.drawBackground();
        this.drawBorder();
        this.drawCounters(time);
        this.scoreDifferenceCounter.draw(this.ctx, time);
        this.drawScoreDifferenceLine();
    }

    /**
     * Deletes this display from the screen.
     */
    delete() {
        $(this.screen).remove();
    }

    private applyCanvasConfig() {
        this.screen.width = innerWidth;
        this.screen.height = Preview.heightPadding * 2;

        this.screen.style.position = "absolute";
        this.screen.style.left = "0px";
        this.screen.style.top = `${(innerHeight - Preview.heightPadding * 2).toString()}px`;
    }

    private drawBackground() {
        this.ctx.save();

        this.ctx.globalAlpha = 0.8;
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.screen.width, this.screen.height);

        this.ctx.restore();
    }

    private drawBorder() {
        this.ctx.save();

        this.ctx.strokeStyle = "#cccccc";
        this.ctx.lineWidth = this.screen.height / 20;

        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.screen.width, 0);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.moveTo(0, this.screen.height);
        this.ctx.lineTo(this.screen.width, this.screen.height);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.restore();
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
        this.ctx.save();

        const scoreDiff =
            this.blueTeamCounter.currentValue -
            this.redTeamCounter.currentValue;

        const lineLength = this.screen.width / 2.5;

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

        this.ctx.lineWidth = this.screen.height / 15;
        this.ctx.strokeStyle = gradient;

        this.ctx.translate(this.screen.width / 2, this.ctx.lineWidth / 2);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(lineLength * lineLengthMultiplier, 0);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.restore();
    }
}
