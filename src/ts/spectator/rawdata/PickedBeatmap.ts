/**
 * Represents the beatmap that is currently being picked by the host of the room.
 */
export interface PickedBeatmap {
    /**
     * The beatmapset ID of the beatmap.
     */
    readonly beatmapSetId?: number;

    /**
     * The MD5 hash of the beatmap.
     */
    readonly hash: string;
}
