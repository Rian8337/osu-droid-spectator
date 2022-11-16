import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "./MultiplayerState";

/**
 * A message received from the server when a player leaves the room.
 */
export interface PlayerLeftMessage
    extends BroadcastedMessage<MultiplayerState.playerLeft> {
    /**
     * The uid of the player who left.
     */
    readonly uid: number;
}

/**
 * Checks whether a broadcasted message is a player left message.
 *
 * @param message The message.
 */
export function isPlayerLeftMessage(
    message: BroadcastedMessage
): message is PlayerLeftMessage {
    return message.state === MultiplayerState.playerLeft;
}
