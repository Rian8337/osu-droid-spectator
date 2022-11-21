import { DrawableTeamScoreDisplay } from "../drawables/DrawableTeamScoreDisplay";
import { FayeClientManager } from "../spectator/FayeClientManager";
import { SpectatorDataProcessor } from "../spectator/SpectatorDataProcessor";
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
 * The team score display. Not `null` if the team mode is TeamVS.
 */
export let teamScoreDisplay: DrawableTeamScoreDisplay | null = null;

export const teamColors = {
    red: "#ff7070",
    blue: "#566df5",
};

/**
 * Resets the spectator data processor.
 */
export function resetProcessor(): void {
    dataProcessor = null;
}

/**
 * Initializes the spectator data processor.
 */
export function initProcessor(): void {
    dataProcessor = new SpectatorDataProcessor();
}

/**
 * Initializes the team score display.
 */
export function initTeamScoreDisplay(): void {
    if (teamMode === MultiplayerTeamMode.headToHead) {
        teamScoreDisplay?.delete();
        teamScoreDisplay = null;
    } else {
        teamScoreDisplay = new DrawableTeamScoreDisplay();
    }
}
