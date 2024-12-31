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

    private get widthMargin(): number {
        return this.screen.width / 50;
    }

    private get heightMargin(): number {
        return this.screen.height / 30;
    }

    private get fontHeight(): number {
        return Preview.heightPadding / 4;
    }

    private get yPosOffset(): number {
        return this.fontHeight + this.heightMargin * 2;
    }

    private xPos = 0;
    private yPos = 0;

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

        this.translateTo(this.widthMargin, this.heightMargin);

        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#FFFFFF";

        // Beatmap name
        this.setFont(true);
        let beatmapName = `${parsedBeatmap.metadata.artist}  -  ${parsedBeatmap.metadata.title}`;

        // Trim if too long
        while (
            this.ctx.measureText(beatmapName).width >
            this.screen.width / 2 - this.widthMargin
        ) {
            beatmapName = beatmapName.slice(0, -3) + "...";
        }

        this.ctx.fillText(beatmapName, this.xPos, this.yPos);

        // Mapper
        this.moveDown();

        this.write(
            // Artificially increase prefix length
            "Mapper   ",
            parsedBeatmap.metadata.creator,
            " ".repeat(10),
            true,
        );

        // Difficulty
        this.write(
            // Artificially increase prefix length
            "Difficulty   ",
            parsedBeatmap.metadata.version,
            undefined,
            true,
        );

        // Beatmap statistics
        this.translateTo(this.screen.width / 2, 0);

        // CS, AR, OD
        this.write("CS", parsedBeatmap.difficulty.cs.toString(), " / ");
        this.write("AR", parsedBeatmap.difficulty.ar.toString(), " / ");
        this.write("OD", parsedBeatmap.difficulty.od.toString());

        // Star Rating
        this.moveDown();

        this.write(
            "Star Rating",
            pickedBeatmap.starRating?.toFixed(2) ?? "Unknown",
        );

        // Length
        this.translateTo(this.screen.width / 4, 0);

        const duration =
            parsedBeatmap.hitObjects.objects[
                parsedBeatmap.hitObjects.objects.length - 1
            ].endTime;

        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        this.write(
            "Length",
            [minutes, seconds]
                .map((v) => v.toString().padStart(2, "0"))
                .join(":"),
        );

        // BPM
        this.moveDown();

        this.write(
            "BPM",
            mostCommonBPM?.toFixed(2).replace(/\.?0+$/, "") ?? "Unknown",
        );

        this.ctx.restore();
    }

    private write(
        prefix: string,
        value: string,
        paddingText?: string,
        trimIfTooLong?: boolean,
    ) {
        this.setFont(false);
        this.ctx.fillText(prefix, this.xPos, this.yPos);
        this.xPos += this.ctx.measureText(prefix + " ").width;

        this.setFont(true);

        if (trimIfTooLong) {
            while (
                this.ctx.measureText(value).width >
                this.screen.width / 4 - this.widthMargin
            ) {
                value = value.slice(0, -3) + "...";
            }
        }

        this.ctx.fillText(value, this.xPos, this.yPos);
        this.xPos += this.ctx.measureText(value).width;

        if (paddingText) {
            this.setFont(false);
            this.ctx.fillText(paddingText, this.xPos, this.yPos);
            this.xPos += this.ctx.measureText(paddingText).width;
        }
    }

    private translateTo(x: number, y: number) {
        this.ctx.translate(x, y);

        this.xPos = 0;
        this.yPos = this.yPosOffset;
    }

    private moveDown() {
        this.xPos = 0;
        this.yPos += this.yPosOffset;
    }

    private setFont(bold: boolean) {
        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            this.ctx.font = `${bold ? "bold " : ""}${this.fontHeight.toString()}px Torus`;
        } catch {
            // Ignore error
        }
    }
}
