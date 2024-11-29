import { audioState } from "../elements/Audio";
import { Vector2 } from "@rian8337/osu-base";
import { parsedBeatmap } from "../settings/BeatmapSettings";
import { players } from "../settings/PlayerSettings";
import { SpectatorAccuracyEvent } from "./events/SpectatorAccuracyEvent";
import { SpectatorComboEvent } from "./events/SpectatorComboEvent";
import { SpectatorCursorEvent } from "./events/SpectatorCursorEvent";
import { SpectatorObjectDataEvent } from "./events/SpectatorObjectDataEvent";
import { SpectatorScoreEvent } from "./events/SpectatorScoreEvent";
import { MultiplayerPlayer } from "./structures/MultiplayerPlayer";
import { SpectatorDataManager } from "./managers/SpectatorDataManager";
import { SpectatorSyncedScoreEvent } from "./events/SpectatorSyncedScoreEvent";
import { SpectatorSyncedAccuracyEvent } from "./events/SpectatorSyncedAccuracyEvent";
import { SpectatorSyncedComboEvent } from "./events/SpectatorSyncedComboEvent";
import { MovementType } from "./structures/MovementType";
import { HitResult } from "./structures/HitResult";
import { SpectatorClickEvent } from "./events/SpectatorClickCounterEvent";

interface Counter {
    counter: number;
}

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

    /**
     * Resets this processor to the current players.
     */
    reset() {
        this.managers.clear();
    }

    /**
     * Adds all players to the list of managers.
     */
    addPlayers() {
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
     * Processes spectator data of a player.
     *
     * @param uid The uid of the player.
     * @param data The data to add.
     * @returns Whether the data addition was successful.
     */
    process(uid: number, data: ArrayBuffer): boolean {
        const manager = this.managers.get(uid);

        if (!manager) {
            return false;
        }

        const { events } = manager;
        const view = new DataView(data);
        const counter: Counter = { counter: 0 };

        //#region Parse seconds passed, current score, combo, acc
        const mSecPassed = this.readFloat(view, counter) * 1000;

        events.syncedScore.add(
            new SpectatorSyncedScoreEvent(
                mSecPassed,
                this.readInt(view, counter),
            ),
        );

        events.syncedCombo.add(
            new SpectatorSyncedComboEvent(
                mSecPassed,
                this.readInt(view, counter),
            ),
        );

        events.syncedAccuracy.add(
            new SpectatorSyncedAccuracyEvent(
                mSecPassed,
                this.readFloat(view, counter),
            ),
        );
        //#endregion

        //#region Parse movement data
        const cursorAmount = this.readInt(view, counter);

        for (let i = 0; i < cursorAmount; ++i) {
            const moveSize = this.readInt(view, counter);

            for (let j = 0; j < moveSize; ++j) {
                let time = this.readInt(view, counter);
                const id: MovementType = time & 3;
                time >>= 2;

                events.cursors[i].add(
                    new SpectatorCursorEvent(
                        time,
                        new Vector2(
                            id !== MovementType.up
                                ? this.readFloat(view, counter)
                                : -1,
                            id !== MovementType.up
                                ? this.readFloat(view, counter)
                                : -1,
                        ),
                        id,
                    ),
                );

                if (id === MovementType.down) {
                    events.clicks[i].add(new SpectatorClickEvent(time));
                }
            }
        }
        //#endregion

        //#region Parse object result data
        const objectDataSize = this.readInt(view, counter);

        for (let i = 0; i < objectDataSize; ++i) {
            const index = this.readInt(view, counter);
            const time = this.readDouble(view, counter);
            const accuracy = this.readShort(view, counter);
            const tickset: boolean[] = [];

            const len = this.readByte(view, counter);

            if (len > 0) {
                const bytes: number[] = [];

                for (let j = 0; j < len; ++j) {
                    bytes.push(this.readByte(view, counter));
                }

                for (let j = 0; j < len * 8; ++j) {
                    tickset[j] =
                        // Int/int division in Java; numbers must be truncated to get actual number
                        (bytes[len - Math.trunc(j / 8) - 1] &
                            (1 << Math.trunc(j % 8))) !==
                        0;
                }
            }

            const result: HitResult = this.readByte(view, counter);

            events.objectData.add(
                new SpectatorObjectDataEvent({
                    index: index,
                    time: time,
                    accuracy: accuracy,
                    tickset: tickset,
                    result: result,
                }),
            );
        }
        //#endregion

        //#region Parse events
        const eventsSize = this.readInt(view, counter);

        for (let i = 0; i < eventsSize; ++i) {
            const time = this.readFloat(view, counter);

            events.score.add(
                new SpectatorScoreEvent(time, this.readInt(view, counter)),
            );
            events.combo.add(
                new SpectatorComboEvent(time, this.readInt(view, counter)),
            );
            events.accuracy.add(
                new SpectatorAccuracyEvent(time, this.readFloat(view, counter)),
            );
        }
        //#endregion

        manager.latestDataTime = mSecPassed;

        console.log(
            "Received data from uid",
            uid,
            "latest data time is set to",
            manager.latestDataTime,
        );

        return true;
    }

    private readByte(view: DataView, counter: Counter) {
        const num = view.getInt8(counter.counter);
        counter.counter += 1;

        return num;
    }

    private readShort(view: DataView, counter: Counter) {
        const num = view.getInt16(counter.counter);
        counter.counter += 2;

        return num;
    }

    private readInt(view: DataView, counter: Counter) {
        const num = view.getInt32(counter.counter);
        counter.counter += 4;

        return num;
    }

    private readFloat(view: DataView, counter: Counter) {
        const num = view.getFloat32(counter.counter);
        counter.counter += 4;

        return num;
    }

    private readDouble(view: DataView, counter: Counter) {
        const num = view.getFloat64(counter.counter);
        counter.counter += 8;

        return num;
    }
}
