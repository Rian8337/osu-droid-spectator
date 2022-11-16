import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "./MultiplayerState";

/**
 * A message received from the server when the room was closed.
 */
export type RoomClosedMessage = BroadcastedMessage<MultiplayerState.roomClosed>;

/**
 * Checks whether a broadcasted message is a required mods changed message.
 *
 * @param message The message.
 */
export function isRoomClosedMessage(
    message: BroadcastedMessage
): message is RoomClosedMessage {
    return message.state === MultiplayerState.roomClosed;
}
