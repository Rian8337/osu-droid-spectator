import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";

/**
 * A message received from the server when the score portion of the room was changed.
 */
export interface ScorePortionChangedMessage
    extends BroadcastedMessage<MultiplayerState.scorePortionChanged> {
    /**
     * The new score portion value.
     */
    readonly value: number;
}

/**
 * Checks whether a broadcasted message is a required mods changed message.
 *
 * @param message The message.
 */
export function isScorePortionChangedMessage(
    message: BroadcastedMessage
): message is ScorePortionChangedMessage {
    return message.state === MultiplayerState.scorePortionChanged;
}
