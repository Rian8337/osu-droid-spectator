import { DrawableBeatmap } from "./drawables/DrawableBeatmap";
import { DrawableComboCounter } from "./drawables/counters/DrawableComboCounter";
import { DrawableCursor } from "./drawables/DrawableCursor";
import { SpectatorDataManager } from "./spectator/SpectatorDataManager";
import { DrawableScoreCounter } from "./drawables/counters/DrawableScoreCounter";
import { DrawableAccuracyCounter } from "./drawables/counters/DrawableAccuracyCounter";

/**
 * Represents a beatmap preview.
 */
export class Preview {
    /**
     * The beatmap being previewed.
     */
    beatmap!: DrawableBeatmap;

    /**
     * The spectator data manager responsible for this preview.
     */
    specDataManager!: SpectatorDataManager;

    /**
     * The drawable cursors responsible for this preview.
     */
    drawableCursors: DrawableCursor[] = [];

    /**
     * The accuracy counter responsible for this preview.
     */
    accuracyCounter!: DrawableAccuracyCounter;

    /**
     * The combo counter responsible for this preview.
     */
    comboCounter!: DrawableComboCounter;

    /**
     * The score counter responsible for this preview.
     */
    scoreCounter!: DrawableScoreCounter;

    /**
     * The date at which this preview was last loaded.
     */
    loadedAt: Date = new Date();

    private readonly container: HTMLElement;
    private readonly screen: HTMLCanvasElement;
    private readonly background: HTMLImageElement;
    private get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    constructor(dest: HTMLElement) {
        this.container = dest;

        this.screen = document.createElement("canvas");
        this.screen.width = DrawableBeatmap.width;
        this.screen.height = DrawableBeatmap.height;
        this.container.appendChild(this.screen);

        this.background = new Image();
        this.background.setAttribute("crossOrigin", "anonymous");

        this.background.addEventListener("load", () => {
            const canvas = document.createElement("canvas");
            canvas.id = "bgcanvas";
            canvas.width = this.screen.width;
            canvas.height = this.screen.height;
            const ctx = canvas.getContext("2d")!;

            // background-size: cover height
            const sWidth =
                this.background.height *
                (this.screen.width / this.screen.height);
            ctx.drawImage(
                this.background,
                (this.background.width - sWidth) / 2,
                0,
                sWidth,
                this.background.height,
                0,
                0,
                this.screen.width,
                this.screen.height
            );

            // background dim
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(0, 0, this.screen.width, this.screen.height);

            this.container.style.backgroundImage = `url(${canvas.toDataURL()})`;
        });

        this.background.addEventListener("error", () => {
            this.container.style.backgroundImage = "none";
        });
    }

    /**
     * Loads this preview and prepares the beatmap.
     *
     * @param backgroundBlob The background blob.
     * @param beatmap The beatmap to load.
     * @param specDataManager The spectator data processor of this preview.
     * @param onSuccess The function to be called when the operation succeeds.
     * @param onFail The function to be called when the operation fails.
     */
    load(
        backgroundBlob: string,
        beatmap: DrawableBeatmap,
        specDataManager: SpectatorDataManager,
        onSuccess?: (preview: Preview) => unknown,
        onFail?: (preview: Preview, e: Error) => unknown
    ): void {
        try {
            this.loadedAt = new Date();
            this.beatmap = beatmap;
            this.specDataManager = specDataManager;
            this.background.src = backgroundBlob;
            this.ctx.restore();
            this.ctx.save();

            this.drawableCursors.length = 0;

            for (const manager of specDataManager.events.cursor) {
                this.drawableCursors.push(new DrawableCursor(manager));
            }

            this.accuracyCounter = new DrawableAccuracyCounter(
                specDataManager.events.accuracy
            );
            this.comboCounter = new DrawableComboCounter(
                specDataManager.events.combo
            );
            this.scoreCounter = new DrawableScoreCounter(
                specDataManager.events.score
            );

            this.beatmap.update(this.ctx);
            this.at(0);

            if (onSuccess) {
                onSuccess(this);
            }
        } catch (e) {
            if (onFail) {
                onFail(this, <Error>e);
            }
        }
    }

    /**
     * Draws the preview at a given time.
     *
     * @param time The time.
     */
    at(time: number): void {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, DrawableBeatmap.width, DrawableBeatmap.height);
        this.ctx.restore();
        this.beatmap.draw(this.ctx, time, this.specDataManager);
        this.accuracyCounter.draw(this.ctx, time);
        this.comboCounter.draw(this.ctx, time);
        this.scoreCounter.draw(this.ctx, time);

        for (const drawableCursor of this.drawableCursors) {
            drawableCursor.draw(this.ctx, time);
        }
    }
}
