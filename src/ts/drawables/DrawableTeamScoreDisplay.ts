import { MathUtils } from "../osu-base";
import { Preview } from "../Preview";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { DrawableTeamScoreCounter } from "./counters/DrawableTeamScoreCounter";

/**
 * Represents a display for displaying team score.
 */
export class DrawableTeamScoreDisplay {
    /**
     * The canvas element of this display.
     */
    readonly screen: HTMLCanvasElement;

    /**
     * The score counters of this display.
     */
    readonly counters: Record<MultiplayerTeam, DrawableTeamScoreCounter>;

    private get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    constructor() {
        this.screen = document.createElement("canvas");
        this.counters = {
            [MultiplayerTeam.red]: new DrawableTeamScoreCounter(
                MultiplayerTeam.red
            ),
            [MultiplayerTeam.blue]: new DrawableTeamScoreCounter(
                MultiplayerTeam.blue
            ),
        };

        const container = $("#container")[0];
        container.appendChild(this.screen);
    }

    /**
     * Draws this display to the screen.
     *
     * @param time The time to draw the display at.
     */
    draw(time: number): void {
        this.applyCanvasConfig();
        this.drawBackground();
        this.drawBorder();
        this.drawCounters(time);
        this.drawScoreDifferenceLine();
    }

    /**
     * Deletes this display from the screen.
     */
    delete(): void {
        $(this.screen).remove();
    }

    private applyCanvasConfig(): void {
        this.screen.width = window.innerWidth;
        this.screen.height = Preview.heightPadding * 2;

        this.screen.style.position = "absolute";
        this.screen.style.left = "0px";
        this.screen.style.top = `${
            window.innerHeight / 2 - Preview.heightPadding
        }px`;
    }

    private drawBackground(): void {
        this.ctx.save();

        this.ctx.globalAlpha = 0.8;
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.screen.width, this.screen.height);

        this.ctx.restore();
    }

    private drawBorder(): void {
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

    private drawCounters(time: number): void {
        const redCounter = this.counters[MultiplayerTeam.red];
        const blueCounter = this.counters[MultiplayerTeam.blue];

        redCounter.calculateTeamScore(time);
        blueCounter.calculateTeamScore(time);

        redCounter.draw(this.ctx, redCounter.score > blueCounter.score);
        blueCounter.draw(this.ctx, blueCounter.score > redCounter.score);
    }

    private drawScoreDifferenceLine(): void {
        this.ctx.save();

        const scoreDiff =
            this.counters[MultiplayerTeam.blue].score -
            this.counters[MultiplayerTeam.red].score;
        const lineLength = this.screen.width / 2.5;
        // Cap score difference line at 800000 score.
        const lineLengthMultiplier = MathUtils.clamp(scoreDiff / 800000, -1, 1);

        this.ctx.translate(
            this.screen.width / 2,
            this.screen.height / 2 + this.screen.height / 5
        );

        const gradient = this.ctx.createLinearGradient(
            0,
            0,
            Math.sign(scoreDiff) * lineLength,
            0
        );

        gradient.addColorStop(0, "#00ff44");
        gradient.addColorStop(0.5, "#ffff00");
        gradient.addColorStop(1, "#ff0000");

        this.ctx.lineWidth = this.screen.height / 15;
        this.ctx.strokeStyle = gradient;

        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(lineLength * lineLengthMultiplier, 0);
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.restore();
    }
}
