import {
    Beatmap,
    Circle,
    IModApplicableToDroid,
    Mod,
    ModUtil,
    Slider,
    SliderTick,
    Vector2,
} from "../osu-base";
import { SpectatorAccuracyEvent } from "./events/SpectatorAccuracyEvent";
import { SpectatorComboEvent } from "./events/SpectatorComboEvent";
import { SpectatorCursorEvent } from "./events/SpectatorCursorEvent";
import { SpectatorObjectDataEvent } from "./events/SpectatorObjectDataEvent";
import { SpectatorScoreEvent } from "./events/SpectatorScoreEvent";
import { HitResult } from "./rawdata/HitResult";
import { PlayerInfo } from "./rawdata/PlayerInfo";
import { SpectatorData } from "./rawdata/SpectatorData";
import { SpectatorDataManager } from "./SpectatorDataManager";

/**
 * A handler for holding and processing spectator data.
 */
export class SpectatorDataProcessor {
    /**
     * The managers of spectator data, mapped by players' uid.
     */
    readonly managers = new Map<number, SpectatorDataManager>();

    /**
     * The beatmap being played by the players.
     */
    readonly beatmap: Beatmap;

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
            latestEventTime = Math.min(
                latestEventTime,
                manager.latestEventTime ?? Number.NEGATIVE_INFINITY
            );
        }

        return Number.isFinite(latestEventTime) ? latestEventTime : null;
    }

    constructor(beatmap: Beatmap, playerInfo: PlayerInfo[]) {
        this.beatmap = beatmap;
        this.reset(playerInfo);
    }

    /**
     * Determines whether spectator data is available for all players at the given time.
     *
     * @param time The time.
     * @returns Whether spectator data is available for all players at the given time.
     */
    isAvailableAt(time: number): boolean {
        for (const manager of this.managers.values()) {
            if (!manager.isAvailableAt(time)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Resets the state of this processor.
     *
     * @param playerInfo The new players. If specified, managers will be reloaded.
     */
    reset(playerInfo?: PlayerInfo[]): void {
        if (playerInfo) {
            for (const player of playerInfo) {
                this.managers.set(
                    player.uid,
                    new SpectatorDataManager(
                        this.beatmap,
                        player,
                        <(Mod & IModApplicableToDroid)[]>(
                            ModUtil.pcStringToMods(player.mods)
                        )
                    )
                );
            }
        } else {
            for (const manager of this.managers.values()) {
                manager.reset();
            }
        }
    }

    /**
     * Adds spectator data for a player.
     *
     * @param uid The uid of the player.
     * @param data The data to add.
     * @returns Whether the data addition was successful.
     */
    processData(uid: number, data: SpectatorData): boolean {
        console.log("Received data from uid", uid);
        const manager = this.managers.get(uid);

        if (!manager) {
            return false;
        }

        const { events } = manager;

        for (const objectData of data.hitObjectData) {
            const object = this.beatmap.hitObjects.objects[objectData.index];
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
                const prevObject =
                    this.beatmap.hitObjects.objects[objectData.index - 1];

                if (prevObject) {
                    score =
                        events.score.eventAt(prevObject.endTime)?.score ?? 0;
                    combo =
                        events.combo.eventAt(prevObject.endTime)?.combo ?? 0;
                }

                // Check for slider head break.
                if (objectData.accuracy !== manager.maxHitWindow + 13) {
                    score += 30 * manager.scoreMultiplier;
                    ++combo;
                } else {
                    combo = 0;
                }

                events.combo.add(
                    new SpectatorComboEvent(object.startTime, combo)
                );
                events.score.add(
                    new SpectatorScoreEvent(object.startTime, combo)
                );

                // We don't need to include slider end since that's already accounted below.
                for (let i = 1; i < object.nestedHitObjects.length - 1; ++i) {
                    const nestedObject = object.nestedHitObjects[i];
                    const tickset = objectData.tickset[i - 1];

                    if (tickset) {
                        ++combo;

                        if (nestedObject instanceof SliderTick) {
                            score += 10 * manager.scoreMultiplier;
                        } else {
                            // This must be a slider repeat.
                            score += 30 * manager.scoreMultiplier;
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
                    objectData.currentAccuracy
                )
            );

            events.combo.add(
                new SpectatorComboEvent(time, objectData.currentCombo)
            );

            events.score.add(
                new SpectatorScoreEvent(time, objectData.currentScore)
            );

            events.objectData.add(
                new SpectatorObjectDataEvent(
                    time,
                    objectData.index,
                    objectData.accuracy,
                    objectData.tickset,
                    objectData.result
                )
            );
        }

        events.score.add(
            new SpectatorScoreEvent(data.secPassed * 1000, data.currentScore)
        );

        events.accuracy.add(
            new SpectatorAccuracyEvent(
                data.secPassed * 1000,
                data.currentAccuracy
            )
        );

        events.combo.add(
            new SpectatorComboEvent(data.secPassed * 1000, data.currentCombo)
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

        console.log("Processing done!");
        return true;
    }
}
