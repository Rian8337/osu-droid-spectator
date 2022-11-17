import { resetAudio } from "../../elements/Audio";
import { reloadPreview } from "../../settings/PreviewSettings";
import { initProcessor } from "../../settings/SpectatorSettings";

/**
 * A handler responsible for handling round start events.
 */
export abstract class RoundStartHandler {
    /**
     * Handles the event when a round starts.
     */
    static handle(): void {
        console.log("Round started");

        reloadPreview();
        resetAudio(false);
        initProcessor();
    }
}
