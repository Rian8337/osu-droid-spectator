import { audioState } from "../../elements/Audio";
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
            },
            { once: true },
        );
    }
}
