import { FayeClientManager } from "../spectator/FayeClientManager";
import { SpectatorDataProcessor } from "../spectator/SpectatorDataProcessor";

/**
 * The Faye client manager.
 */
export const fayeClient = new FayeClientManager();

/**
 * The spectator data processor.
 */
export let dataProcessor: SpectatorDataProcessor | null = null;

/**
 * Initializes the spectator data processor.
 */
export function initProcessor(): void {
    dataProcessor = new SpectatorDataProcessor();
}
