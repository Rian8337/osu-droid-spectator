import { setAudioPlaybackRate } from "../elements/Audio";
import { IModApplicableToDroid, Mod, ModUtil } from "../osu-base";
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
 * The combination of mods that are required to be played.
 */
export let mods: (Mod & IModApplicableToDroid)[] = [];

/**
 * The team mode.
 */
export let teamMode = MultiplayerTeamMode.headToHead;

/**
 * The force AR to be used.
 */
export let forcedAR: number | null = null;

/**
 * Sets the room ID.
 *
 * @param newRoomId The new room ID.
 */
export function setRoomId(newRoomId: string): void {
    roomId = newRoomId;
}

/**
 * Sets the required mods.
 *
 * @param newMods The required mods.
 */
export function setMods(newMods: string): void {
    mods = ModUtil.droidStringToMods(newMods);

    setAudioPlaybackRate();
}

/**
 * Sets the speed multiplier.
 *
 * @param value The value.
 */
export function setSpeedMultiplier(value: number): void {
    speedMultiplier = value;

    setAudioPlaybackRate();
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
 * Sets the force AR value.
 *
 * @param value The value.
 */
export function setForcedAR(value: number | null): void {
    forcedAR = value;
}
