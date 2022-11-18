import { BroadcastedMessage } from "./BroadcastedMessage";
import { MultiplayerState } from "../structures/MultiplayerState";

/**
 * A message received from the server when mod multipliers of the room were changed.
 */
export interface ModMultiplierChangedMessage
    extends BroadcastedMessage<MultiplayerState.modMultiplierChanged> {
    /**
     * The new mod multipliers.
     */
    readonly multipliers: Record<string, number>;
}

/**
 * Checks whether a broadcasted message is a mod multiplier changed message.
 *
 * @param message The message.
 */
export function isModMultiplierChangedMessage(
    message: BroadcastedMessage
): message is ModMultiplierChangedMessage {
    return message.state === MultiplayerState.modMultiplierChanged;
}
