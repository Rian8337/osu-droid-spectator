import { ModMap, ModUtil, SerializedMod } from "@rian8337/osu-base";
import { setAudioPlaybackRate } from "../elements/Audio";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";

/**
 * The combination of mods that are required to be played.
 */
export let mods = new ModMap();

/**
 * The team mode.
 */
export let teamMode = MultiplayerTeamMode.headToHead;

/**
 * Sets the required mods.
 *
 * @param newMods The required mods.
 */
export function setMods(newMods: SerializedMod[]): void {
    mods = ModUtil.deserializeMods(newMods);

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
