import { maxScore, parsedBeatmap } from "../../settings/BeatmapSettings";
import { players } from "../../settings/PlayerSettings";
import { scorePortion } from "../../settings/RoomSettings";
import { dataProcessor, teamColors } from "../../settings/SpectatorSettings";
import { SpectatorAccuracyEvent } from "../../spectator/events/SpectatorAccuracyEvent";
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

            let score = manager.events.score.eventAt(time)?.score ?? 0;
            const accuracyEvent =
                manager.events.accuracy.eventAt(time) ??
                new SpectatorAccuracyEvent(time, 1, 0);

            // Remove original score multiplier from the score first to preserve NoMod scorev1.
            for (const mod of manager.mods) {
                if (mod.droidScoreMultiplier > 0) {
                    score /= mod.droidScoreMultiplier;
                }
            }

            const maxScoreV2 = 1e6;
            const scorePortionScoreV2 =
                Math.sqrt(score / maxScore) * scorePortion * maxScoreV2;
            const accPortionScoreV2 =
                (Math.pow(accuracyEvent.accuracy, 2) *
                    (1 - scorePortion) *
                    maxScoreV2 *
                    accuracyEvent.objectIndex) /
                parsedBeatmap.hitObjects.objects.length;

            teamScore +=
                (scorePortionScoreV2 + accPortionScoreV2) *
                manager.scoreMultiplier;
        }

        teamScore = Math.round(teamScore);

        this.ctx.fillText(teamScore.toString(), 0, 0);
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
            this.ctx.font = `50px "Comic Sans MS", cursive, sans-serif`;
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
}
