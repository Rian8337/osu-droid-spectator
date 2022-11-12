import {
    Beatmap,
    Circle,
    HitObject,
    MapStats,
    Modes,
    Playfield,
    RGBColor,
    Slider,
    Spinner,
} from "../osu-base";
import { DrawableCircle } from "./DrawableCircle";
import { DrawableHitObject } from "./DrawableHitObject";
import { DrawableSlider } from "./DrawableSlider";
import { DrawableSpinner } from "./DrawableSpinner";
import { SpectatorDataManager } from "../spectator/SpectatorDataManager";
import { HitResult } from "../spectator/rawdata/HitResult";

/**
 * Represents a beatmap that can be used to draw objects.
 */
export class DrawableBeatmap {
    static readonly width = window.screen.width;
    static readonly height = window.screen.height;

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
        const comboColors = this.beatmap.colors.combo;

        if (comboColors.length > 0) {
            return comboColors;
        } else {
            return DrawableBeatmap.defaultComboColors;
        }
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
     */
    static convertHitObjectToDrawable(object: HitObject): DrawableHitObject {
        if (object instanceof Slider) {
            return new DrawableSlider(object);
        } else if (object instanceof Spinner) {
            return new DrawableSpinner(object);
        } else {
            return new DrawableCircle(object);
        }
    }

    constructor(beatmap: Beatmap) {
        this.beatmap = beatmap;

        if (this.beatmap.hitObjects.objects.length === 0) {
            throw new Error("This beatmap does not have any hitobjects.");
        }

        this.approachTime = MapStats.arToMS(this.beatmap.difficulty.ar!);
        this.convertHitObjects();
    }

    update(ctx: CanvasRenderingContext2D): void {
        ctx.shadowColor = "#666";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        try {
            // this code will fail in Firefox(<~ 44)
            // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
            ctx.font = `${this.beatmap.hitObjects.objects[0].getRadius(
                Modes.droid
            )}px "Comic Sans MS", cursive, sans-serif`;
        } catch (e) {
            // Ignore error
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.translate(
            (DrawableBeatmap.width - Playfield.baseSize.x) / 2,
            (DrawableBeatmap.height - Playfield.baseSize.y) / 2
        );
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
        manager: SpectatorDataManager
    ): void {
        time = this.beatmap.getOffsetTime(time);

        while (this.objectDrawIndexes.first < this.drawableHitObjects.length) {
            const object =
                this.drawableHitObjects[this.objectDrawIndexes.first];
            let timeThreshold =
                object.object.endTime +
                DrawableHitObject.hitResultFadeOutStartTime +
                DrawableHitObject.hitResultFadeOutTime;

            if (object.object instanceof Circle) {
                const objectData = manager.events.objectData.eventAt(
                    this.objectDrawIndexes.first
                );

                if (objectData) {
                    if (
                        objectData.result !== HitResult.miss ||
                        objectData.accuracy !== 1e4
                    ) {
                        timeThreshold += objectData.accuracy;
                    } else {
                        timeThreshold += manager.maxHitWindow;
                    }
                }
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
            const hitData = manager.events.objectData.eventAt(i);
            let timeThreshold =
                object.object.endTime +
                DrawableHitObject.hitResultFadeOutStartTime +
                DrawableHitObject.hitResultFadeOutTime;

            if (object.object instanceof Circle && hitData) {
                if (
                    hitData.result !== HitResult.miss ||
                    hitData.accuracy !== 1e4
                ) {
                    timeThreshold += hitData.accuracy;
                } else {
                    timeThreshold += manager.maxHitWindow;
                }
            }

            if (time > timeThreshold) {
                break;
            }

            object.draw(ctx, time, hitData, manager.maxHitWindow);
        }
    }

    /**
     * Converts hitobjects to drawable hitobjects.
     */
    private convertHitObjects(): void {
        let combo = 1;
        let comboIndex = -1;
        let setComboIndex = true;

        for (const object of this.beatmap.hitObjects.objects) {
            const drawableObject =
                DrawableBeatmap.convertHitObjectToDrawable(object);

            // Set combo and color.
            if (drawableObject.object instanceof Spinner) {
                setComboIndex = true;
            } else if (drawableObject.object.isNewCombo || setComboIndex) {
                combo = 1;
                comboIndex =
                    (comboIndex + 1 + drawableObject.object.comboOffset) %
                    this.comboColors.length;
                setComboIndex = false;
            }

            drawableObject.approachTime = this.approachTime;
            drawableObject.combo = combo++;
            drawableObject.color = this.comboColors[comboIndex];

            this.drawableHitObjects.push(drawableObject);
        }
    }
}
