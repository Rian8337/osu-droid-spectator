import { audioState } from "../../elements/Audio";
import { setIsPlaying } from "../../settings/SpectatorSettings";
import { ChatMessageHandler } from "./ChatMessageHandler";

/**
 * A handler responsible for handling round end events.
 */
export abstract class RoundEndHandler {
    /**
     * Handles the event when a round ends.
     */
    static handle() {
        setIsPlaying(false);

        audioState.audio.addEventListener(
            "ended",
            ChatMessageHandler.showChat,
            { once: true },
        );
    }
}
