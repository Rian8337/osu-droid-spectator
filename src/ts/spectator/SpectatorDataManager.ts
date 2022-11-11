import { IModApplicableToDroid, Mod } from "../osu-base";
import { PlayerInfo } from "./rawdata/PlayerInfo";
import { SpectatorEventManager } from "./SpectatorEventManager";
import { SpectatorEventManagers } from "./SpectatorEventManagers";

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

    constructor(playerInfo: PlayerInfo, mods: (Mod & IModApplicableToDroid)[]) {
        this.uid = playerInfo.uid;
        this.username = playerInfo.username;
        this.mods = mods;
        this.events = {
            accuracy: new SpectatorEventManager(),
            combo: new SpectatorEventManager(),
            cursor: [],
            objectData: new SpectatorEventManager(),
            score: new SpectatorEventManager(),
        };

        for (let i = 0; i < 10; ++i) {
            this.events.cursor.push(new SpectatorEventManager());
        }
    }
}
