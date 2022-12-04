import { audioState } from "../elements/Audio";
import { Circle, Slider, SliderTick, Vector2 } from "../osu-base";
import { parsedBeatmap } from "../settings/BeatmapSettings";
import { players } from "../settings/PlayerSettings";
import { SpectatorAccuracyEvent } from "./events/SpectatorAccuracyEvent";
import { SpectatorComboEvent } from "./events/SpectatorComboEvent";
import { SpectatorCursorEvent } from "./events/SpectatorCursorEvent";
import { SpectatorObjectDataEvent } from "./events/SpectatorObjectDataEvent";
import { SpectatorScoreEvent } from "./events/SpectatorScoreEvent";
import { HitResult } from "./structures/HitResult";
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
     * The time at which the earliest event occurs for this player.
     *
     * Returns `null` if there are no events yet.
     */
    get earliestEventTime(): number | null {
        let earliestEventTime = Number.POSITIVE_INFINITY;

        for (const manager of this.managers.values()) {
            earliestEventTime = Math.min(
                earliestEventTime,
                manager.earliestEventTime ?? Number.POSITIVE_INFINITY
            );
        }

        return Number.isFinite(earliestEventTime) ? earliestEventTime : null;
    }

    /**
     * The time at which the latest event occurs for this player.
     *
     * Returns `null` if there are no events yet.
     */
    get latestEventTime(): number | null {
        let latestEventTime = Number.NEGATIVE_INFINITY;

        for (const manager of this.managers.values()) {
            latestEventTime = Math.max(
                latestEventTime,
                manager.latestEventTime ?? Number.NEGATIVE_INFINITY
            );
        }

        return Number.isFinite(latestEventTime) ? latestEventTime : null;
    }

    constructor() {
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been loaded yet");
        }

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
     * Determines whether spectator data is available for all players at the given time.
     *
     * @param time The time.
     * @returns Whether spectator data is available for all players at the given time.
     */
    isAvailableAt(time: number): boolean {
        if (!parsedBeatmap) {
            return false;
        }

        // If the time is past the last object, always assume data is available.
        if (time > parsedBeatmap.hitObjects.objects.at(-1)!.endTime) {
            return true;
        }

        let isAvailable = true;
        // Use pause duration to check the need to continue playing despite the lack of data.
        const playDespiteData = audioState.pauseDuration >= 20 * 1000;

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
        if (!parsedBeatmap) {
            throw new Error("No beatmaps have been loaded yet");
        }

        const manager = this.managers.get(data.uid);

        if (!manager) {
            return false;
        }

        const { events } = manager;

        for (const objectData of data.hitObjectData) {
            const object = parsedBeatmap.hitObjects.objects[objectData.index];
            let time = object.endTime;

            if (object instanceof Circle) {
                if (
                    objectData.result !== HitResult.miss ||
                    objectData.accuracy !== 1e4
                ) {
                    time += objectData.accuracy;
                } else {
                    time += manager.maxHitWindow;
                }
            }

            if (object instanceof Slider) {
                // Infer combo and score from hit accuracy and tickset.
                let score = 0;
                let combo = 0;

                if (objectData.index > 0) {
                    const event = events.objectData.eventAtIndex(
                        objectData.index - 1
                    );

                    score = event?.currentScore ?? 0;
                    combo = event?.currentCombo ?? 0;
                }

                // Check for slider head break.
                if (
                    objectData.result !== HitResult.miss &&
                    objectData.accuracy !==
                        Math.floor(manager.maxHitWindow) + 13
                ) {
                    score += Math.floor(30 * manager.scoreMultiplier);
                    ++combo;
                } else {
                    combo = 0;
                }

                events.combo.add(
                    new SpectatorComboEvent(object.startTime, combo)
                );
                events.score.add(
                    new SpectatorScoreEvent(object.startTime, score)
                );

                // We don't need to include slider end since that's already accounted below.
                for (let i = 1; i < object.nestedHitObjects.length - 1; ++i) {
                    const nestedObject = object.nestedHitObjects[i];
                    const tickset = objectData.tickset[i - 1];

                    if (tickset) {
                        ++combo;

                        if (nestedObject instanceof SliderTick) {
                            score += Math.floor(10 * manager.scoreMultiplier);
                        } else {
                            // This must be a slider repeat.
                            score += Math.floor(30 * manager.scoreMultiplier);
                        }
                    } else {
                        combo = 0;
                    }

                    events.combo.add(
                        new SpectatorComboEvent(nestedObject.startTime, combo)
                    );
                    events.score.add(
                        new SpectatorScoreEvent(nestedObject.startTime, score)
                    );
                }
            }

            events.accuracy.add(
                new SpectatorAccuracyEvent(
                    time,
                    objectData.currentAccuracy,
                    objectData.index
                )
            );

            events.combo.add(
                new SpectatorComboEvent(time, objectData.currentCombo)
            );

            events.score.add(
                new SpectatorScoreEvent(time, objectData.currentScore)
            );

            events.objectData.add(
                new SpectatorObjectDataEvent(time, objectData)
            );
        }

        events.syncedScore.add(
            new SpectatorSyncedScoreEvent(
                data.secPassed * 1000,
                data.currentScore
            )
        );

        events.syncedAccuracy.add(
            new SpectatorSyncedAccuracyEvent(
                data.secPassed * 1000,
                data.currentAccuracy,
                events.accuracy.events.length - 1
            )
        );

        events.syncedCombo.add(
            new SpectatorSyncedComboEvent(
                data.secPassed * 1000,
                data.currentCombo
            )
        );

        for (let i = 0; i < data.cursorMovement.length; ++i) {
            const cursorMovement = data.cursorMovement[i];

            for (const cursorData of cursorMovement) {
                events.cursor[i].add(
                    new SpectatorCursorEvent(
                        cursorData.time,
                        new Vector2(
                            cursorData.position.x,
                            cursorData.position.y
                        ),
                        cursorData.id
                    )
                );
            }
        }

        manager.latestDataTime = data.secPassed * 1000;
        console.log(
            "Received data from uid",
            manager.uid,
            "latest data time is set to",
            manager.latestDataTime
        );
        return true;
    }
}
