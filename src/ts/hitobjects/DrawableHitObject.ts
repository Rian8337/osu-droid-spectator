import { HitObject, MapStats, Modes, RGBColor } from "../osu-base";

/**
 * Represents a hitobject that can be drawn.
 */
export abstract class DrawableHitObject {
    /**
     * The underlying object.
     */
    readonly object: HitObject;

    /**
     * The duration at which the object fades in.
     */
    readonly fadeInTime: number = 400;

    /**
     * The duration at which the object fades out.
     */
    readonly fadeOutTime: number = 200;

    /**
     * The combo of the object.
     */
    combo = 1;

    /**
     * The color of the object.
     */
    color = new RGBColor(0, 202, 0);

    /**
     * The approach time of the object.
     */
    approachTime = MapStats.arToMS(5);

    /**
     * The thickness of the object's border.
     */
    protected get circleBorder(): number {
        return this.object.getRadius(Modes.droid) / 8;
    }

    /**
     * The shadow blur of the object.
     */
    protected get shadowBlur(): number {
        return this.object.getRadius(Modes.droid) / 16;
    }

    /**
     * The combo color in Canvas string format.
     */
    protected get canvasColor(): string {
        return `rgb(${this.color})`;
    }

    constructor(object: HitObject) {
        this.object = object;
    }

    /**
     * Draws this hitobject at a given time.
     *
     * @param ctx The canvas context.
     * @param time The time.
     */
    abstract draw(ctx: CanvasRenderingContext2D, time: number): void;
}
