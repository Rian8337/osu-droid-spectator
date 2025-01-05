import JSZip from "jszip";
import { Beatmap } from "@rian8337/osu-base";
import { PickedBeatmap } from "../spectator/rawdata/PickedBeatmap";
import { mods, speedMultiplier } from "./RoomSettings";

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
 * The osu!droid star rating of the beatmap.
 */
export let droidStarRating: number | null = null;

/**
 * The osu!standard star rating of the beatmap.
 */
export let standardStarRating: number | null = null;

/**
 * The beatmapset that's currently used.
 */
export let beatmapset = new JSZip();

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
export function setParsedBeatmap(newParsedBeatmap: Beatmap | null): void {
    parsedBeatmap = newParsedBeatmap;
}

/**
 * Sets the osu!droid star rating.
 *
 * @param newDroidStarRating The osu!droid star rating.
 */
export function setDroidStarRating(newDroidStarRating: number | null): void {
    droidStarRating = newDroidStarRating;
}

/**
 * Sets the osu!standard star rating.
 *
 * @param newStandardStarRating The osu!standard star rating.
 */
export function setStandardStarRating(
    newStandardStarRating: number | null,
): void {
    standardStarRating = newStandardStarRating;
}

/**
 * Calculates the maximum osu!droid score of the currently picked beatmap.
 */
export function calculateMaxScore(): void {
    maxScore = parsedBeatmap?.maxDroidScore(mods, speedMultiplier) ?? 0;
}

/**
 * Resets the beatmapset.
 */
export function resetBeatmapset(): void {
    beatmapset = new JSZip();
}

/**
 * The controller that can be used to abort beatmapset downloads.
 */
export let downloadAbortController: AbortController | null = null;

/**
 * Downloads a beatmapset from Sayobot.
 *
 * @param setId The ID of the beatmapset.
 * @returns The downloaded beatmapset.
 */
export async function downloadBeatmapset(setId: number): Promise<Blob | null> {
    cancelBeatmapsetDownload();
    downloadAbortController = new AbortController();

    const downloadResponse = await fetch(
        `https://osu.direct/api/d/${setId.toString()}?noVideo=1`,
        { signal: downloadAbortController.signal },
    ).catch(() => null);

    if (
        !downloadResponse ||
        (downloadResponse.status >= 400 && downloadResponse.status < 200)
    ) {
        return null;
    }

    return downloadResponse.blob();
}

/**
 * Cancels the current beatmapset download.
 */
export function cancelBeatmapsetDownload(): void {
    downloadAbortController?.abort();
}
