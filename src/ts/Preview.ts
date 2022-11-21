import { DrawableBeatmap } from "./drawables/DrawableBeatmap";
import { DrawableComboCounter } from "./drawables/counters/DrawableComboCounter";
import { DrawableCursor } from "./drawables/DrawableCursor";
import { SpectatorDataManager } from "./spectator/managers/SpectatorDataManager";
import { DrawableScoreCounter } from "./drawables/counters/DrawableScoreCounter";
import { DrawableAccuracyCounter } from "./drawables/counters/DrawableAccuracyCounter";
import { DrawablePlayerInfo } from "./drawables/DrawablePlayerInfo";
import { Anchor } from "./osu-base";
import { parsedBeatmap } from "./settings/BeatmapSettings";
import { PreviewAnchor } from "./settings/PreviewSettings";
import { teamMode } from "./settings/RoomSettings";
import { MultiplayerTeamMode } from "./spectator/structures/MultiplayerTeamMode";

/**
 * Represents a beatmap preview.
 */
export class Preview {
    /**
     * The beatmap being previewed.
     */
    beatmap?: DrawableBeatmap;

    /**
     * The player information being displayed.
     */
    playerInfo?: DrawablePlayerInfo;

    /**
     * The spectator data manager responsible for this preview.
     */
    specDataManager?: SpectatorDataManager;

    /**
     * The drawable cursors responsible for this preview.
     */
    drawableCursors: DrawableCursor[] = [];

    /**
     * The accuracy counter responsible for this preview.
     */
    accuracyCounter?: DrawableAccuracyCounter;

    /**
     * The combo counter responsible for this preview.
     */
    comboCounter?: DrawableComboCounter;

    /**
     * The score counter responsible for this preview.
     */
    scoreCounter?: DrawableScoreCounter;

    /**
     * The uid of the player in this preview.
     */
    readonly uid: number;

    /**
     * The canvas element of this preview.
     */
    readonly screen: HTMLCanvasElement;

    /**
     * The anchor of this preview.
     */
    readonly anchor: PreviewAnchor;

    /**
     * The canvas context of the screen.
     */
    get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    /**
     * The height padding with respect to team mode.
     */
    static get heightPadding(): number {
        return teamMode === MultiplayerTeamMode.teamVS ? 40 : 0;
    }

    constructor(uid: number, anchor: PreviewAnchor) {
        this.uid = uid;
        this.screen = document.createElement("canvas");
        this.anchor = anchor;

        this.screen.id = `preview${this.anchor}`;
        this.applyCanvasPosition();
        this.attachToContainer();
    }

    /**
     * Attaches the screen to the container.
     */
    attachToContainer(): void {
        this.delete();

        $("#container")[0].appendChild(this.screen);
    }

    /**
     * Loads this preview and prepares the beatmap.
     *
     * @param specDataManager The spectator data processor of this preview.
     */
    load(specDataManager: SpectatorDataManager): void {
        if (!parsedBeatmap) {
            // Beatmap may not have loaded yet. In that case, simply return.
            return;
        }

        this.beatmap = new DrawableBeatmap(
            parsedBeatmap,
            specDataManager.mods,
            specDataManager.forcedAR
        );
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
            specDataManager.events.accuracy,
            specDataManager.events.syncedAccuracy
        );
        this.comboCounter = new DrawableComboCounter(
            specDataManager.events.combo,
            specDataManager.events.syncedCombo
        );
        this.scoreCounter = new DrawableScoreCounter(
            specDataManager.events.score,
            specDataManager.events.syncedScore
        );

        this.beatmap.update(this.ctx);
        this.at(0);
    }

    /**
     * Draws the preview at a given time.
     *
     * @param time The time.
     */
    at(time: number): void {
        if (!this.beatmap || !this.specDataManager) {
            // The beatmap may not be loaded yet. In that case, do nothing.
            return;
        }

        // TODO: hit error bar and ready state
        this.applyCanvasPosition();
        this.beatmap?.update(this.ctx);
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx.restore();
        this.beatmap.draw(this.ctx, time, this.specDataManager);
        this.playerInfo?.draw(this.ctx);
        this.accuracyCounter?.draw(this.ctx, time);
        this.comboCounter?.draw(this.ctx, time);
        this.scoreCounter?.draw(this.ctx, time);

        for (const drawableCursor of this.drawableCursors) {
            drawableCursor.draw(this.ctx, time);
        }
    }

    /**
     * Deletes this preview from the container.
     */
    delete(): void {
        $(this.screen).remove();
    }

    /**
     * Applies the canvas position with respect to the window size.
     */
    private applyCanvasPosition(): void {
        this.screen.width = window.innerWidth / 2;
        this.screen.height = window.innerHeight / 2 - Preview.heightPadding;

        this.ctx.scale(0.5, 0.5);
        this.screen.style.position = "absolute";

        switch (this.anchor) {
            case Anchor.topLeft:
                this.screen.style.left = "0px";
                this.screen.style.top = "0px";
                break;
            case Anchor.topCenter:
                this.screen.style.left = `${window.innerWidth / 2}px`;
                this.screen.style.top = "0px";
                break;
            case Anchor.centerLeft:
                this.screen.style.left = "0px";
                this.screen.style.top = `${
                    window.innerHeight / 2 + Preview.heightPadding
                }px`;
                break;
            case Anchor.center:
                this.screen.style.left = `${window.innerWidth / 2}px`;
                this.screen.style.top = `${
                    window.innerHeight / 2 + Preview.heightPadding
                }px`;
                break;
        }
    }
}
