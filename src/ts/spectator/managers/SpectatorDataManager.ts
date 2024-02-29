import {
    DroidHitWindow,
    IModApplicableToDroid,
    Mod,
    ModDifficultyAdjust,
    ModPrecise,
    ModUtil,
    calculateDroidDifficultyStatistics,
} from "@rian8337/osu-base";
import { parsedBeatmap } from "../../settings/BeatmapSettings";
import { MultiplayerPlayer } from "../structures/MultiplayerPlayer";
import { SpectatorAccuracyEventManager } from "./SpectatorAccuracyEventManager";
import { SpectatorClickEventManager } from "./SpectatorClickEventManager";
import { SpectatorComboEventManager } from "./SpectatorComboEventManager";
import { SpectatorCursorEventManager } from "./SpectatorCursorEventManager";
import { SpectatorEventManagers } from "./SpectatorEventManagers";
import { SpectatorObjectDataEventManager } from "./SpectatorObjectDataEventManager";
import { SpectatorScoreEventManager } from "./SpectatorScoreEventManager";
import { SpectatorSyncedAccuracyEventManager } from "./SpectatorSyncedAccuracyEventManager";
import { SpectatorSyncedComboEventManager } from "./SpectatorSyncedComboEventManager";
import { SpectatorSyncedScoreEventManager } from "./SpectatorSyncedScoreEventManager";

/**
 * Represents a manager for spectator data of a player.
 */
export class SpectatorDataManager {
    /**
     * The uid of this player.
     */
    readonly uid: number;

    /**
     * The username of this player.
     */
    readonly username: string;

    /**
     * The mods this player uses to play.
     */
    readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * The force CS this player uses to play.
     */
    readonly forceCS?: number;

    /**
     * The force AR this player uses to play.
     */
    readonly forceAR?: number;

    /**
     * The force OD this player uses to play.
     */
    readonly forceOD?: number;

    /**
     * Managers for spectator events of this player.
     */
    readonly events: SpectatorEventManagers;

    /**
     * The hit window of this player.
     */
    readonly hitWindow: DroidHitWindow;

    /**
     * The duration at which the preview can use this manager to play.
     *
     * This is used to sync multiple players in the preview.
     */
    latestDataTime = -1;

    /**
     * The maximum hit window of this player.
     */
    get maxHitWindow(): number {
        return this.hitWindow.hitWindowFor50(
            this.mods.some((m) => m instanceof ModPrecise),
        );
    }

    /**
     * Whether the presence of data in this manager should be ignored.
     *
     * When this is `true`, audio playback should be continued regardless of data availability.
     */
    get ignoreDataPresence(): boolean {
        return !Number.isFinite(this.latestDataTime);
    }

    /**
     * The time at which the earliest event occurs for this player.
     *
     * Returns `null` if there are no events yet.
     */
    get earliestEventTime(): number | null {
        let earliestEventTime = Math.min(
            this.events.accuracy.earliestEventTime ?? Number.POSITIVE_INFINITY,
            this.events.combo.earliestEventTime ?? Number.POSITIVE_INFINITY,
            this.events.score.earliestEventTime ?? Number.POSITIVE_INFINITY,
            this.events.objectData.earliestEventTime ??
                Number.POSITIVE_INFINITY,
        );

        if (earliestEventTime === Number.POSITIVE_INFINITY) {
            for (const eventManager of this.events.cursors) {
                earliestEventTime = Math.min(
                    earliestEventTime,
                    eventManager.earliestEventTime ?? Number.POSITIVE_INFINITY,
                );
            }
        }

        return Number.isFinite(earliestEventTime) ? earliestEventTime : null;
    }

    /**
     * The time at which the latest event occurs for this player.
     */
    get latestEventTime(): number | null {
        let latestEventTime = Math.min(
            this.events.accuracy.latestEventTime ?? Number.POSITIVE_INFINITY,
            this.events.combo.latestEventTime ?? Number.POSITIVE_INFINITY,
            this.events.score.latestEventTime ?? Number.POSITIVE_INFINITY,
            this.events.objectData.latestEventTime ?? Number.POSITIVE_INFINITY,
        );

        if (latestEventTime === Number.POSITIVE_INFINITY) {
            for (const eventManager of this.events.cursors) {
                latestEventTime = Math.min(
                    latestEventTime,
                    eventManager.latestEventTime ?? Number.POSITIVE_INFINITY,
                );
            }
        }

        return Number.isFinite(latestEventTime) ? latestEventTime : null;
    }

    constructor(player: MultiplayerPlayer) {
        this.uid = player.uid;
        this.username = player.username;
        this.forceCS = player.mods.customCS;
        this.forceAR = player.mods.customAR;
        this.forceOD = player.mods.customOD;

        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been parsed yet");
        }

        this.events = {
            accuracy: new SpectatorAccuracyEventManager(),
            combo: new SpectatorComboEventManager(),
            clicks: [],
            cursors: [],
            objectData: new SpectatorObjectDataEventManager(),
            score: new SpectatorScoreEventManager(),
            syncedAccuracy: new SpectatorSyncedAccuracyEventManager(),
            syncedCombo: new SpectatorSyncedComboEventManager(),
            syncedScore: new SpectatorSyncedScoreEventManager(),
        };

        for (let i = 0; i < 10; ++i) {
            this.events.clicks.push(new SpectatorClickEventManager());
            this.events.cursors.push(new SpectatorCursorEventManager());
        }

        this.mods = ModUtil.droidStringToMods(player.mods.mods ?? "");

        const localMods = ModUtil.removeSpeedChangingMods(this.mods);

        if (
            [this.forceCS, this.forceAR, this.forceOD].some(
                (v) => v !== undefined,
            )
        ) {
            localMods.push(
                new ModDifficultyAdjust({
                    cs: this.forceCS,
                    ar: this.forceAR,
                    od: this.forceOD,
                }),
            );
        }

        this.hitWindow = new DroidHitWindow(
            calculateDroidDifficultyStatistics({
                overallDifficulty: parsedBeatmap.difficulty.od,
                mods: localMods,
                convertOverallDifficulty: false,
            }).overallDifficulty,
        );
    }

    /**
     * Determines whether spectator data is available for this player at the given time.
     *
     * @param time The time.
     * @returns Whether spectator data is available for this player at the given time.
     */
    isAvailableAt(time: number): boolean {
        return time <= this.latestDataTime;
    }
}
