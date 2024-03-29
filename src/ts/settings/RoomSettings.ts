import { IModApplicableToDroid, Mod, ModUtil } from "@rian8337/osu-base";
import { setAudioPlaybackRate } from "../elements/Audio";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";

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
