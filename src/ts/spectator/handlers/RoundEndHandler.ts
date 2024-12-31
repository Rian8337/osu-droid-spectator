import { audioState } from "../../elements/Audio";
import { previews } from "../../settings/PreviewSettings";
import { infoDisplay } from "../../settings/SpectatorSettings";
import { ChatMessageHandler } from "./ChatMessageHandler";

/**
 * A handler responsible for handling round end events.
 */
export abstract class RoundEndHandler {
    /**
     * Handles the event when a round ends.
     */
    static handle() {
        audioState.audio.addEventListener(
            "ended",
            () => {
                ChatMessageHandler.onRoundEnd();

                // Ensure previews are in the latest state.
                for (const preview of previews.values()) {
                    preview.at(Number.POSITIVE_INFINITY);
                }

                infoDisplay.draw(Number.POSITIVE_INFINITY);
            },
            { once: true },
        );
    }
}
