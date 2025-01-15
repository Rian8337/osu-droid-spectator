import { Vector2 } from "@rian8337/osu-base";
import { DrawableBeatmap } from "./drawables/DrawableBeatmap";
import { DrawableComboCounter } from "./drawables/counters/DrawableComboCounter";
import { DrawableCursor } from "./drawables/DrawableCursor";
import { SpectatorDataManager } from "./spectator/managers/SpectatorDataManager";
import { DrawableScoreCounter } from "./drawables/counters/DrawableScoreCounter";
import { DrawableAccuracyCounter } from "./drawables/counters/DrawableAccuracyCounter";
import { DrawablePlayerInfo } from "./drawables/DrawablePlayerInfo";
import { parsedBeatmap } from "./settings/BeatmapSettings";
import { teamMode } from "./settings/RoomSettings";
import { MultiplayerTeamMode } from "./spectator/structures/MultiplayerTeamMode";
import { DrawableHitErrorBar } from "./drawables/DrawableHitErrorBar";
import { DrawableClickCounter } from "./drawables/counters/DrawableClickCounter";
import { DrawableResultScreen } from "./drawables/DrawableResultScreen";

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
     * The click counter responsible for this preview.
     */
    clickCounter?: DrawableClickCounter;

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
     * The hit error bar responsible for this preview.
     */
    hitErrorBar?: DrawableHitErrorBar;

    /**
     * The result screen responsible for this preview.
     */
    resultScreen?: DrawableResultScreen;

    /**
     * The uid of the player in this preview.
     */
    readonly uid: number;

    /**
     * The canvas element of this preview.
     */
    readonly screen: HTMLCanvasElement;

    private readonly positionScale: Vector2;
    private readonly sizeScale: Vector2;

    /**
     * The canvas context of the screen.
     */
    private get ctx(): CanvasRenderingContext2D {
        return this.screen.getContext("2d")!;
    }

    /**
     * The height padding with respect to team mode.
     */
    static get heightPadding(): number {
        // Reserve 10% of the screen for information display - 20% for team mode.
        return (
            innerHeight * (teamMode === MultiplayerTeamMode.teamVS ? 0.2 : 0.1)
        );
    }

    constructor(uid: number, positionScale: Vector2, sizeScale: Vector2) {
        this.uid = uid;
        this.positionScale = positionScale;
        this.sizeScale = sizeScale;

        this.screen = document.createElement("canvas");
        this.screen.id = `preview${uid.toString()}`;

        this.applyCanvasPosition();
        this.attachToContainer();
    }

    /**
     * Attaches the screen to the container.
     */
    attachToContainer(): void {
        this.detachFromContainer();

        $("#container")[0].appendChild(this.screen);
    }

    /**
     * Detaches this preview from the container.
     */
    detachFromContainer(): void {
        $(this.screen).remove();
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
            this.sizeScale,
            specDataManager.forceCS,
            specDataManager.forceAR,
        );

        this.specDataManager = specDataManager;
        this.playerInfo = new DrawablePlayerInfo(
            specDataManager.uid,
            specDataManager.username,
            this.sizeScale,
        );

        this.drawableCursors.length = 0;

        for (const manager of specDataManager.events.cursors) {
            this.drawableCursors.push(
                new DrawableCursor(
                    manager,
                    this.sizeScale,
                    specDataManager.mods,
                ),
            );
        }

        this.clickCounter = new DrawableClickCounter(
            specDataManager.events.cursors,
            specDataManager.events.clicks,
            this.sizeScale,
        );
        this.accuracyCounter = new DrawableAccuracyCounter(
            specDataManager.events.accuracy,
            this.sizeScale,
        );
        this.comboCounter = new DrawableComboCounter(
            specDataManager.events.combo,
            this.sizeScale,
        );
        this.scoreCounter = new DrawableScoreCounter(
            specDataManager.events.score,
            this.sizeScale,
        );
        this.hitErrorBar = new DrawableHitErrorBar(
            specDataManager.events.objectData,
            specDataManager.hitWindow,
        );
        this.resultScreen = new DrawableResultScreen(specDataManager.uid);

        this.at(0);
    }

    /**
     * Draws the preview at a given time.
     *
     * @param time The time.
     */
    at(time: number) {
        if (!this.beatmap || !this.specDataManager) {
            // The beatmap may not be loaded yet. In that case, do nothing.
            return;
        }

        this.applyCanvasPosition();
        this.ctx.clearRect(0, 0, this.screen.width, this.screen.height);

        if (!Number.isFinite(time)) {
            this.resultScreen?.draw(this.ctx);

            return;
        }

        this.clickCounter?.draw(this.ctx, time);
        this.accuracyCounter?.draw(this.ctx, time);
        this.comboCounter?.draw(this.ctx, time);
        this.scoreCounter?.draw(this.ctx, time);
        this.hitErrorBar?.draw(this.ctx, time);
        this.beatmap.draw(this.ctx, time, this.specDataManager);

        for (const drawableCursor of this.drawableCursors) {
            drawableCursor.draw(this.ctx, time);
        }

        this.playerInfo?.draw(this.ctx, time);
    }

    /**
     * Applies the canvas position with respect to the window size.
     */
    private applyCanvasPosition(): void {
        const height = innerHeight - Preview.heightPadding;

        this.screen.width = this.sizeScale.x * innerWidth;
        this.screen.height = this.sizeScale.y * height;

        this.screen.style.position = "absolute";
        this.screen.style.left = `${(this.positionScale.x * innerWidth).toString()}px`;
        this.screen.style.top = `${(this.positionScale.y * height).toString()}px`;
    }
}
