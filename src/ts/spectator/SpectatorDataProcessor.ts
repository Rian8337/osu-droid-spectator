import {
    Beatmap,
    Circle,
    IModApplicableToDroid,
    Mod,
    ModUtil,
    Vector2,
} from "../osu-base";
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
        const manager = this.managers.get(uid);

        if (!manager) {
            return false;
        }

        manager.events.score.add({
            time: data.secPassed * 1000,
            score: data.currentScore,
        });

        manager.events.accuracy.add({
            time: data.secPassed * 1000,
            accuracy: data.currentAccuracy,
        });

        manager.events.combo.add({
            time: data.secPassed * 1000,
            combo: data.currentCombo,
        });

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

            manager.events.objectData.add({
                time: time,
                index: objectData.index,
                accuracy: objectData.accuracy,
                result: objectData.result,
                tickset: objectData.tickset,
                currentAccuracy: objectData.currentAccuracy,
                currentCombo: objectData.currentCombo,
                currentScore: objectData.currentScore,
            });
        }

        for (let i = 0; i < data.cursorMovement.length; ++i) {
            const cursorMovement = data.cursorMovement[i];

            for (const cursorData of cursorMovement) {
                manager.events.cursor[i].add({
                    time: cursorData.time,
                    position: new Vector2(
                        cursorData.position.x,
                        cursorData.position.y
                    ),
                    id: cursorData.id,
                });
            }
        }

        return true;
    }
}
