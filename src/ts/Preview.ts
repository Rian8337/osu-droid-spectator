import { DrawableBeatmap } from "./DrawableBeatmap";
import { DrawableCursor } from "./DrawableCursor";
import { SpectatorDataManager } from "./spectator/SpectatorDataManager";

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
            this.beatmap = beatmap;
            this.specDataManager = specDataManager;
            this.background.src = backgroundBlob;
            this.ctx.restore();
            this.ctx.save();

            this.drawableCursors.length = 0;

            for (const manager of this.specDataManager.events.cursor) {
                this.drawableCursors.push(new DrawableCursor(manager));
            }

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

        for (const drawableCursor of this.drawableCursors) {
            drawableCursor.draw(this.ctx, time);
        }
    }
}
