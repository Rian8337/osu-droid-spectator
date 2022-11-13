import { DrawableBeatmap } from "./drawables/DrawableBeatmap";
import { DrawableComboCounter } from "./drawables/counters/DrawableComboCounter";
import { DrawableCursor } from "./drawables/DrawableCursor";
import { SpectatorDataManager } from "./spectator/SpectatorDataManager";
import { DrawableScoreCounter } from "./drawables/counters/DrawableScoreCounter";
import { DrawableAccuracyCounter } from "./drawables/counters/DrawableAccuracyCounter";
import { DrawablePlayerInfo } from "./drawables/DrawablePlayerInfo";
import { PreviewAnchor } from "./PreviewAnchor";
import { Anchor, Beatmap } from "./osu-base";

/**
 * Represents a beatmap preview.
 */
export class Preview {
    /**
     * The beatmap being previewed.
     */
    beatmap!: DrawableBeatmap;

    /**
     * The player information being displayed.
     */
    playerInfo!: DrawablePlayerInfo;

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

    private readonly container: HTMLElement;
    private readonly screen: HTMLCanvasElement;
    private get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    constructor(dest: HTMLElement, anchor: PreviewAnchor) {
        this.container = dest;

        this.screen = document.createElement("canvas");
        this.applyCanvasPosition(this.screen, anchor);
        this.container.appendChild(this.screen);
    }

    /**
     * Loads this preview and prepares the beatmap.
     *
     * @param beatmap The beatmap to load.
     * @param specDataManager The spectator data processor of this preview.
     * @param onSuccess The function to be called when the operation succeeds.
     * @param onFail The function to be called when the operation fails.
     */
    load(
        beatmap: Beatmap,
        specDataManager: SpectatorDataManager,
        onSuccess?: (preview: Preview) => unknown,
        onFail?: (preview: Preview, e: Error) => unknown
    ): void {
        try {
            this.beatmap = new DrawableBeatmap(beatmap, specDataManager.mods);
            this.specDataManager = specDataManager;
            this.playerInfo = new DrawablePlayerInfo(
                specDataManager.uid,
                specDataManager.username,
                specDataManager.mods
            );
            this.ctx.restore();
            this.ctx.save();

            this.drawableCursors.length = 0;

            for (const manager of specDataManager.events.cursor) {
                this.drawableCursors.push(
                    new DrawableCursor(manager, specDataManager.mods)
                );
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
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.restore();
        this.beatmap.draw(this.ctx, time, this.specDataManager);
        this.playerInfo.draw(this.ctx);
        this.accuracyCounter.draw(this.ctx, time);
        this.comboCounter.draw(this.ctx, time);
        this.scoreCounter.draw(this.ctx, time);

        for (const drawableCursor of this.drawableCursors) {
            drawableCursor.draw(this.ctx, time);
        }
    }

    private applyCanvasPosition(
        canvas: HTMLCanvasElement,
        anchor: PreviewAnchor
    ): void {
        canvas.width = window.innerWidth / 2;
        canvas.height = window.innerHeight / 2;

        const ctx = canvas.getContext("2d")!;
        ctx.scale(0.5, 0.5);

        if (anchor === Anchor.topLeft) {
            return;
        }

        canvas.style.position = "absolute";

        switch (anchor) {
            case Anchor.topCenter:
                canvas.style.left = `${window.innerWidth / 2}px`;
                canvas.style.top = "0px";
                break;
            case Anchor.centerLeft:
                canvas.style.left = "0px";
                canvas.style.top = `${window.innerHeight / 2}px`;
                break;
            case Anchor.center:
                canvas.style.left = `${window.innerWidth / 2}px`;
                canvas.style.top = `${window.innerHeight / 2}px`;
                break;
        }
    }
}
