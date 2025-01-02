import { parsedBeatmap } from "../../settings/BeatmapSettings";
import { players } from "../../settings/PlayerSettings";
import { dataProcessor, teamColors } from "../../settings/SpectatorSettings";
import { MultiplayerTeam } from "../../spectator/structures/MultiplayerTeam";
import { DrawableRollingCounter } from "./DrawableRollingCounter";

/**
 * Represents a counter that can be drawn.
 */
export class DrawableTeamScoreCounter extends DrawableRollingCounter {
    /**
     * The team this counter is responsible for.
     */
    readonly team: MultiplayerTeam;

    /**
     * The current team score.
     */
    score = 0;

    /**
     * Whether to bold the counter.
     */
    bold = false;

    private readonly charLengthMap = new Map<string, number>();
    private longestCharWidth = 0;

    private lastCanvasWidth = 0;
    private lastCanvasHeight = 0;

    constructor(team: MultiplayerTeam) {
        super();

        this.team = team;
    }

    /**
     * Draws the counter to the screen.
     *
     * @param ctx The canvas context.
     * @param time The time to draw the counter at.
     */
    override draw(ctx: CanvasRenderingContext2D, time: number): void {
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been loaded yet");
        }

        this.update(time);
        this.applyCanvasConfig(ctx);

        for (const char of this.currentValue.toLocaleString("en-US")) {
            const width = this.charLengthMap.get(char) ?? this.longestCharWidth;

            if (char === ",") {
                ctx.fillText(char, 0, 0);
                ctx.translate(width, 0);
            } else {
                // Center the character.
                ctx.fillText(char, (this.longestCharWidth - width) / 2, 0);
                ctx.translate(this.longestCharWidth, 0);
            }
        }

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

            this.score += manager.events.score.eventAtOrDefault(time).score;
        }
    }

    protected override getTargetValue(): number {
        return this.score;
    }

    private applyCanvasConfig(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const { canvas } = ctx;

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${this.bold ? "bold " : ""}${(
                canvas.height / 5
            ).toString()}px Torus`;
        } catch {
            // Ignore error
        }

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgb(${teamColors[this.team].toString()})`;

        // We are not using addEventListener here to prevent instances of this class
        // from not being garbage collected due to reference in the event listener.
        if (
            this.lastCanvasWidth !== canvas.width ||
            this.lastCanvasHeight !== canvas.height
        ) {
            this.charLengthMap.clear();

            this.lastCanvasWidth = canvas.width;
            this.lastCanvasHeight = canvas.height;
        }

        if (this.charLengthMap.size === 0) {
            this.updateLongestCharWidth(ctx);
        }

        if (this.team === MultiplayerTeam.red) {
            ctx.translate(
                canvas.width / 2 -
                    canvas.width / 50 - // Commas do not obey longest character width.
                    (this.currentValue.toString().replace(",", "").length *
                        this.longestCharWidth +
                        (this.charLengthMap.get(",") ?? this.longestCharWidth)),
                canvas.height / 2 - canvas.height / 10,
            );
        } else {
            ctx.translate(
                canvas.width / 2 + canvas.width / 50,
                canvas.height / 2 - canvas.height / 10,
            );
        }
    }

    private updateLongestCharWidth(ctx: CanvasRenderingContext2D): void {
        const loadChar = (char: string) => {
            const { width } = ctx.measureText(char);

            this.charLengthMap.set(char, width);
            this.longestCharWidth = Math.max(width, this.longestCharWidth);
        };

        this.longestCharWidth = 0;

        for (let i = 0; i < 10; ++i) {
            loadChar(i.toString());
        }

        loadChar(",");
    }
}
