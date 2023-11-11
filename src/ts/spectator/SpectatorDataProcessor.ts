import { audioState } from "../elements/Audio";
import { Vector2 } from "../osu-base";
import { parsedBeatmap } from "../settings/BeatmapSettings";
import { players } from "../settings/PlayerSettings";
import { SpectatorAccuracyEvent } from "./events/SpectatorAccuracyEvent";
import { SpectatorComboEvent } from "./events/SpectatorComboEvent";
import { SpectatorCursorEvent } from "./events/SpectatorCursorEvent";
import { SpectatorObjectDataEvent } from "./events/SpectatorObjectDataEvent";
import { SpectatorScoreEvent } from "./events/SpectatorScoreEvent";
import { MultiplayerPlayer } from "./structures/MultiplayerPlayer";
import { SpectatorData } from "./rawdata/SpectatorData";
import { SpectatorDataManager } from "./managers/SpectatorDataManager";
import { SpectatorSyncedScoreEvent } from "./events/SpectatorSyncedScoreEvent";
import { SpectatorSyncedAccuracyEvent } from "./events/SpectatorSyncedAccuracyEvent";
import { SpectatorSyncedComboEvent } from "./events/SpectatorSyncedComboEvent";

/**
 * A handler for holding and processing spectator data.
 */
export class SpectatorDataProcessor {
    /**
     * The managers of spectator data, mapped by players' uid.
     */
    readonly managers = new Map<number, SpectatorDataManager>();

    /**
     * The time at which the earliest event from players occurs, in milliseconds.
     *
     * Returns `null` if there are no events yet.
     */
    get earliestEventTime(): number | null {
        let earliestEventTime = Number.POSITIVE_INFINITY;

        for (const manager of this.managers.values()) {
            // Skip managers that want to have their data presence ignored.
            if (manager.ignoreDataPresence) {
                continue;
            }

            earliestEventTime = Math.min(
                earliestEventTime,
                manager.earliestEventTime ?? Number.POSITIVE_INFINITY,
            );
        }

        return Number.isFinite(earliestEventTime) ? earliestEventTime : null;
    }

    /**
     * The time at which the latest event from players occurs, in milliseconds.
     *
     * Returns `null` if there are no events yet.
     */
    get latestEventTime(): number | null {
        let latestEventTime = Number.POSITIVE_INFINITY;

        for (const manager of this.managers.values()) {
            // Skip managers that want to have their data presence ignored.
            if (manager.ignoreDataPresence) {
                continue;
            }

            latestEventTime = Math.min(
                latestEventTime,
                manager.latestEventTime ?? Number.POSITIVE_INFINITY,
            );
        }

        return Number.isFinite(latestEventTime) ? latestEventTime : null;
    }

    constructor() {
        for (const player of players.values()) {
            this.addPlayer(player);
        }
    }

    /**
     * Adds a player to the list of managers.
     *
     * @param player The player to add.
     */
    addPlayer(player: MultiplayerPlayer): void {
        if (this.managers.has(player.uid)) {
            return;
        }

        this.managers.set(player.uid, new SpectatorDataManager(player));
    }

    /**
     * Removes a player from the list of managers.
     *
     * @param uid The uid of the player.
     */
    removePlayer(uid: number): void {
        this.managers.delete(uid);
    }

    /**
     * Determines whether spectator data is available for all players at a given time.
     *
     * @param time The time.
     * @returns Whether spectator data is available for all players at the given time.
     */
    isAvailableAt(time: number): boolean {
        if (!parsedBeatmap) {
            return false;
        }

        // If the time is past the last object, always assume data is available.
        if (time >= parsedBeatmap.hitObjects.objects.at(-1)!.endTime) {
            return true;
        }

        let isAvailable = true;
        // Use pause duration to check the need to continue playing despite the lack of data.
        const playDespiteData = audioState.pauseDuration >= 15 * 1000;

        for (const manager of this.managers.values()) {
            if (!manager.isAvailableAt(time)) {
                if (playDespiteData) {
                    // Set to infinity until the next data comes.
                    manager.latestDataTime = Number.POSITIVE_INFINITY;
                } else {
                    isAvailable = false;
                    break;
                }
            }
        }

        return isAvailable;
    }

    /**
     * Adds spectator data for a player.
     *
     * @param data The data to add.
     * @returns Whether the data addition was successful.
     */
    processData(data: SpectatorData): boolean {
        const manager = this.managers.get(data.uid);

        if (!manager) {
            return false;
        }

        const { events } = manager;

        for (const objectData of data.hitObjectData) {
            events.objectData.add(new SpectatorObjectDataEvent(objectData));
        }

        for (let i = 0; i < data.cursorMovement.length; ++i) {
            const cursorMovement = data.cursorMovement[i];

            for (const cursorData of cursorMovement) {
                events.cursor[i].add(
                    new SpectatorCursorEvent(
                        cursorData.time,
                        new Vector2(
                            cursorData.position.x,
                            cursorData.position.y,
                        ),
                        cursorData.id,
                    ),
                );
            }
        }

        for (const event of data.events) {
            events.score.add(new SpectatorScoreEvent(event.time, event.score));
            events.accuracy.add(
                new SpectatorAccuracyEvent(event.time, event.accuracy),
            );
            events.combo.add(new SpectatorComboEvent(event.time, event.combo));
        }

        const mSecPassed = data.secPassed * 1000;

        events.syncedScore.add(
            new SpectatorSyncedScoreEvent(mSecPassed, data.currentScore),
        );

        events.syncedAccuracy.add(
            new SpectatorSyncedAccuracyEvent(mSecPassed, data.currentAccuracy),
        );

        events.syncedCombo.add(
            new SpectatorSyncedComboEvent(mSecPassed, data.currentCombo),
        );

        manager.latestDataTime = mSecPassed;
        console.log(
            "Received data from uid",
            manager.uid,
            "latest data time is set to",
            manager.latestDataTime,
        );
        return true;
    }
}
