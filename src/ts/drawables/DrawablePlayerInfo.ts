import { MathUtils, RGBColor, Vector2 } from "../osu-base";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { players } from "../settings/PlayerSettings";
import { dataProcessor, teamColors } from "../settings/SpectatorSettings";
import { parsedBeatmap } from "../settings/BeatmapSettings";
import { Interpolation } from "../osu-base/mathutil/Interpolation";
import { MultiplayerPlayer } from "../spectator/structures/MultiplayerPlayer";

/**
 * Represents player information to be drawn.
 */
export class DrawablePlayerInfo
    implements Pick<MultiplayerPlayer, "uid" | "username" | "team">
{
    private static readonly paddingX = 15;
    private static readonly paddingY = 35;
    private static readonly missColor = new RGBColor(209, 14, 0);

    readonly uid: number;
    readonly username: string;
    readonly team: MultiplayerTeam | null;

    private readonly sizeScale: Vector2;

    constructor(uid: number, username: string, sizeScale: Vector2) {
        this.uid = uid;
        this.username = username;
        this.team = players.get(this.uid)?.team ?? null;
        this.sizeScale = sizeScale;
    }

    /**
     * Draws the player information to the canvas.
     *
     * @param ctx The canvas context.
     * @param time The time to draw the player information at.
     */
    draw(ctx: CanvasRenderingContext2D, time: number): void {
        if (!parsedBeatmap) {
            return;
        }

        const manager = dataProcessor?.managers.get(this.uid);

        if (!manager) {
            return;
        }

        // Animate misses.
        const missAnimationDuration = 2000;
        let event = manager.events.combo.eventAtOrDefault(time);

        while (
            event.time > 0 &&
            event.combo > 0 &&
            time - event.time <= missAnimationDuration
        ) {
            event = manager.events.combo.eventAtOrDefault(event.time - 1);
        }

        let color =
            this.team !== null
                ? teamColors[this.team]
                : new RGBColor(255, 255, 255);
        let fontSize = ctx.canvas.height / 8;
        const missDt = time - event.time;

        if (event.combo === 0 && missDt <= missAnimationDuration) {
            const missMaxFontSize = ctx.canvas.height / 6;
            let multiplier = 1;

            if (missDt <= 1000) {
                const t = missDt / 1000;
                // Use ease out quart (https://easings.net/#easeOutQuart) for quicker red animation.
                multiplier = 1 - Math.pow(1 - t, 4);
            } else {
                const t = MathUtils.clamp(
                    (missDt - 1000) / (missAnimationDuration - 1000),
                    0,
                    1,
                );
                // Use a reverse ease quad out (https://easings.net/#easeOutQuad) for a
                // more pleasant animation.
                multiplier = Math.pow(1 - t, 2);
            }

            const { missColor } = DrawablePlayerInfo;
            color = new RGBColor(
                Interpolation.lerp(color.r, missColor.r, multiplier),
                Interpolation.lerp(color.g, missColor.g, multiplier),
                Interpolation.lerp(color.b, missColor.b, multiplier),
            );
            fontSize = Interpolation.lerp(
                fontSize,
                missMaxFontSize,
                multiplier,
            );
        }

        ctx.save();

        try {
            // This code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `bold ${fontSize}px Trebuchet MS, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        ctx.fillStyle = `rgb(${color})`;
        ctx.globalAlpha = 1;
        ctx.textAlign = "right";
        ctx.translate(ctx.canvas.width, ctx.canvas.height);
        ctx.scale(this.sizeScale.x, this.sizeScale.y);
        ctx.fillText(
            `${this.username}${
                manager.mods.length > 0
                    ? ` (${manager.mods.reduce((a, m) => a + m.acronym, "")})`
                    : ""
            }`,
            -DrawablePlayerInfo.paddingX,
            -DrawablePlayerInfo.paddingY,
        );
        ctx.restore();
    }
}
