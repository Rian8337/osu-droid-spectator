import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";

/**
 * A message received from the server when a round starts.
 */
export type RoundStartedMessage =
    BroadcastedMessage<MultiplayerState.roundStarted>;

/**
 * Checks whether a broadcasted message is a required mods changed message.
 *
 * @param message The message.
 */
export function isRoundStartedMessage(
    message: BroadcastedMessage
): message is RoundStartedMessage {
    return message.state === MultiplayerState.roundStarted;
}
