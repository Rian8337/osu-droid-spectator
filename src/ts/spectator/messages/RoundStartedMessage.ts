import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";
import { MultiplayerRoom } from "../rawdata/MultiplayerRoom";

/**
 * A message received from the server when a round starts.
 */
export interface RoundStartedMessage
    extends BroadcastedMessage<MultiplayerState.roundStarted> {
    /**
     * The room state when the round started.
     */
    readonly room: MultiplayerRoom;
}

/**
 * Checks whether a broadcasted message is a required mods changed message.
 *
 * @param message The message.
 */
export function isRoundStartedMessage(
    message: BroadcastedMessage,
): message is RoundStartedMessage {
    return message.state === MultiplayerState.roundStarted;
}
