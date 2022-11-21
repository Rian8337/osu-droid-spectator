import { IModApplicableToDroid, Mod, Playfield } from "../osu-base";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { PlayerInfo } from "../spectator/rawdata/PlayerInfo";
import { DrawableBeatmap } from "./DrawableBeatmap";
import { players } from "../settings/PlayerSettings";
import { teamColors } from "../settings/SpectatorSettings";

/**
 * Represents player information to be drawn.
 */
export class DrawablePlayerInfo implements PlayerInfo {
    private static readonly paddingX = 15;
    private static readonly paddingY = 35;

    readonly uid: number;
    readonly username: string;
    readonly team?: MultiplayerTeam;

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
        this.team = players.get(this.uid)?.team;
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
            ctx.font = `bold 40px "Times New Roman", cursive, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        const { zeroCoordinate } = DrawableBeatmap;

        // TODO: figure out why the hell score multiplier doesn't work in-game
        switch (this.team) {
            case MultiplayerTeam.red:
                ctx.fillStyle = teamColors.red;
                break;
            case MultiplayerTeam.blue:
                ctx.fillStyle = teamColors.blue;
                break;
            default:
                ctx.fillStyle = "#fff";
        }

        ctx.globalAlpha = 1;
        ctx.textAlign = "right";
        ctx.fillText(
            `${this.username} (${this.uid})${
                this.mods.length > 0
                    ? ` [+${this.mods.reduce((a, m) => a + m.acronym, "")}]`
                    : ""
            }`,
            Playfield.baseSize.x +
                zeroCoordinate.x -
                DrawablePlayerInfo.paddingX,
            Playfield.baseSize.y +
                zeroCoordinate.y -
                DrawablePlayerInfo.paddingY
        );
        ctx.restore();
    }
}
