import { Beatmap } from "../osu-base";
import { PickedBeatmap } from "../spectator/rawdata/PickedBeatmap";

/**
 * The parsed beatmap from beatmap decoder.
 */
export let parsedBeatmap: Beatmap | null = null;

/**
 * The beatmap that is currently being played.
 */
export let pickedBeatmap: PickedBeatmap | null = null;

/**
 * Whether the beatmap needs reloading for the next playback.
 */
export let beatmapNeedsReloading = false;

/**
 * Sets the picked beatmap.
 *
 * @param newPickedBeatmap The picked beatmap.
 */
export function setPickedBeatmap(newPickedBeatmap: PickedBeatmap | null): void {
    pickedBeatmap = newPickedBeatmap;
}

/**
 * Sets the parsed beatmap.
 *
 * @param newParsedBeatmap The parsed beatmap.
 */
export function setParsedBeatmap(newParsedBeatmap: Beatmap): void {
    parsedBeatmap = newParsedBeatmap;
}

/**
 * Sets the beatmap needs reloading flag.
 *
 * @param value The value.
 */
export function setBeatmapNeedsReloading(value: boolean): void {
    beatmapNeedsReloading = value;
}
