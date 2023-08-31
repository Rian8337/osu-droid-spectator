import { PickedBeatmap } from "../rawdata/PickedBeatmap";
import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";

/**
 * A message received from the server when the beatmap of the room was changed.
 */
export interface BeatmapChangedMessage
    extends BroadcastedMessage<MultiplayerState.beatmapChanged> {
    /**
     * The new beatmap.
     */
    readonly beatmap?: PickedBeatmap;
}

/**
 * Checks whether a broadcasted message is a beatmap changed message.
 *
 * @param message The message.
 */
export function isBeatmapChangedMessage(
    message: BroadcastedMessage,
): message is BeatmapChangedMessage {
    return message.state === MultiplayerState.beatmapChanged;
}
