import {
    BeatmapDifficulty,
    DroidHitWindow,
    Modes,
    ModPrecise,
    ModUtil,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import {
    droidStarRating,
    parsedBeatmap,
    pickedBeatmap,
    standardStarRating,
} from "../settings/BeatmapSettings";
import { mods } from "../settings/RoomSettings";
import { DrawableRollingCounter } from "./counters/DrawableRollingCounter";

/**
 * A drawable used to display beatmap information.
 */
export class DrawableBeatmapInfo {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly bpmCounter = new DrawableBPMCounter();

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
     *
     * @param time The time at which this display is drawn.
     */
    draw(time: number) {
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

        if (mods.some((m) => m instanceof ModPrecise)) {
            // Special case for OD. The Precise mod changes the hit window and not the OD itself, but we must
            // map the hit window back to the original hit window for the user to understand the difficulty
            // increase of the mod.
            const { greatWindow } = new PreciseDroidHitWindow(difficulty.od);

            difficulty.od = DroidHitWindow.greatWindowToOD(greatWindow);
        }

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

        const clockRate = ModUtil.calculateRateWithMods(mods);
        const duration =
            parsedBeatmap.hitObjects.objects[
                parsedBeatmap.hitObjects.objects.length - 1
            ].endTime / clockRate;

        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);

        this.write(
            "Length",
            [minutes, seconds]
                .map((v) => v.toString().padStart(2, "0"))
                .join(":"),
        );

        // BPM
        // This won't actually draw the counter - just updating the value.
        this.bpmCounter.draw(this.ctx, time);
        this.moveDown();

        const bpm = this.bpmCounter.currentValue * clockRate;

        this.write("BPM", this.formatNullableDecimal(bpm));

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
            let wasTrimmed = false;

            while (
                value.length > 3 &&
                this.ctx.measureText(value).width >
                    this.screen.width / 4 - this.widthMargin * 2
            ) {
                wasTrimmed = true;
                value = value.slice(0, -3);
            }

            if (wasTrimmed) {
                value += "...";
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
        return value?.toFixed(2).replace(/\.?0+$/, "") ?? "Unknown";
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

class DrawableBPMCounter extends DrawableRollingCounter {
    protected override readonly rollingDuration = 500;
    protected override readonly allowFractional = false;

    override draw(_: CanvasRenderingContext2D, time: number) {
        this.update(time);
    }

    protected override getTargetValue(time: number): number {
        if (!parsedBeatmap) {
            return 0;
        }

        const timingPoint =
            parsedBeatmap.controlPoints.timing.controlPointAt(time);

        return 60000 / timingPoint.msPerBeat;
    }
}
