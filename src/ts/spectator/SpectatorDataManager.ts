import {
    Beatmap,
    DroidHitWindow,
    IModApplicableToDroid,
    MapStats,
    Mod,
    Modes,
    ModPrecise,
    ModUtil,
} from "../osu-base";
import settings from "../Settings";
import { PlayerInfo } from "./rawdata/PlayerInfo";
import { SpectatorEventManager } from "./SpectatorEventManager";
import { SpectatorEventManagers } from "./SpectatorEventManagers";
import { SpectatorObjectDataEventManager } from "./SpectatorObjectDataEventManager";

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
     * Managers for spectator events of this player.
     */
    readonly events: SpectatorEventManagers;

    /**
     * The maximum hit window of this player.
     */
    maxHitWindow = 0;

    /**
     * The score multiplier of this player.
     */
    scoreMultiplier = 1;

    /**
     * The duration at which the preview can use this manager to play.
     *
     * This is used to sync multiple players in the preview.
     */
    latestDataTime = 0;

    /**
     * Whether this player's score will be submitted to the server should they complete the beatmap.
     */
    willBeSubmitted = true;

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
                latestEventTime = Math.min(
                    latestEventTime,
                    eventManager.latestEventTime ?? Number.NEGATIVE_INFINITY
                );
            }
        }

        return Number.isFinite(latestEventTime) ? latestEventTime : null;
    }

    constructor(
        beatmap: Beatmap,
        playerInfo: PlayerInfo,
        mods: (Mod & IModApplicableToDroid)[]
    ) {
        this.uid = playerInfo.uid;
        this.username = playerInfo.username;
        this.events = {
            accuracy: new SpectatorEventManager(),
            combo: new SpectatorEventManager(),
            cursor: [],
            objectData: new SpectatorObjectDataEventManager(
                beatmap.hitObjects.objects.length
            ),
            score: new SpectatorEventManager(),
        };

        this.applyMods(mods);

        for (let i = 0; i < 10; ++i) {
            this.events.cursor.push(new SpectatorEventManager());
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
    }

    /**
     * Reapplies mods to this manager.
     *
     * @param mods The new mods to apply.
     */
    applyMods(mods: (Mod & IModApplicableToDroid)[]): void {
        this.mods = mods;
        this.recalculateScoreMultiplier();

        if (settings.parsedBeatmap) {
            this.maxHitWindow = new DroidHitWindow(
                new MapStats({
                    od: settings.parsedBeatmap.difficulty.od,
                    mods: mods.filter(
                        (v) =>
                            !ModUtil.speedChangingMods.find(
                                (m) => m.acronym === v.acronym
                            )
                    ),
                }).calculate({ mode: Modes.droid }).od!
            ).hitWindowFor50(mods.some((m) => m instanceof ModPrecise));
        }
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
            if (settings.modMultipliers[mod.acronym]) {
                this.scoreMultiplier *= settings.modMultipliers[mod.acronym];

                if (mod.droidScoreMultiplier > 0) {
                    this.scoreMultiplier /= mod.droidScoreMultiplier;
                }
            }
        }

        if (settings.speedMultiplier >= 1) {
            this.scoreMultiplier *= 1 + (settings.speedMultiplier - 1) * 0.24;
        } else {
            this.scoreMultiplier *= Math.pow(
                0.3,
                (1 - settings.speedMultiplier) * 4
            );
        }
    }
}
