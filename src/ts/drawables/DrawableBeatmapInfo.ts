import { Preview } from "../Preview";
import {
    mostCommonBPM,
    parsedBeatmap,
    pickedBeatmap,
} from "../settings/BeatmapSettings";

/**
 * A drawable used to display beatmap information.
 */
export class DrawableBeatmapInfo {
    private readonly ctx: CanvasRenderingContext2D;

    private get screen(): HTMLCanvasElement {
        return this.ctx.canvas;
    }

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    /**
     * Draws this display to the screen.
     */
    draw() {
        if (!pickedBeatmap || !parsedBeatmap) {
            return;
        }

        this.ctx.save();

        this.ctx.translate(this.screen.width / 2, 0);
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#FFFFFF";

        const fontHeight = Preview.heightPadding / 5;

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            this.ctx.font = `bold ${fontHeight.toString()}px Trebuchet MS, sans-serif`;
        } catch {
            // Ignore error
        }

        // Name
        let beatmapName = `${parsedBeatmap.metadata.artist} - ${parsedBeatmap.metadata.title}`;
        const yPosOffset = fontHeight + this.screen.height / 50;
        let yPos = yPosOffset;

        // Trim if too long
        while (this.ctx.measureText(beatmapName).width > this.screen.width) {
            beatmapName = beatmapName.slice(0, -3) + "...";
        }

        this.ctx.fillText(beatmapName, 0, yPos);
        yPos += yPosOffset;

        // Mapper and Difficulty
        let mapperAndDiff = `Mapped by ${parsedBeatmap.metadata.creator} // ${parsedBeatmap.metadata.version}`;

        // Trim if too long
        while (this.ctx.measureText(mapperAndDiff).width > this.screen.width) {
            mapperAndDiff = `Mapped by ${parsedBeatmap.metadata.creator} // ${parsedBeatmap.metadata.version.slice(0, -3)}...`;
        }

        this.ctx.fillText(mapperAndDiff, 0, yPos);
        yPos += yPosOffset;

        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            this.ctx.font = `bold ${fontHeight.toString()}px Trebuchet MS, sans-serif`;
        } catch {
            // Ignore error
        }

        // Statistics (CS/AR/OD/BPM/Star Rating/Length)
        const firstStatisticsLine =
            `CS ${parsedBeatmap.difficulty.cs.toString()} // ` +
            `AR ${parsedBeatmap.difficulty.ar.toString()} // ` +
            `OD ${parsedBeatmap.difficulty.od.toString()} // ` +
            `${mostCommonBPM?.toFixed(2) ?? "Unknown"} BPM // ` +
            `${pickedBeatmap.starRating?.toFixed(2) ?? "Unknown"} ★`;

        this.ctx.fillText(firstStatisticsLine, 0, yPos);
        yPos += yPosOffset;

        const duration =
            parsedBeatmap.hitObjects.objects[
                parsedBeatmap.hitObjects.objects.length - 1
            ].endTime;

        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        const secondStatisticsLine = `Length: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        this.ctx.fillText(secondStatisticsLine, 0, yPos);
        this.ctx.restore();
    }
}
