import { DrawableBeatmap } from "./DrawableBeatmap";

/**
 * Represents player information to be drawn.
 */
export class DrawablePlayerInfo {
    private static readonly paddingX = 5;
    private static readonly paddingY = 90;

    /**
     * The uid of the player.
     */
    readonly uid: number;

    /**
     * The username of the player.
     */
    readonly username: string;

    constructor(uid: number, username: string) {
        this.uid = uid;
        this.username = username;
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
            `${this.username} (${this.uid})`,
            DrawablePlayerInfo.paddingX - zeroCoordinate.x,
            DrawablePlayerInfo.paddingY - zeroCoordinate.y
        );
        ctx.restore();
    }
}
