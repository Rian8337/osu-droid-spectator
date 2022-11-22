import {
    MathUtils,
    ModPrecise,
    Playfield,
    RGBColor,
    Slider,
    Spinner,
} from "../osu-base";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { PlayerInfo } from "../spectator/rawdata/PlayerInfo";
import { DrawableBeatmap } from "./DrawableBeatmap";
import { players } from "../settings/PlayerSettings";
import { dataProcessor, teamColors } from "../settings/SpectatorSettings";
import { parsedBeatmap } from "../settings/BeatmapSettings";
import { HitResult } from "../spectator/structures/HitResult";

/**
 * Represents player information to be drawn.
 */
export class DrawablePlayerInfo implements PlayerInfo {
    private static readonly paddingX = 15;
    private static readonly paddingY = 35;

    readonly uid: number;
    readonly username: string;
    readonly team?: MultiplayerTeam;

    constructor(uid: number, username: string) {
        this.uid = uid;
        this.username = username;
        this.team = players.get(this.uid)?.team;
    }

    /**
     * Draws the player information to the canvas.
     *
     * @param ctx The canvas context.
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
        let missTime = Number.NaN;
        const missAnimationDuration = 2000;

        for (
            let event = manager.events.objectData.eventAt(time);
            event &&
            event.index >= 0 &&
            time - event.time < missAnimationDuration;
            event = manager.events.objectData.eventAtIndex(event.index - 1)
        ) {
            const object = parsedBeatmap.hitObjects.objects[event.index];

            if (event.result === HitResult.miss) {
                if (object instanceof Spinner) {
                    missTime = object.endTime;
                } else {
                    missTime = object.startTime;
                }

                break;
            }

            if (!(object instanceof Slider)) {
                continue;
            }

            // Missing the slider tail doesn't reset the player's combo, so we skip it.
            for (let i = object.nestedHitObjects.length - 2; i > 0; --i) {
                const nestedObject = object.nestedHitObjects[i];
                const tickset = event.tickset[i - 1];

                if (!tickset) {
                    missTime = nestedObject.startTime;
                    break;
                }
            }

            if (
                event.accuracy ===
                Math.floor(
                    manager.hitWindow.hitWindowFor50(
                        manager.mods.some((m) => m instanceof ModPrecise)
                    )
                ) +
                    13
            ) {
                missTime = object.startTime;
                break;
            }
        }

        let color =
            this.team !== undefined
                ? teamColors[this.team]
                : new RGBColor(255, 255, 255);
        let fontSize = ctx.canvas.height / 8;
        const missDt = time - missTime;
        if (missDt <= missAnimationDuration) {
            const missColor = new RGBColor(209, 14, 0);
            const missMaxFontSize = ctx.canvas.height / 7.5;
            let multiplier = 1;

            if (missDt <= 1000) {
                const t = missDt / 1000;
                // Use ease out quart (https://easings.net/#easeOutQuart) for quicker red animation.
                multiplier = 1 - Math.pow(1 - t, 4);
            } else {
                const t = MathUtils.clamp(
                    (missDt - 1000) / (missAnimationDuration - 1000),
                    0,
                    1
                );
                // Use a reverse ease quad out (https://easings.net/#easeOutQuad) for a
                // more pleasant animation.
                multiplier = Math.pow(1 - t, 2);
            }

            color = new RGBColor(
                color.r + (missColor.r - color.r) * multiplier,
                color.g + (missColor.g - color.g) * multiplier,
                color.b + (missColor.b - color.b) * multiplier
            );
            fontSize += (missMaxFontSize - fontSize) * multiplier;
        }

        console.log(`Fill color: ${color}`);
        ctx.save();

        try {
            // This code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `bold ${fontSize}px Trebuchet MS, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        const { zeroCoordinate } = DrawableBeatmap;

        ctx.fillStyle = `rgb(${color})`;
        ctx.globalAlpha = 1;
        ctx.textAlign = "right";
        ctx.fillText(
            `${this.username} (${this.uid})${
                manager.mods.length > 0
                    ? ` [+${manager.mods.reduce((a, m) => a + m.acronym, "")}]`
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
