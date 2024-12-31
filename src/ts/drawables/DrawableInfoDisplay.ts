import { Preview } from "../Preview";
import { teamMode } from "../settings/RoomSettings";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";
import { DrawableBeatmapInfo } from "./DrawableBeatmapInfo";
import { DrawableTeamScoreDisplay } from "./DrawableTeamScoreDisplay";

/**
 * Used to draw information to the screen.
 */
export class DrawableInfoDisplay {
    private readonly screen = document.createElement("canvas");
    private readonly beatmapInfo = new DrawableBeatmapInfo(this.ctx);
    private readonly teamScoreInfo = new DrawableTeamScoreDisplay(this.ctx);

    private get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    constructor() {
        this.screen.id = "infoDisplay";
        this.attachToContainer();
    }

    /**
     * Attaches the screen to the container.
     */
    attachToContainer() {
        this.delete();

        const container = $("#container")[0];
        container.appendChild(this.screen);
    }

    /**
     * Draws the information to the screen.
     *
     * @param time The time to draw the information at.
     */
    draw(time: number) {
        this.applyCanvasConfig();
        this.drawBackground();
        this.drawBorder();

        if (teamMode === MultiplayerTeamMode.teamVS) {
            this.teamScoreInfo.draw(time);

            // Move beatmap info down if team mode is enabled.
            this.ctx.save();
            this.ctx.translate(0, this.screen.height / 2);
        }

        this.beatmapInfo.draw();

        if (teamMode === MultiplayerTeamMode.teamVS) {
            this.ctx.restore();
        }
    }

    /**
     * Deletes this display from the screen.
     */
    delete() {
        $(this.screen).remove();
    }

    private applyCanvasConfig() {
        this.screen.width = innerWidth;
        this.screen.height = Preview.heightPadding;

        this.screen.style.position = "absolute";
        this.screen.style.left = "0px";
        this.screen.style.top = `${(innerHeight - Preview.heightPadding).toString()}px`;
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
}
