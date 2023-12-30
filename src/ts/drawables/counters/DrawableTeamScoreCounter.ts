import { parsedBeatmap } from "../../settings/BeatmapSettings";
import { players } from "../../settings/PlayerSettings";
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

        this.score = 0;

        for (const player of players.values()) {
            if (player.team !== this.team) {
                continue;
            }

            const manager = dataProcessor.managers.get(player.uid);

            if (!manager) {
                continue;
            }

            const scoreEvent = manager.events.score.eventAtOrDefault(time);
            const syncedScoreEvent =
                manager.events.syncedScore.eventAtOrDefault(time);

            let score = scoreEvent.score;
            if (syncedScoreEvent.time > scoreEvent.time) {
                score = syncedScoreEvent.score;
            }

            this.score += score;
        }
    }

    private applyCanvasConfig(
        ctx: CanvasRenderingContext2D,
        boldText: boolean,
    ): void {
        ctx.save();

        const { canvas } = ctx;

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${boldText ? "bold " : ""}${
                canvas.height / 2.5
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
                canvas.height / 2 + canvas.height / 10,
            );
        } else {
            ctx.textAlign = "left";
            ctx.translate(
                canvas.width / 2 + canvas.width / 25,
                canvas.height / 2 + canvas.height / 10,
            );
        }
    }
}
