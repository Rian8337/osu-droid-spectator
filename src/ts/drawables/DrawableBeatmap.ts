import {
    Beatmap,
    CircleSizeCalculator,
    HitObject,
    HitObjectStackEvaluator,
    IModApplicableToDroid,
    MapStats,
    Mod,
    ModUtil,
    PlaceableHitObject,
    Playfield,
    RGBColor,
    Slider,
    Spinner,
    Utils,
    Vector2,
} from "../osu-base";
import { DrawableCircle } from "./hitobjects/DrawableCircle";
import { DrawableHitObject } from "./hitobjects/DrawableHitObject";
import { DrawableSlider } from "./hitobjects/DrawableSlider";
import { DrawableSpinner } from "./hitobjects/DrawableSpinner";
import { SpectatorDataManager } from "../spectator/managers/SpectatorDataManager";
import { Preview } from "../Preview";

/**
 * Represents a beatmap that can be used to draw objects.
 */
export class DrawableBeatmap {
    /**
     * The coordinate of the playfield at (0, 0) with respect to the window size.
     */
    static get zeroCoordinate(): Vector2 {
        return new Vector2(
            innerWidth - Playfield.baseSize.x,
            innerHeight - Playfield.baseSize.y - Preview.heightPadding,
        );
    }

    /**
     * The underlying beatmap.
     */
    readonly beatmap: Beatmap;

    /**
     * The hit objects to be drawn.
     */
    readonly drawableHitObjects: DrawableHitObject[] = [];

    private readonly approachTime: number;

    private get comboColors(): RGBColor[] {
        return this.beatmap.colors.combo?.length
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
        forcedAR?: number,
    ) {
        this.beatmap = beatmap;

        if (this.beatmap.hitObjects.objects.length === 0) {
            throw new Error("This beatmap does not have any hitobjects.");
        }

        const stats = new MapStats({
            cs: beatmap.difficulty.cs,
            ar: forcedAR ?? beatmap.difficulty.ar,
            mods: ModUtil.removeSpeedChangingMods(mods),
            isForceAR: forcedAR !== undefined,
        }).calculate();

        const objectScale = CircleSizeCalculator.standardCSToDroidScale(
            stats.cs!,
        );

        const hitObjects =
            objectScale !== beatmap.hitObjects.objects[0].scale
                ? // Deep-copy all objects so that the global beatmap instance is not modified.
                  Utils.deepCopy(beatmap.hitObjects.objects)
                : beatmap.hitObjects.objects;

        this.approachTime = MapStats.arToMS(stats.ar!);
        this.convertHitObjects(hitObjects, mods, objectScale);
    }

    update(ctx: CanvasRenderingContext2D): void {
        ctx.shadowColor = "#666";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${this.drawableHitObjects[0].object.radius}px Trebuchet MS, sans-serif`;
        } catch (e) {
            // Ignore error
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const { zeroCoordinate } = DrawableBeatmap;
        ctx.translate(zeroCoordinate.x, zeroCoordinate.y);
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
        time = this.beatmap.getOffsetTime(time);

        while (this.objectDrawIndexes.first < this.drawableHitObjects.length) {
            const object =
                this.drawableHitObjects[this.objectDrawIndexes.first];
            const objectData = manager.events.objectData.eventAtIndex(
                this.objectDrawIndexes.first,
            );

            let timeThreshold =
                DrawableHitObject.hitResultFadeOutStartTime +
                DrawableHitObject.hitResultFadeOutTime;

            if (objectData) {
                timeThreshold += objectData.time;
            } else {
                timeThreshold += object.object.endTime + manager.maxHitWindow;
            }

            if (time <= timeThreshold) {
                break;
            }

            ++this.objectDrawIndexes.first;
        }

        while (
            this.objectDrawIndexes.last + 1 < this.drawableHitObjects.length &&
            time >=
                this.drawableHitObjects[this.objectDrawIndexes.last + 1].object
                    .startTime -
                    this.approachTime
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

            let timeThreshold =
                DrawableHitObject.hitResultFadeOutStartTime +
                DrawableHitObject.hitResultFadeOutTime;

            if (objectData) {
                timeThreshold += objectData.time;
            } else {
                timeThreshold += object.object.endTime + manager.maxHitWindow;
            }

            if (time > timeThreshold) {
                break;
            }

            object.draw(ctx, time, objectData, manager.maxHitWindow);
        }
    }

    /**
     * Converts hitobjects to drawable hitobjects.
     */
    private convertHitObjects(
        hitObjects: readonly PlaceableHitObject[],
        mods: (Mod & IModApplicableToDroid)[],
        objectScale: number,
    ): void {
        let comboNumber = 1;
        let comboColorIndex = -1;
        let setComboIndex = true;

        const recomputeStackHeight = objectScale !== hitObjects[0].scale;

        for (const object of hitObjects) {
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

            drawableObject.object.scale = objectScale;
            drawableObject.approachTime = this.approachTime;
            drawableObject.comboNumber = comboNumber++;
            drawableObject.color = this.comboColors[comboColorIndex];

            this.drawableHitObjects.push(drawableObject);
        }

        if (recomputeStackHeight) {
            HitObjectStackEvaluator.applyDroidStacking(
                hitObjects,
                this.beatmap.general.stackLeniency,
            );
        }
    }
}
