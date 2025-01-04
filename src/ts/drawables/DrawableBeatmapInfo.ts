import { BeatmapDifficulty, Modes, ModUtil } from "@rian8337/osu-base";
import {
    droidStarRating,
    mostCommonBPM,
    parsedBeatmap,
    pickedBeatmap,
    standardStarRating,
} from "../settings/BeatmapSettings";
import { mods } from "../settings/RoomSettings";

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
        return innerHeight / 300;
    }

    private get fontHeight(): number {
        return innerHeight / 40;
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

        const difficulty = new BeatmapDifficulty(parsedBeatmap.difficulty);

        ModUtil.applyModsToBeatmapDifficulty(
            difficulty,
            Modes.droid,
            mods,
            undefined,
            true,
        );

        // CS, AR, OD
        this.write("CS", difficulty.cs.toFixed(2).replace(/\.?0+$/, ""), " / ");
        this.write("AR", difficulty.ar.toFixed(2).replace(/\.?0+$/, ""), " / ");
        this.write("OD", difficulty.od.toFixed(2).replace(/\.?0+$/, ""));

        // Star Rating
        this.moveDown();

        this.write(
            "Star Rating",
            this.formatNullableDecimal(droidStarRating) +
                " / " +
                this.formatNullableDecimal(standardStarRating),
        );

        // Length
        this.translateTo(this.screen.width / 4, 0);

        const duration =
            parsedBeatmap.hitObjects.objects[
                parsedBeatmap.hitObjects.objects.length - 1
            ].endTime / ModUtil.calculateRateWithMods(mods);

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

        this.write("BPM", this.formatNullableDecimal(mostCommonBPM));

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

    private formatNullableDecimal(value: number | null) {
        return value === null
            ? "Unknown"
            : value.toFixed(2).replace(/\.?0+$/, "");
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
