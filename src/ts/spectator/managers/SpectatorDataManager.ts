import {
    DroidHitWindow,
    IModApplicableToDroid,
    MapStats,
    Mod,
    ModPrecise,
    ModUtil,
} from "../../osu-base";
import { parsedBeatmap } from "../../settings/BeatmapSettings";
import { modMultipliers, speedMultiplier } from "../../settings/RoomSettings";
import { PlayerInfo } from "../rawdata/PlayerInfo";
import { SpectatorAccuracyEventManager } from "./SpectatorAccuracyEventManager";
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
     * The mods the player uses to play.
     */
    mods: (Mod & IModApplicableToDroid)[] = [];

    /**
     * The force AR value the player uses to play.
     */
    forcedAR?: number;

    /**
     * Managers for spectator events of this player.
     */
    readonly events: SpectatorEventManagers;

    /**
     * The hit window of this player.
     */
    hitWindow = new DroidHitWindow(5);

    /**
     * The score multiplier of this player.
     */
    scoreMultiplier = 1;

    /**
     * The duration at which the preview can use this manager to play.
     *
     * This is used to sync multiple players in the preview.
     */
    latestDataTime = -1;

    /**
     * Whether this player's score will be submitted to the server should they complete the beatmap.
     */
    willBeSubmitted = true;

    /**
     * The maximum hit window of this player.
     */
    get maxHitWindow(): number {
        return this.hitWindow.hitWindowFor50(
            this.mods.some((m) => m instanceof ModPrecise)
        );
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
            this.events.objectData.earliestEventTime ?? Number.POSITIVE_INFINITY
        );

        if (earliestEventTime === Number.POSITIVE_INFINITY) {
            for (const eventManager of this.events.cursor) {
                earliestEventTime = Math.min(
                    earliestEventTime,
                    eventManager.earliestEventTime ?? Number.POSITIVE_INFINITY
                );
            }
        }

        return Number.isFinite(earliestEventTime) ? earliestEventTime : null;
    }

    /**
     * The time at which the latest event occurs for this player.
     */
    get latestEventTime(): number | null {
        let latestEventTime = Math.max(
            this.events.accuracy.latestEventTime ?? Number.NEGATIVE_INFINITY,
            this.events.combo.latestEventTime ?? Number.NEGATIVE_INFINITY,
            this.events.score.latestEventTime ?? Number.NEGATIVE_INFINITY,
            this.events.objectData.latestEventTime ?? Number.NEGATIVE_INFINITY
        );

        if (latestEventTime === Number.NEGATIVE_INFINITY) {
            for (const eventManager of this.events.cursor) {
                latestEventTime = Math.max(
                    latestEventTime,
                    eventManager.latestEventTime ?? Number.NEGATIVE_INFINITY
                );
            }
        }

        return Number.isFinite(latestEventTime) ? latestEventTime : null;
    }

    constructor(playerInfo: PlayerInfo) {
        this.uid = playerInfo.uid;
        this.username = playerInfo.username;

        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been parsed yet");
        }

        this.events = {
            accuracy: new SpectatorAccuracyEventManager(),
            combo: new SpectatorComboEventManager(),
            cursor: [],
            objectData: new SpectatorObjectDataEventManager(
                parsedBeatmap.hitObjects.objects.length
            ),
            score: new SpectatorScoreEventManager(),
            syncedAccuracy: new SpectatorSyncedAccuracyEventManager(),
            syncedCombo: new SpectatorSyncedComboEventManager(),
            syncedScore: new SpectatorSyncedScoreEventManager(),
        };

        for (let i = 0; i < 10; ++i) {
            this.events.cursor.push(new SpectatorCursorEventManager());
        }
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

    /**
     * Resets the state of this manager.
     */
    reset(): void {
        this.events.accuracy.clear();
        this.events.combo.clear();
        this.events.objectData.clear();
        this.events.score.clear();

        for (const cursorEventManager of this.events.cursor) {
            cursorEventManager.clear();
        }

        this.latestDataTime = -1;
    }

    /**
     * Applies player-specific settings of the player.
     *
     * @param mods The mods used by the player.
     * @param forcedAR The forced AR used by the player.
     */
    applyPlayerSettings(
        mods: (Mod & IModApplicableToDroid)[],
        forcedAR?: number
    ): void {
        this.mods = mods;
        this.recalculateScoreMultiplier();

        if (parsedBeatmap) {
            this.hitWindow = new DroidHitWindow(
                new MapStats({
                    od: parsedBeatmap.difficulty.od,
                    mods: mods.filter(
                        (v) =>
                            !ModUtil.speedChangingMods.find(
                                (m) => m.acronym === v.acronym
                            )
                    ),
                }).calculate().od!
            );
        }

        this.forcedAR = forcedAR;
    }

    /**
     * Recalculates the score multiplier.
     */
    recalculateScoreMultiplier(): void {
        this.scoreMultiplier = this.mods.reduce(
            (a, m) => a * m.droidScoreMultiplier,
            1
        );

        for (const mod of this.mods) {
            if (!modMultipliers[mod.acronym]) {
                continue;
            }

            this.scoreMultiplier *= modMultipliers[mod.acronym];

            if (mod.droidScoreMultiplier > 0) {
                this.scoreMultiplier /= mod.droidScoreMultiplier;
            }
        }

        if (speedMultiplier >= 1) {
            this.scoreMultiplier *= 1 + (speedMultiplier - 1) * 0.24;
        } else {
            this.scoreMultiplier *= Math.pow(0.3, (1 - speedMultiplier) * 4);
        }
    }
}
