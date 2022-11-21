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
     * The canvas element of this preview.
     */
    readonly screen: HTMLCanvasElement;

    private get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    constructor(team: MultiplayerTeam) {
        this.team = team;
        this.screen = document.createElement("canvas");

        const container = $("#container")[0];
        container.appendChild(this.screen);
    }

    /**
     * Draws the counter to the screen.
     *
     * @param time The time to draw the counter at.
     */
    draw(time: number): void {
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been loaded yet");
        }

        this.applyCanvasConfig();

        let teamScore = 0;

        for (const player of players.values()) {
            if (player.team !== this.team) {
                continue;
            }

            const manager = dataProcessor?.managers.get(player.uid);

            if (!manager) {
                continue;
            }

            // TODO: take a look at scorev2 difference
            // TODO: attempt to add a "line" to notice score diff just like in official osu! tournament client
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
                Math.pow(accuracyEvent.accuracy, 2) *
                (1 - scorePortion) *
                maxScoreV2 *
                (accuracyEvent.objectIndex + 1) /
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
        }

        teamScore = Math.round(teamScore);

        this.ctx.fillText(teamScore.toLocaleString("en-US"), 0, 0);
    }

    /**
     * Deletes this counter from the screen.
     */
    delete(): void {
        $(this.screen).remove();
    }

    private applyCanvasConfig(): void {
        this.screen.width = window.innerWidth / 2;
        this.screen.height = window.innerHeight;

        this.ctx.translate(this.screen.width / 2, this.screen.height / 2);

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            this.ctx.font = `bold 40px "Times New Roman", cursive, sans-serif`;
        } catch (e) {
            // Ignore error
        }

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.screen.style.position = "absolute";

        switch (this.team) {
            case MultiplayerTeam.red:
                this.ctx.fillStyle = teamColors.red;
                this.screen.style.left = "0px";
                break;
            case MultiplayerTeam.blue:
                this.ctx.fillStyle = teamColors.blue;
                this.screen.style.left = `${this.screen.width}px`;
                break;
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
