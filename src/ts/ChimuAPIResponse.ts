/**
 * Represents a response received from Chimu's API.
 */
export interface ChimuAPIResponse {
    readonly BeatmapId: number;
    readonly ParentSetId: number;
    readonly DiffName: string;
    readonly FileMD5: string;
    readonly Mode: number;
    readonly BPM: number;
    readonly AR: number;
    readonly OD: number;
    readonly CS: number;
    readonly HP: number;
    readonly TotalLength: number;
    readonly HitLength: number;
    readonly Playcount: number;
    readonly Passcount: number;
    readonly MaxCombo: number;
    readonly DifficultyRating: number;
    readonly OsuFile: string;
    readonly DownloadPath: string;
}
