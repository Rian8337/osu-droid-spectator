import { DrawableBeatmap } from "./drawables/DrawableBeatmap";
import { DrawableComboCounter } from "./drawables/counters/DrawableComboCounter";
import { DrawableCursor } from "./drawables/DrawableCursor";
import { SpectatorDataManager } from "./spectator/managers/SpectatorDataManager";
import { DrawableScoreCounter } from "./drawables/counters/DrawableScoreCounter";
import { DrawableAccuracyCounter } from "./drawables/counters/DrawableAccuracyCounter";
import { DrawablePlayerInfo } from "./drawables/DrawablePlayerInfo";
import { ModPrecise, Vector2 } from "./osu-base";
import { parsedBeatmap } from "./settings/BeatmapSettings";
import { teamMode } from "./settings/RoomSettings";
import { MultiplayerTeamMode } from "./spectator/structures/MultiplayerTeamMode";
import { DrawableHitErrorBar } from "./drawables/DrawableHitErrorBar";

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
     * The hit error bar responsible for this preview.
     */
    hitErrorBar?: DrawableHitErrorBar;

    /**
     * The uid of the player in this preview.
     */
    readonly uid: number;

    /**
     * The canvas element of this preview.
     */
    readonly screen: HTMLCanvasElement;

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
        return teamMode === MultiplayerTeamMode.teamVS ? 50 : 0;
    }

    constructor(
        uid: number,
        zeroCoordinate: Vector2,
        scaleX: number,
        scaleY: number,
    ) {
        this.uid = uid;

        this.screen = document.createElement("canvas");
        this.screen.id = `preview${zeroCoordinate}`;
        this.screen.width = innerWidth;
        this.screen.height = innerHeight - Preview.heightPadding;
        this.screen.style.left = `${zeroCoordinate.x}px`;
        this.screen.style.top = `${zeroCoordinate.y}px`;

        this.ctx.scale(scaleX, scaleY);
        this.screen.style.position = "absolute";

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
            specDataManager.forcedAR,
        );
        this.specDataManager = specDataManager;
        this.playerInfo = new DrawablePlayerInfo(
            specDataManager.uid,
            specDataManager.username,
        );
        this.ctx.restore();
        this.ctx.save();

        this.drawableCursors.length = 0;

        for (const manager of specDataManager.events.cursor) {
            this.drawableCursors.push(
                new DrawableCursor(manager, specDataManager.mods),
            );
        }

        this.accuracyCounter = new DrawableAccuracyCounter(
            specDataManager.events.accuracy,
            specDataManager.events.syncedAccuracy,
        );
        this.comboCounter = new DrawableComboCounter(
            specDataManager.events.combo,
            specDataManager.events.syncedCombo,
        );
        this.scoreCounter = new DrawableScoreCounter(
            specDataManager.events.score,
            specDataManager.events.syncedScore,
            specDataManager.uid,
        );
        this.hitErrorBar = new DrawableHitErrorBar(
            specDataManager.events.objectData,
            specDataManager.hitWindow,
            specDataManager.mods.some((m) => m instanceof ModPrecise),
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

        this.beatmap.update(this.ctx);
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, innerWidth, innerHeight);
        this.ctx.restore();
        this.playerInfo?.draw(this.ctx, time);
        this.accuracyCounter?.draw(this.ctx, time);
        this.comboCounter?.draw(this.ctx, time);
        this.scoreCounter?.draw(this.ctx, time);
        this.hitErrorBar?.draw(this.ctx, time);
        this.beatmap.draw(this.ctx, time, this.specDataManager);

        for (const drawableCursor of this.drawableCursors) {
            drawableCursor.draw(this.ctx, time);
        }
    }
}
