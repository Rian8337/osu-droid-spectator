import { resetAudio } from "../../elements/Audio";
import { removePreviewsFromScreen } from "../../settings/PreviewSettings";
import {
    initProcessor,
    initTeamScoreDisplay,
} from "../../settings/SpectatorSettings";

/**
 * A handler responsible for handling round start events.
 */
export abstract class RoundStartHandler {
    /**
     * Handles the event when a round starts.
     */
    static handle(): void {
        console.log("Round started");

        removePreviewsFromScreen();
        resetAudio(false);
        initTeamScoreDisplay();
        initProcessor();
    }
}
