import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "./MultiplayerState";

/**
 * A message received from the server when the speed multiplier of the room was changed.
 */
export interface SpeedMultiplierChangedMessage
    extends BroadcastedMessage<MultiplayerState.speedMultiplierChanged> {
    /**
     * The new speed multiplier value.
     */
    readonly value: number;
}

/**
 * Checks whether a broadcasted message is a required mods changed message.
 *
 * @param message The message.
 */
export function isSpeedMultiplierChangedMessage(
    message: BroadcastedMessage
): message is SpeedMultiplierChangedMessage {
    return message.state === MultiplayerState.speedMultiplierChanged;
}
