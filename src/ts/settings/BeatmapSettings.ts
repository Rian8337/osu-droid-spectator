import { Beatmap, MapStats } from "../osu-base";
import { PickedBeatmap } from "../spectator/rawdata/PickedBeatmap";

/**
 * The parsed beatmap from beatmap decoder.
 */
export let parsedBeatmap: Beatmap | null = null;

/**
 * The maximum score of the current beatmap.
 */
export let maxScore = 0;

/**
 * The beatmap that is currently being played.
 */
export let pickedBeatmap: PickedBeatmap | null = null;

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
 * Calculates the maximum osu!droid score of the currently picked beatmap.
 */
export function calculateMaxScore(): void {
    maxScore = parsedBeatmap?.maxDroidScore(new MapStats()) ?? 0;
}
