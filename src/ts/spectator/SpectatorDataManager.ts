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
    readonly mods: (Mod & IModApplicableToDroid)[];

    /**
     * Managers for spectator events of this player.
     */
    readonly events: SpectatorEventManagers;

    /**
     * The maximum hit window of this player.
     */
    readonly maxHitWindow: number;

    /**
     * The score multiplier of this player.
     */
    readonly scoreMultiplier: number;

    /**
     * The duration at which the preview can use this manager to play.
     *
     * This is used to sync multiple players in the preview.
     */
    latestDataTime = 0;

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
        this.mods = mods;
        this.events = {
            accuracy: new SpectatorEventManager(),
            combo: new SpectatorEventManager(),
            cursor: [],
            objectData: new SpectatorObjectDataEventManager(),
            score: new SpectatorEventManager(),
        };

        this.maxHitWindow = new DroidHitWindow(
            new MapStats({
                od: beatmap.difficulty.od,
                mods: mods.filter(
                    (v) =>
                        !ModUtil.speedChangingMods.find(
                            (m) => m.acronym === v.acronym
                        )
                ),
            }).calculate({ mode: Modes.droid }).od!
        ).hitWindowFor50(mods.some((m) => m instanceof ModPrecise));

        this.scoreMultiplier = mods.reduce(
            (a, m) => a * m.droidScoreMultiplier,
            1
        );

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
}
