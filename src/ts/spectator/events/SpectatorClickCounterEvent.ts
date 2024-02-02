import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted whenever a player gives a `MovementType.down` click.
 */
export class SpectatorClickEvent extends SpectatorEvent {
    override isRedundant(existing: SpectatorEvent): boolean {
        return this.time === existing.time;
    }
}
