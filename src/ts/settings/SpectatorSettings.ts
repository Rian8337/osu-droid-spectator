import { DrawableTeamScoreDisplay } from "../drawables/DrawableTeamScoreDisplay";
import { FayeClientManager } from "../spectator/FayeClientManager";
import { SpectatorDataProcessor } from "../spectator/SpectatorDataProcessor";
import { HitResult } from "../spectator/structures/HitResult";
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

/**
 * Colors for each team.
 */
export const teamColors = {
    red: "#ff7070",
    blue: "#566df5",
};

/**
 * Colors for each hit result.
 *
 * These colors are taken from osu!lazer [(source code)](https://github.com/ppy/osu/blob/daae560ff731bdf49970a5bc6588c0861fac760f/osu.Game/Graphics/OsuColour.cs#L105-L131).
 */
export const hitResultColors: Record<HitResult, string> = {
    [HitResult.great]: "#66ccff",
    [HitResult.good]: "#b3d944",
    [HitResult.meh]: "#ffcc22",
    [HitResult.miss]: "#ed1121",
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
