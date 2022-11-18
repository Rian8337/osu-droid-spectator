import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";

/**
 * The ID of the room.
 */
export let roomId = "";

/**
 * The custom speed multiplier to be used.
 */
export let speedMultiplier = 1;

/**
 * Custom mod multipliers that overrides the client's default mod multiplier.
 *
 * Each mod is mapped to their own mod multiplier.
 */
export let modMultipliers: Record<string, number> = {};

/**
 * The combination of mods that are required to be played.
 */
export let requiredMods = "";

/**
 * Settings for force AR.
 */
export const forcedAR = {
    /**
     * Whether players are allowed to use force AR.
     */
    allowed: false,

    /**
     * The allowable minimum value of force AR if it is allowed.
     */
    minValue: 0,

    /**
     * The allowable maximum value of force AR if it is allowed.
     */
    maxValue: 12.5,
};

/**
 * The team mode.
 */
export let teamMode = MultiplayerTeamMode.headToHead;

/**
 * The score portion if the win condition is ScoreV2.
 */
export let scorePortion = 0.4;

/**
 * Sets the room ID.
 *
 * @param newRoomId The new room ID.
 */
export function setRoomId(newRoomId: string): void {
    roomId = newRoomId;
}

/**
 * Sets the mod multipliers.
 *
 * @param newMultipliers The new multipliers.
 */
export function setModMultipliers(
    newMultipliers: Record<string, number>
): void {
    modMultipliers = newMultipliers;
}

/**
 * Sets the required mods.
 *
 * @param mods The required mods.
 */
export function setRequiredMods(mods: string): void {
    requiredMods = mods;
}

/**
 * Sets the speed multiplier.
 *
 * @param value The value.
 */
export function setSpeedMultiplier(value: number): void {
    speedMultiplier = value;
}

/**
 * Sets the usage rule of force AR.
 *
 * @param allow Whether to allow force AR.
 */
export function setForceARAllowRule(allow: boolean): void {
    forcedAR.allowed = allow;
}

/**
 * Sets the minimum value of force AR.
 *
 * @param value The value.
 */
export function setForceARMinimumValue(value: number): void {
    forcedAR.minValue = value;
}

/**
 * Sets the maximum value of force AR.
 *
 * @param value The value.
 */
export function setForceARMaximumValue(value: number): void {
    forcedAR.maxValue = value;
}

/**
 * Sets the team mode.
 *
 * @param mode The team mode.
 */
export function setTeamMode(mode: MultiplayerTeamMode): void {
    teamMode = mode;
}

/**
 * Sets the score portion value.
 *
 * @param value The value.
 */
export function setScorePortion(value: number): void {
    scorePortion = value;
}
