/**
 * Represents the beatmap that is currently being picked by the host of the room.
 */
export interface PickedBeatmap {
    /**
     * The artist of this beatmap.
     */
    readonly artist: string;

    /**
     * The creator of this beatmap.
     */
    readonly creator: string;

    /**
     * The MD5 hash of this beatmap.
     */
    readonly md5: string;

    /**
     * The title of the beatmap.
     */
    readonly title: string;

    /**
     * The version (difficulty name) of this beatmap.
     */
    readonly version: string;

    /**
     * The beatmap set ID of this beatmap.
     */
    readonly beatmapSetId?: number;

    /**
     * The star rating of the beatmap.
     */
    readonly starRating?: number;
}
