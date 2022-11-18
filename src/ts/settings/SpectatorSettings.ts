import { DrawableTeamScoreCounter } from "../drawables/counters/DrawableTeamScoreCounter";
import { FayeClientManager } from "../spectator/FayeClientManager";
import { SpectatorDataProcessor } from "../spectator/SpectatorDataProcessor";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";
import { teamMode } from "./RoomSettings";

/**
 * The Faye client manager.
 */
export const fayeClient = new FayeClientManager();

/**
 * The spectator data processor.
 */
export let dataProcessor: SpectatorDataProcessor | null = null;

/**
 * Team score counters. Only displayed if the team mode is TeamVS.
 */
export const teamScoreCounters = new Map<
    MultiplayerTeam,
    DrawableTeamScoreCounter
>();

export const teamColors = {
    red: "#ff7070",
    blue: "#566df5",
};

/**
 * Initializes the spectator data processor.
 */
export function initProcessor(): void {
    dataProcessor = new SpectatorDataProcessor();
}

/**
 * Initializes team score counters.
 */
export function initTeamScoreCounters(): void {
    for (const counter of teamScoreCounters.values()) {
        counter.delete();
    }

    if (teamMode === MultiplayerTeamMode.headToHead) {
        teamScoreCounters.clear();
    } else {
        teamScoreCounters.set(
            MultiplayerTeam.red,
            new DrawableTeamScoreCounter(MultiplayerTeam.red)
        );
        teamScoreCounters.set(
            MultiplayerTeam.blue,
            new DrawableTeamScoreCounter(MultiplayerTeam.blue)
        );
    }
}
