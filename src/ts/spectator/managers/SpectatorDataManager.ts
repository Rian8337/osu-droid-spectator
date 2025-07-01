import {
    BeatmapDifficulty,
    DroidHitWindow,
    HitWindow,
    ModMap,
    ModPrecise,
    ModUtil,
    Modes,
    PreciseDroidHitWindow,
} from "@rian8337/osu-base";
import { parsedBeatmap } from "../../settings/BeatmapSettings";
import { MultiplayerScore } from "../rawdata/MultiplayerScore";
import { MultiplayerPlayer } from "../structures/MultiplayerPlayer";
import { SpectatorAccuracyEventManager } from "./SpectatorAccuracyEventManager";
import { SpectatorClickEventManager } from "./SpectatorClickEventManager";
import { SpectatorComboEventManager } from "./SpectatorComboEventManager";
import { SpectatorCursorEventManager } from "./SpectatorCursorEventManager";
import { SpectatorEventManagers } from "./SpectatorEventManagers";
import { SpectatorObjectDataEventManager } from "./SpectatorObjectDataEventManager";
import { SpectatorScoreEventManager } from "./SpectatorScoreEventManager";

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
    readonly mods: ModMap;

    /**
     * Managers for spectator events of this player.
     */
    readonly events: SpectatorEventManagers;

    /**
     * The hit window of this player.
     */
    readonly hitWindow: HitWindow;

    /**
     * The duration at which the preview can use this manager to play.
     *
     * This is used to sync multiple players in the preview.
     */
    latestDataTime = -1;

    /**
     * The resulting score of this player.
     */
    result?: MultiplayerScore;

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
        };

        for (let i = 0; i < 10; ++i) {
            this.events.clicks.push(new SpectatorClickEventManager());
            this.events.cursors.push(new SpectatorCursorEventManager());
        }

        this.mods = ModUtil.deserializeMods(player.mods);

        const difficulty = new BeatmapDifficulty(parsedBeatmap.difficulty);

        ModUtil.applyModsToBeatmapDifficulty(
            difficulty,
            Modes.droid,
            this.mods,
        );

        if (this.mods.has(ModPrecise)) {
            this.hitWindow = new PreciseDroidHitWindow(difficulty.od);
        } else {
            this.hitWindow = new DroidHitWindow(difficulty.od);
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
}
