import { ModHardRock } from "../../osu-base";
import { maxScore, parsedBeatmap } from "../../settings/BeatmapSettings";
import { players } from "../../settings/PlayerSettings";
import { scorePortion } from "../../settings/RoomSettings";
import { dataProcessor, teamColors } from "../../settings/SpectatorSettings";
import { MultiplayerTeam } from "../../spectator/structures/MultiplayerTeam";

/**
 * Represents a counter that can be drawn.
 */
export class DrawableTeamScoreCounter {
    /**
     * The team this counter is responsible for.
     */
    readonly team: MultiplayerTeam;

    /**
     * The current team score.
     */
    score = 0;

    constructor(team: MultiplayerTeam) {
        this.team = team;
    }

    /**
     * Draws the counter to the screen.
     *
     * @param ctx The canvas context.
     * @param boldText Whether to bold the counter.
     */
    draw(ctx: CanvasRenderingContext2D, boldText: boolean): void {
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been loaded yet");
        }

        this.applyCanvasConfig(ctx, boldText);
        ctx.fillText(this.score.toLocaleString("en-US"), 0, 0);
        ctx.restore();
    }

    /**
     * Calculates the team's score at a given time.
     *
     * @param time The time.
     */
    calculateTeamScore(time: number): void {
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been loaded yet");
        }

        // TODO: consider different win conditions
        let teamScore = 0;

        for (const player of players.values()) {
            if (player.team !== this.team) {
                continue;
            }

            const manager = dataProcessor?.managers.get(player.uid);

            if (!manager) {
                continue;
            }

            // TODO: it's still wrong with mods other than PR idk why fksdfbdslf
            const scoreEvent = manager.events.score.eventAtOrDefault(time);
            const syncedScoreEvent =
                manager.events.syncedScore.eventAtOrDefault(time);

            let score = scoreEvent.score;
            if (syncedScoreEvent.time > scoreEvent.time) {
                score = syncedScoreEvent.score;
            }

            let accuracyEvent = manager.events.accuracy.eventAtOrDefault(time);
            const syncedAccuracyEvent =
                manager.events.syncedAccuracy.eventAtOrDefault(time);

            if (syncedAccuracyEvent.time > accuracyEvent.time) {
                accuracyEvent = syncedAccuracyEvent;
            }

            // Remove original score multiplier from the score first to preserve NoMod scorev1.
            for (const mod of manager.mods) {
                if (mod.droidScoreMultiplier > 0) {
                    score /= mod.droidScoreMultiplier;
                }
            }

            const maxScoreV2 = 1e6;
            const tempScorePortionScoreV2 =
                Math.sqrt(score / maxScore) * scorePortion * maxScoreV2;
            const tempAccPortionScoreV2 =
                (Math.pow(accuracyEvent.accuracy, 2) *
                    (1 - scorePortion) *
                    maxScoreV2 *
                    (accuracyEvent.objectIndex + 1)) /
                parsedBeatmap.hitObjects.objects.length;

            const scorePortionScoreV2 =
                tempScorePortionScoreV2 -
                this.calculateMissPenalty(player.uid, tempScorePortionScoreV2);
            const accPortionScoreV2 =
                tempAccPortionScoreV2 -
                this.calculateMissPenalty(player.uid, tempAccPortionScoreV2);

            teamScore +=
                (scorePortionScoreV2 + accPortionScoreV2) *
                manager.scoreMultiplier;

            if (manager.mods.some((m) => m instanceof ModHardRock)) {
                teamScore *= 1.1 / new ModHardRock().droidScoreMultiplier;
            }
        }

        this.score = Math.round(teamScore);
    }

    private applyCanvasConfig(
        ctx: CanvasRenderingContext2D,
        boldText: boolean
    ): void {
        ctx.save();

        const { canvas } = ctx;

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${boldText ? "bold " : ""}${
                canvas.height / 2
            }px Trebuchet MS, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgb(${teamColors[this.team]})`;

        if (this.team === MultiplayerTeam.red) {
            ctx.textAlign = "right";
            ctx.translate(
                canvas.width / 2 - canvas.width / 25,
                canvas.height / 2 - canvas.height / 4
            );
        } else {
            ctx.textAlign = "left";
            ctx.translate(
                canvas.width / 2 + canvas.width / 25,
                canvas.height / 2 - canvas.height / 4
            );
        }
    }

    /**
     * Calculates the miss penalty of a player.
     *
     * @param uid The uid of the player.
     * @param tempScoreV2 The temporary score v2 value.
     * @returns The score v2 value with miss penalty.
     */
    private calculateMissPenalty(uid: number, tempScoreV2: number): number {
        const misses =
            dataProcessor?.managers.get(uid)?.events.objectData.misses ?? 0;

        return tempScoreV2 * 5e-3 * misses;
    }
}
