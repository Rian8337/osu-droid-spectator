import {
    Beatmap,
    HitObject,
    IModApplicableToDroid,
    Mod,
    ModDifficultyAdjust,
    Modes,
    Playfield,
    RGBColor,
    Slider,
    Spinner,
    Vector2,
} from "@rian8337/osu-base";
import { DrawableCircle } from "./hitobjects/DrawableCircle";
import { DrawableHitObject } from "./hitobjects/DrawableHitObject";
import { DrawableSlider } from "./hitobjects/DrawableSlider";
import { DrawableSpinner } from "./hitobjects/DrawableSpinner";
import { SpectatorDataManager } from "../spectator/managers/SpectatorDataManager";

/**
 * Represents a beatmap that can be used to draw objects.
 */
export class DrawableBeatmap {
    /**
     * The underlying beatmap.
     */
    readonly beatmap: Beatmap;

    /**
     * The hit objects to be drawn.
     */
    readonly drawableHitObjects: DrawableHitObject[] = [];

    private readonly sizeScale: Vector2;

    private get comboColors(): RGBColor[] {
        return this.beatmap.colors.combo.length
            ? this.beatmap.colors.combo
            : DrawableBeatmap.defaultComboColors;
    }

    private readonly objectDrawIndexes = {
        first: 0,
        last: -1,
    };

    static readonly defaultComboColors = [
        new RGBColor(0, 202, 0),
        new RGBColor(18, 124, 255),
        new RGBColor(242, 24, 57),
        new RGBColor(255, 292, 0),
    ];

    /**
     * Converts a hitobject into drawable hitobject.
     *
     * @param object The object to convert.
     * @param mods The mods being used by the player.
     */
    static convertHitObjectToDrawable(
        object: HitObject,
        mods: (Mod & IModApplicableToDroid)[],
    ): DrawableHitObject {
        if (object instanceof Slider) {
            return new DrawableSlider(object, mods);
        } else if (object instanceof Spinner) {
            return new DrawableSpinner(object, mods);
        } else {
            return new DrawableCircle(object, mods);
        }
    }

    constructor(
        beatmap: Beatmap,
        mods: (Mod & IModApplicableToDroid)[],
        sizeScale: Vector2,
        forceCS?: number,
        forceAR?: number,
    ) {
        if (beatmap.hitObjects.objects.length === 0) {
            throw new Error("This beatmap does not have any hitobjects.");
        }

        // Don't share the same reference as the other array.
        mods = mods.slice();

        if ([forceCS, forceAR].some((v) => v !== undefined)) {
            mods.push(new ModDifficultyAdjust({ cs: forceCS, ar: forceAR }));
        }

        this.beatmap = beatmap.createPlayableBeatmap({
            mode: Modes.droid,
            mods: mods,
        });

        this.sizeScale = sizeScale;

        this.convertHitObjects(mods);
    }

    /**
     * Resets the state of object draw indexes.
     */
    refresh(): void {
        this.objectDrawIndexes.first = 0;
        this.objectDrawIndexes.last = -1;
    }

    /**
     * Draws the beatmap to the context at the given time.
     *
     * @param ctx The canvas context.
     * @param time The time to draw, in milliseconds.
     * @param manager The spectator data manager.
     */
    draw(
        ctx: CanvasRenderingContext2D,
        time: number,
        manager: SpectatorDataManager,
    ): void {
        ctx.save();

        this.applyCanvasConfig(ctx);

        time = this.beatmap.getOffsetTime(time);

        while (this.objectDrawIndexes.first < this.drawableHitObjects.length) {
            const object =
                this.drawableHitObjects[this.objectDrawIndexes.first];

            if (time <= object.lifetimeEnd) {
                break;
            }

            ++this.objectDrawIndexes.first;
        }

        while (
            this.objectDrawIndexes.last + 1 < this.drawableHitObjects.length &&
            time >=
                this.drawableHitObjects[this.objectDrawIndexes.last + 1]
                    .lifetimeStart
        ) {
            ++this.objectDrawIndexes.last;
        }

        for (
            let i = this.objectDrawIndexes.last;
            i >= this.objectDrawIndexes.first;
            --i
        ) {
            const object = this.drawableHitObjects[i];
            const objectData = manager.events.objectData.eventAtIndex(i);

            if (time > object.lifetimeEnd) {
                break;
            }

            object.draw(ctx, time, objectData, manager.maxHitWindow);
        }

        ctx.restore();
    }

    /**
     * Converts hitobjects to drawable hitobjects.
     */
    private convertHitObjects(mods: (Mod & IModApplicableToDroid)[]): void {
        let comboNumber = 1;
        let comboColorIndex = -1;
        let setComboIndex = true;

        for (const object of this.beatmap.hitObjects.objects) {
            const drawableObject = DrawableBeatmap.convertHitObjectToDrawable(
                object,
                mods,
            );

            // Set combo and color.
            if (drawableObject.object instanceof Spinner) {
                setComboIndex = true;
            } else if (drawableObject.object.isNewCombo || setComboIndex) {
                comboNumber = 1;
                comboColorIndex =
                    (comboColorIndex + 1 + drawableObject.object.comboOffset) %
                    this.comboColors.length;
                setComboIndex = false;
            }

            drawableObject.comboNumber = comboNumber++;
            drawableObject.color = this.comboColors[comboColorIndex];

            this.drawableHitObjects.push(drawableObject);
        }
    }

    private applyCanvasConfig(ctx: CanvasRenderingContext2D): void {
        ctx.shadowColor = "#666";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${this.drawableHitObjects[0].object.radius.toString()}px Trebuchet MS, sans-serif`;
        } catch {
            // Ignore error
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Position the playfield to the center of the canvas.
        const playfieldSize = Playfield.baseSize.multiply(this.sizeScale);

        ctx.translate(
            (ctx.canvas.width - playfieldSize.x) / 2,
            (ctx.canvas.height - playfieldSize.y) / 2,
        );
        ctx.scale(this.sizeScale.x, this.sizeScale.y);
    }
}
