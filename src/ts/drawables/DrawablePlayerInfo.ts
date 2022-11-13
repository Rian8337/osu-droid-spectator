import { IModApplicableToDroid, Mod } from "../osu-base";
import { PlayerInfo } from "../spectator/rawdata/PlayerInfo";
import { DrawableBeatmap } from "./DrawableBeatmap";

/**
 * Represents player information to be drawn.
 */
export class DrawablePlayerInfo implements Omit<PlayerInfo, "mods"> {
    private static readonly paddingX = 5;
    private static readonly paddingY = 35;

    readonly uid: number;
    readonly username: string;

    /**
     * The mods that they used to play.
     */
    readonly mods: (Mod & IModApplicableToDroid)[];

    constructor(
        uid: number,
        username: string,
        mods: (Mod & IModApplicableToDroid)[]
    ) {
        this.uid = uid;
        this.username = username;
        this.mods = mods;
    }

    /**
     * Draws the player information to the canvas.
     *
     * @param ctx The canvas context.
     */
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        try {
            // This code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `30px "Comic Sans MS", cursive, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        const { zeroCoordinate } = DrawableBeatmap;

        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
        ctx.fillStyle = "#fff";
        ctx.fillText(
            `${this.username} (${this.uid})${
                this.mods.length > 0
                    ? ` [+${this.mods.reduce((a, m) => a + m.acronym, "")}]`
                    : ""
            }`,
            DrawablePlayerInfo.paddingX - zeroCoordinate.x,
            DrawablePlayerInfo.paddingY - zeroCoordinate.y
        );
        ctx.restore();
    }
}
